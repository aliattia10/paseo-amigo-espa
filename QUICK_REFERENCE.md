# Quick Reference Card - Simplified Payout System

## 🚀 Quick Deploy (5 Steps)

```bash
# 1. Run migration
supabase db push

# 2. Regenerate types
supabase gen types typescript --project-id YOUR_PROJECT > src/integrations/supabase/types.ts

# 3. Deploy functions
supabase functions deploy create-payment-with-connect
supabase functions deploy capture-payment  
supabase functions deploy process-sitter-payout

# 4. Build & deploy frontend
npm run build
# Deploy to your hosting

# 5. Test
# Visit /payout-methods and /admin/payouts
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/pages/PayoutMethodsPage.tsx` | Sitter payout management |
| `src/pages/AdminPayoutsPage.tsx` | Admin payout processing |
| `supabase/migrations/20241106_add_payout_system.sql` | Database schema |
| `supabase/functions/create-payment-with-connect/index.ts` | Payment creation |
| `supabase/functions/capture-payment/index.ts` | Payment capture |
| `supabase/functions/process-sitter-payout/index.ts` | Payout processing |

## 🔗 Routes

| Route | Access | Purpose |
|-------|--------|---------|
| `/payout-methods` | Sitters | Add payout method, request payouts |
| `/admin/payouts` | Admins | Process payout requests |

## 💾 Database Tables

### `users` (new columns)
- `payout_method` - 'paypal' or 'bank'
- `paypal_email` - PayPal email
- `bank_name` - Bank name
- `iban` - IBAN number
- `account_holder_name` - Account holder name

### `payout_requests` (new table)
- `id` - UUID
- `sitter_id` - User ID
- `amount` - Payout amount
- `payout_method` - 'paypal' or 'bank'
- `status` - 'pending', 'processing', 'completed', 'failed'
- `processed_at` - When processed
- `created_at` - When requested

### `bookings` (new columns)
- `payment_status` - 'pending', 'held', 'released'
- `total_amount` - Total booking amount
- `commission_fee` - Platform fee (20%)

## 🔄 Payment Flow

```
Pet Owner → Stripe Payment → Platform Account (held)
                                      ↓
                              Service Completed
                                      ↓
                              Sitter Requests Payout
                                      ↓
                              Admin Processes Manually
                                      ↓
                              PayPal/Bank Transfer
```

## 💰 Fee Structure

- **Platform Fee**: 20% of booking amount
- **Sitter Receives**: 80% of booking amount
- **Stripe Fee**: 2.9% + €0.30 (from total)
- **No Stripe Connect Fees**: Saved 0.25%

## 🎯 User Flows

### Sitter Flow:
1. Go to Profile → Payment Methods
2. Add PayPal email OR bank details
3. Complete bookings
4. Request payout when balance available
5. Receive payment in 2-5 days

### Admin Flow:
1. Go to `/admin/payouts`
2. View pending requests
3. Process via PayPal or bank transfer
4. Mark as processed in system

### Pet Owner Flow:
No changes - same payment process

## 🔧 Common Commands

```bash
# Check migration status
supabase db diff

# View function logs
supabase functions logs create-payment-with-connect

# Test function locally
supabase functions serve create-payment-with-connect

# Check database
supabase db remote status

# Rollback migration (if needed)
supabase db reset
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| TypeScript errors | Run migration, regenerate types |
| "payout_requests not found" | Run database migration |
| "Column does not exist" | Run database migration |
| Payment not held | Check capture-payment function logs |
| Payout not showing | Verify booking is completed |
| Balance not updating | Check payment_status in bookings |

## 📊 SQL Queries

```sql
-- Check pending payouts
SELECT * FROM payout_requests WHERE status = 'pending';

-- Check sitter balance
SELECT SUM(total_amount - commission_fee) as balance
FROM bookings 
WHERE sitter_id = 'USER_ID' 
AND status = 'completed' 
AND payment_status = 'held';

-- Check user payout method
SELECT payout_method, paypal_email, iban 
FROM users 
WHERE id = 'USER_ID';
```

## 🔐 Security Checklist

- [ ] RLS policies enabled on payout_requests
- [ ] Admin route properly secured
- [ ] Environment variables set
- [ ] Stripe webhook configured
- [ ] Database backups enabled
- [ ] Monitoring in place

## 📚 Documentation

| Document | When to Read |
|----------|--------------|
| `IMPLEMENTATION_COMPLETE.md` | Start here - overview |
| `DEPLOYMENT_CHECKLIST.md` | Before deploying |
| `PAYOUT_SYSTEM_README.md` | Technical details |
| `PAYOUT_SETUP_GUIDE.md` | Setup instructions |
| `PAYOUT_MIGRATION_SUMMARY.md` | Migration overview |
| `IMPORTANT_TYPESCRIPT_NOTE.md` | If you see TS errors |

## 🎓 Key Concepts

**Payment Status Flow**:
```
pending → held → released
```

**Payout Request Status**:
```
pending → processing → completed
```

**User Types**:
- `owner` - Pet owners (no payout needed)
- `walker` - Sitters (need payout method)
- `both` - Both roles (need payout method)

## 📞 Quick Links

- **Supabase Dashboard**: https://app.supabase.com
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Admin Panel**: https://yourapp.com/admin/payouts
- **Sitter Payouts**: https://yourapp.com/payout-methods

## ⚡ Pro Tips

1. **Test in development first** - Always!
2. **Backup database** - Before migration
3. **Monitor logs** - First week closely
4. **Process payouts weekly** - Set a schedule
5. **Keep reserves** - For pending payouts
6. **Document everything** - For your team
7. **Automate later** - Start manual, automate when ready

## 🎉 Success Indicators

After 1 week:
- ✅ 50%+ sitters added payout method
- ✅ All payouts processed within 5 days
- ✅ No critical bugs
- ✅ 95%+ payment success rate
- ✅ Positive sitter feedback

---

**Need more details?** Check the full documentation files!

**Ready to deploy?** Follow `DEPLOYMENT_CHECKLIST.md`!

**Questions?** Review `PAYOUT_SYSTEM_README.md`!
