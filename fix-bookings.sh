#!/bin/bash

# Fix Bookings Error - Automated Script
# This script applies the availability table fix to your Supabase database

echo "🔧 Paseo Booking Error Fix"
echo "======================================"
echo ""

# Check if supabase CLI is installed
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI found"
    echo ""
    
    # Check if project is linked
    if [ -f ".supabase/config.toml" ]; then
        echo "📦 Project is linked to Supabase"
        echo ""
        echo "🚀 Pushing migration..."
        echo ""
        
        supabase db push
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ SUCCESS! Migration applied successfully"
            echo "✅ The booking error should now be fixed"
            echo ""
            echo "🔍 Next steps:"
            echo "   1. Refresh your app at https://petflik.com/bookings"
            echo "   2. The error should be gone!"
            echo ""
        else
            echo ""
            echo "❌ Migration failed"
            echo ""
            echo "📖 Try manual fix:"
            echo "   1. Go to https://supabase.com/dashboard/project/zxbfygofxxmfivddwdqt/sql"
            echo "   2. Open file: supabase/migrations/20251101000000_fix_availability_time_type.sql"
            echo "   3. Copy and paste the content into SQL Editor"
            echo "   4. Click Run"
            echo ""
        fi
    else
        echo "⚠️ Project not linked to Supabase"
        echo ""
        echo "🔗 Linking project..."
        supabase link --project-ref zxbfygofxxmfivddwdqt
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Project linked!"
            echo "🚀 Pushing migration..."
            echo ""
            supabase db push
            
            if [ $? -eq 0 ]; then
                echo ""
                echo "✅ SUCCESS! Migration applied successfully"
                echo "✅ The booking error should now be fixed"
            fi
        else
            echo ""
            echo "❌ Could not link project"
            echo ""
            echo "📖 Try manual fix instead (see APPLY_FIX_NOW.md)"
        fi
    fi
else
    echo "⚠️ Supabase CLI not found"
    echo ""
    echo "You have two options:"
    echo ""
    echo "Option 1: Install Supabase CLI (Recommended for automation)"
    echo "   npm install -g supabase"
    echo "   Then run this script again"
    echo ""
    echo "Option 2: Apply fix manually (Quick and easy)"
    echo "   1. Open: APPLY_FIX_NOW.md"
    echo "   2. Follow the 5-minute guide"
    echo "   3. Or go directly to:"
    echo "      https://supabase.com/dashboard/project/zxbfygofxxmfivddwdqt/sql"
    echo ""
fi

echo "======================================"
echo ""
echo "📚 For more details, see:"
echo "   - APPLY_FIX_NOW.md (Quick guide)"
echo "   - FIX_BOOKING_ERROR_GUIDE.md (Detailed explanation)"
echo ""

