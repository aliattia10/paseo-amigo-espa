# Run KYC service. Default port 8002 (avoids conflict with 8000/8001).
# Usage: .\run.ps1   or   $env:KYC_PORT=8003; .\run.ps1
$port = if ($env:KYC_PORT) { $env:KYC_PORT } else { "8002" }
Write-Host "Starting KYC service on port $port ..."
py -m uvicorn main:app --host 0.0.0.0 --port $port
