"""
Lightweight KYC verification API for Render 512MB free tier.
- OCR: pytesseract (Tesseract) instead of EasyOCR to reduce RAM.
- Face: DeepFace with Facenet512 (faster/lighter than VGG-Face).
- Passport: passporteye / mrz for MRZ.
POST /verify: id_doc, selfie, doc_type -> { status, confidence, data, reason }.
"""
from __future__ import annotations

import os
import tempfile
from typing import Literal

# Low RAM: reduce TF memory growth and avoid GPU
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
os.environ.setdefault("CUDA_VISIBLE_DEVICES", "")
os.environ.setdefault("TF_FORCE_GPU_ALLOW_GROWTH", "true")

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="KYC Verification API (Lightweight)", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def run_face_verify(id_path: str, selfie_path: str) -> tuple[bool, float]:
    """Face match: Facenet512 is lighter and faster than VGG-Face for 512MB RAM."""
    from deepface import DeepFace
    result = DeepFace.verify(
        id_path,
        selfie_path,
        model_name="Facenet512",
        enforce_detection=False,
        detector_backend="opencv",
    )
    verified = result.get("verified", False)
    distance = float(result.get("distance", 1.0))
    confidence = max(0.0, min(1.0, 1.0 - distance))
    return verified, confidence


def run_ocr_id(image_path: str) -> list[str]:
    """ID card text via pytesseract (uses system Tesseract; much less RAM than EasyOCR)."""
    import pytesseract
    text = pytesseract.image_to_string(image_path)
    lines = [ln.strip() for ln in (text or "").splitlines() if ln.strip()]
    return lines


def extract_mrz_passport(image_path: str) -> dict:
    """Passport MRZ via passporteye (optional mrz fallback)."""
    out = {"name": None, "country": None, "dob": None, "expiry": None, "raw_mrz": None}
    try:
        from passporteye import read_mrz
        mrz_data = read_mrz(image_path)
        if mrz_data is not None:
            surname = (getattr(mrz_data, "surname", None) or "").strip()
            names = (getattr(mrz_data, "names", None) or "").strip()
            out["name"] = f"{surname} {names}".strip() or None
            out["country"] = getattr(mrz_data, "country", None) or getattr(mrz_data, "nationality", None)
            out["dob"] = getattr(mrz_data, "date_of_birth", None)
            out["expiry"] = getattr(mrz_data, "expiration_date", None)
            out["raw_mrz"] = str(mrz_data) if mrz_data else None
            return out
    except Exception:
        pass
    try:
        import mrz
        if hasattr(mrz, "read_mrz"):
            m = mrz.read_mrz(image_path)
            if m:
                out["name"] = getattr(m, "name", None) or getattr(m, "surname", "")
                out["country"] = getattr(m, "country", None)
                out["dob"] = getattr(m, "date_of_birth", None)
                out["expiry"] = getattr(m, "expiration_date", None)
                out["raw_mrz"] = str(m)
    except Exception:
        pass
    return out


APPROVE_THRESHOLD = 0.7


def _is_image(ct: str | None) -> bool:
    return bool(ct and (ct.startswith("image/") or ct == "application/octet-stream"))


@app.post("/verify")
async def verify(
    id_doc: UploadFile = File(None, description="ID or passport image (or use id_card)"),
    id_card: UploadFile = File(None, description="Alias for id_doc"),
    selfie: UploadFile = File(..., description="Selfie image"),
    doc_type: str = Form("id", description="'id' or 'passport'"),
) -> dict:
    """
    Returns: { status: "approved"|"rejected", confidence: float, data: {}, reason?: str }.
    """
    doc_type = (doc_type or "id").strip().lower()
    if doc_type not in ("id", "passport"):
        doc_type = "id"

    doc_file = id_doc if id_doc and id_doc.filename else id_card
    if not doc_file:
        raise HTTPException(400, "Provide id_doc or id_card")
    if not _is_image(doc_file.content_type):
        raise HTTPException(400, "id_doc/id_card must be an image")
    if not _is_image(selfie.content_type):
        raise HTTPException(400, "selfie must be an image")

    id_bytes = await doc_file.read()
    selfie_bytes = await selfie.read()
    if not id_bytes or not selfie_bytes:
        raise HTTPException(400, "Empty file(s)")

    suf = ".jpg"
    with tempfile.NamedTemporaryFile(suffix=suf, delete=False) as f1:
        f1.write(id_bytes)
        id_path = f1.name
    with tempfile.NamedTemporaryFile(suffix=suf, delete=False) as f2:
        f2.write(selfie_bytes)
        selfie_path = f2.name

    reason: str | None = None
    data: dict = {"doc_type": doc_type}

    try:
        try:
            verified, confidence = run_face_verify(id_path, selfie_path)
        except Exception as e:
            reason = f"Face verification failed: {e}"
            return {
                "status": "rejected",
                "confidence": 0.0,
                "data": data,
                "extracted_data": data,
                "reason": reason,
            }

        if doc_type == "passport":
            mrz_out = extract_mrz_passport(id_path)
            data["name"] = mrz_out.get("name")
            data["country"] = mrz_out.get("country")
            data["dob"] = mrz_out.get("dob")
            data["expiry"] = mrz_out.get("expiry")
            data["raw_mrz"] = mrz_out.get("raw_mrz")
        else:
            ocr_lines = run_ocr_id(id_path)
            data["ocr_text"] = ocr_lines
            data["name"] = ocr_lines[0] if ocr_lines else None

        status: Literal["approved", "rejected"] = (
            "approved" if (verified and confidence >= APPROVE_THRESHOLD) else "rejected"
        )
        if status == "rejected" and not verified:
            reason = "Face match failed or below threshold"

        resp: dict = {
            "status": status,
            "confidence": round(confidence, 4),
            "data": data,
            "extracted_data": data,  # frontend compatibility
        }
        if reason:
            resp["reason"] = reason
        return resp
    finally:
        for p in (id_path, selfie_path):
            try:
                os.unlink(p)
            except OSError:
                pass


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
