# Fix Bookings Error - Automated Script for Windows
# This script applies the availability table fix to your Supabase database

Write-Host "🔧 Paseo Booking Error Fix" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if supabase CLI is installed
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue

if ($supabaseInstalled) {
    Write-Host "✅ Supabase CLI found" -ForegroundColor Green
    Write-Host ""
    
    # Check if project is linked
    if (Test-Path ".supabase/config.toml") {
        Write-Host "📦 Project is linked to Supabase" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "🚀 Pushing migration..." -ForegroundColor Cyan
        Write-Host ""
        
        supabase db push
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ SUCCESS! Migration applied successfully" -ForegroundColor Green
            Write-Host "✅ The booking error should now be fixed" -ForegroundColor Green
            Write-Host ""
            Write-Host "🔍 Next steps:" -ForegroundColor Yellow
            Write-Host "   1. Refresh your app at https://petflik.com/bookings"
            Write-Host "   2. The error should be gone!"
            Write-Host ""
        }
        else {
            Write-Host ""
            Write-Host "❌ Migration failed" -ForegroundColor Red
            Write-Host ""
            Write-Host "📖 Try manual fix:" -ForegroundColor Yellow
            Write-Host "   1. Go to https://supabase.com/dashboard/project/zxbfygofxxmfivddwdqt/sql"
            Write-Host "   2. Open file: supabase/migrations/20251101000000_fix_availability_time_type.sql"
            Write-Host "   3. Copy and paste the content into SQL Editor"
            Write-Host "   4. Click Run"
            Write-Host ""
        }
    }
    else {
        Write-Host "⚠️ Project not linked to Supabase" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "🔗 Linking project..." -ForegroundColor Cyan
        supabase link --project-ref zxbfygofxxmfivddwdqt
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Project linked!" -ForegroundColor Green
            Write-Host "🚀 Pushing migration..." -ForegroundColor Cyan
            Write-Host ""
            supabase db push
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ SUCCESS! Migration applied successfully" -ForegroundColor Green
                Write-Host "✅ The booking error should now be fixed" -ForegroundColor Green
            }
        }
        else {
            Write-Host ""
            Write-Host "❌ Could not link project" -ForegroundColor Red
            Write-Host ""
            Write-Host "📖 Try manual fix instead (see APPLY_FIX_NOW.md)" -ForegroundColor Yellow
        }
    }
}
else {
    Write-Host "⚠️ Supabase CLI not found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You have two options:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Option 1: Install Supabase CLI (Recommended for automation)" -ForegroundColor Green
    Write-Host "   npm install -g supabase"
    Write-Host "   Then run this script again"
    Write-Host ""
    Write-Host "Option 2: Apply fix manually (Quick and easy)" -ForegroundColor Green
    Write-Host "   1. Open: APPLY_FIX_NOW.md"
    Write-Host "   2. Follow the 5-minute guide"
    Write-Host "   3. Or go directly to:"
    Write-Host "      https://supabase.com/dashboard/project/zxbfygofxxmfivddwdqt/sql"
    Write-Host ""
}

Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 For more details, see:" -ForegroundColor Yellow
Write-Host "   - APPLY_FIX_NOW.md (Quick guide)"
Write-Host "   - FIX_BOOKING_ERROR_GUIDE.md (Detailed explanation)"
Write-Host ""

