@echo off
echo Deploying create-payment-with-connect function...
supabase functions deploy create-payment-with-connect

echo.
echo ✅ Function deployed successfully!
echo.
echo The payment function will now work even if the payout columns don't exist yet.
echo You can run the database migration later when you're ready to enable the full payout system.
pause
