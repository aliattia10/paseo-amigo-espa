# Lightweight KYC microservice for Render free tier (512MB RAM).
# Base: python:3.9-slim to keep image small and memory predictable.
FROM python:3.9-slim

WORKDIR /app

# System deps: tesseract for pytesseract (low-RAM OCR), libgl1 for OpenCV.
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
