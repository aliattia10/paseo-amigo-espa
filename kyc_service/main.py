"""
Custom KYC verification API.
POST /verify: accepts id_card and selfie (multipart/form-data).
Uses DeepFace (VGG-Face) for face match and EasyOCR for ID text.
"""
import os
import tempfile
from typing import Literal

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="KYC Verification API", version="1.0.0")

# Allow localhost:3000 (Vite) to call localhost:8000
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy-load heavy deps to speed up startup
_ocr_reader = None
def get_ocr_reader():
    global _ocr_reader
    if _ocr_reader is None:
        import easyocr
        _ocr_reader = easyocr.Reader(["en"], gpu=False, verbose=False)
    return _ocr_reader


def run_face_verify(id_path: str, selfie_path: str) -> tuple[bool, float]:
    """Compare ID face vs selfie with DeepFace (VGG-Face). Returns (verified, distance)."""
    from deepface import DeepFace
    result = DeepFace.verify(
        id_path,
        selfie_path,
        model_name="VGG-Face",
        enforce_detection=False,
        detector_backend="opencv",
    )
    verified = result.get("verified", False)
    distance = float(result.get("distance", 1.0))
    # distance is lower when more similar; convert to a "confidence" in 0..1
    confidence = max(0.0, min(1.0, 1.0 - distance))
    return verified, confidence


def run_ocr(image_path: str) -> list[str]:
    """Extract text lines from ID image."""
    reader = get_ocr_reader()
    results = reader.readtext(image_path, detail=0)
    return [str(line).strip() for line in results if line and str(line).strip()]


# Threshold above which we auto-approve; below = manual_review
APPROVE_THRESHOLD = 0.7


@app.post("/verify")
async def verify(
    id_card: UploadFile = File(..., description="ID card image"),
    selfie: UploadFile = File(..., description="Selfie image"),
) -> dict:
    """
    Verify identity: face match (ID vs selfie) + OCR on ID.
    Returns status (approved | manual_review), confidence, ocr_text.
    """
    if not id_card.content_type or not id_card.content_type.startswith("image/"):
        raise HTTPException(400, "id_card must be an image")
    if not selfie.content_type or not selfie.content_type.startswith("image/"):
        raise HTTPException(400, "selfie must be an image")

    id_bytes = await id_card.read()
    selfie_bytes = await selfie.read()
    if not id_bytes or not selfie_bytes:
        raise HTTPException(400, "Empty file(s)")

    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f_id:
        f_id.write(id_bytes)
        id_path = f_id.name
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f_selfie:
        f_selfie.write(selfie_bytes)
        selfie_path = f_selfie.name

    try:
        # Face verification
        try:
            verified, confidence = run_face_verify(id_path, selfie_path)
        except Exception as e:
            return {
                "status": "manual_review",
                "confidence": 0.0,
                "ocr_text": [],
                "message": f"Face verification failed: {str(e)}",
            }

        # OCR on ID
        try:
            ocr_text = run_ocr(id_path)
        except Exception:
            ocr_text = []

        status: Literal["approved", "manual_review"] = (
            "approved" if (verified and confidence >= APPROVE_THRESHOLD) else "manual_review"
        )

        return {
            "status": status,
            "confidence": round(confidence, 4),
            "ocr_text": ocr_text,
        }
    finally:
        try:
            os.unlink(id_path)
        except OSError:
            pass
        try:
            os.unlink(selfie_path)
        except OSError:
            pass


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
