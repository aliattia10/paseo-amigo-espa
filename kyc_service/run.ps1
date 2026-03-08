# Run KYC service on port 8001 (avoids conflict with 8000)
# Usage: .\run.ps1   or   pwsh -File run.ps1
$port = if ($env:KYC_PORT) { $env:KYC_PORT } else { "8001" }
Write-Host "Starting KYC service on port $port ..."
py -m uvicorn main:app --host 0.0.0.0 --port $port
