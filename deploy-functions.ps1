# PowerShell script to deploy Supabase Edge Functions
# Run this with: .\deploy-functions.ps1

Write-Host "🚀 Deploying Supabase Edge Functions..." -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue
if (-not $supabaseInstalled) {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host "Install it with: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Supabase CLI found" -ForegroundColor Green
Write-Host ""

# Deploy all functions
Write-Host "📦 Deploying all Edge Functions..." -ForegroundColor Cyan
supabase functions deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Deployed functions:" -ForegroundColor Cyan
    supabase functions list
    Write-Host ""
    Write-Host "🎉 All done! Your functions are now live." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Test your payment flow in the browser" -ForegroundColor White
    Write-Host "2. Check for any errors in the console" -ForegroundColor White
    Write-Host "3. Run the database migration if you haven't already" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "1. Make sure you're logged in: supabase login" -ForegroundColor White
    Write-Host "2. Link your project: supabase link --project-ref zxbfygofxxmfivddwdqt" -ForegroundColor White
    Write-Host "3. Set your secrets: supabase secrets set STRIPE_SECRET_KEY=sk_test_..." -ForegroundColor White
}
