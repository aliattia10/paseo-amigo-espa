# 🚀 Deployment Checklist

Use this checklist to ensure a smooth deployment to production.

## Pre-Deployment

### 1. Code Quality
- [ ] All TypeScript errors resolved
- [ ] Linter passes without errors
- [ ] No console errors in browser
- [ ] Code reviewed and tested
- [ ] Git commits are clean and descriptive

### 2. Environment Setup
- [ ] `.env` file configured with production values
- [ ] All required environment variables set
- [ ] Supabase project created and configured
- [ ] Stripe account set up (if using payments)
- [ ] API keys secured and not committed to Git

### 3. Database Setup
- [ ] Ran `database/setup_complete.sql` in Supabase
- [ ] All tables created successfully
- [ ] Indexes created for performance
- [ ] RLS policies enabled and tested
- [ ] Storage buckets created
- [ ] Storage policies configured

### 4. Testing
- [ ] Created test accounts (owner and walker)
- [ ] Tested user registration flow
- [ ] Tested login/logout
- [ ] Tested profile creation
- [ ] Tested dog profile creation
- [ ] Tested walker search
- [ ] Tested match system
- [ ] Tested messaging
- [ ] Tested activity feed
- [ ] Tested on multiple browsers
- [ ] Tested on mobile devices

## Supabase Configuration

### Authentication
- [ ] Email provider enabled
- [ ] Email confirmation configured (enable for production!)
- [ ] Site URL set to production URL
- [ ] Redirect URLs configured
- [ ] Email templates customized
- [ ] Password requirements configured

### Database
- [ ] All migrations applied
- [ ] RLS policies tested
- [ ] Database backups enabled (Pro plan)
- [ ] Connection pooling configured
- [ ] Performance optimization reviewed

### Storage
- [ ] `profile-images` bucket created and public
- [ ] `dog-images` bucket created and public
- [ ] Storage policies configured
- [ ] File size limits set (5MB recommended)
- [ ] CORS configured for your domain

### API
- [ ] CORS origins include production URL
- [ ] Rate limiting enabled
- [ ] API keys rotated if needed
- [ ] Service role key secured (never expose!)

## Netlify Setup

### Site Configuration
- [ ] New site created in Netlify
- [ ] Connected to Git repository
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Node version: 18 or higher

### Environment Variables
Add these in Site settings > Environment variables:
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] `VITE_APP_URL` (your Netlify URL)
- [ ] `VITE_APP_NAME`
- [ ] `NODE_VERSION=18`

### Domain & HTTPS
- [ ] Custom domain configured (optional)
- [ ] DNS records updated
- [ ] HTTPS enabled and working
- [ ] SSL certificate valid

### Deploy Settings
- [ ] Auto-deploy from main branch enabled
- [ ] Deploy previews enabled for PRs
- [ ] Build hooks configured (optional)
- [ ] Deploy notifications set up (optional)

## Security

### Frontend
- [ ] All API keys are public-safe (anon key only)
- [ ] No sensitive data in code
- [ ] XSS protection enabled
- [ ] Content Security Policy configured
- [ ] Secure headers configured (see netlify.toml)

### Backend (Supabase)
- [ ] RLS enabled on all tables
- [ ] RLS policies tested and working
- [ ] Service role key never exposed to frontend
- [ ] Auth JWT secret secured
- [ ] Database connection string secured

### Best Practices
- [ ] HTTPS only
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] File upload restrictions in place
- [ ] Error messages don't expose sensitive info

## Performance

### Optimization
- [ ] Images optimized and compressed
- [ ] Lazy loading implemented
- [ ] Code splitting configured
- [ ] Bundle size analyzed
- [ ] Lighthouse score reviewed (aim for >90)

### Caching
- [ ] Static assets cached (netlify.toml configured)
- [ ] Service worker configured (optional)
- [ ] CDN configured (Netlify handles this)

### Monitoring
- [ ] Error tracking set up (Sentry, Rollbar, etc.)
- [ ] Analytics configured (Google Analytics, Plausible, etc.)
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured (UptimeRobot, etc.)

## First Deployment

### Build & Deploy
- [ ] Run `npm run build` locally (verify it works)
- [ ] Fix any build errors
- [ ] Deploy to Netlify: `netlify deploy --prod`
- [ ] Or push to main branch (auto-deploy)

### Post-Deploy Verification
- [ ] Visit production URL
- [ ] Test user registration
- [ ] Test login/logout
- [ ] Test all major features
- [ ] Check browser console for errors
- [ ] Test on mobile device
- [ ] Test in incognito/private mode
- [ ] Verify images load correctly
- [ ] Test real-time features (messaging, activity feed)

### Supabase Production Config
- [ ] Update Site URL to production domain
- [ ] Update redirect URLs
- [ ] Test email confirmation flow
- [ ] Test password reset flow
- [ ] Verify storage uploads work

## Post-Deployment

### Monitoring
- [ ] Set up error alerts
- [ ] Monitor application logs
- [ ] Check Supabase usage dashboard
- [ ] Monitor Netlify analytics
- [ ] Set up status page (optional)

### Documentation
- [ ] Update README with production URL
- [ ] Document any deployment issues
- [ ] Create runbook for common tasks
- [ ] Share credentials securely with team

### Backup & Recovery
- [ ] Database backup strategy in place
- [ ] Environment variables backed up securely
- [ ] Recovery plan documented
- [ ] Rollback procedure tested

## Ongoing Maintenance

### Weekly
- [ ] Check error logs
- [ ] Review analytics
- [ ] Monitor performance metrics
- [ ] Check for security updates

### Monthly
- [ ] Review and optimize database
- [ ] Update dependencies
- [ ] Review Supabase usage and costs
- [ ] Test backup restoration

### As Needed
- [ ] Apply security patches
- [ ] Deploy new features
- [ ] Scale resources if needed
- [ ] Update documentation

## Rollback Plan

If deployment fails:

1. **Immediate Actions**
   - [ ] Revert to previous deployment in Netlify
   - [ ] Check error logs for root cause
   - [ ] Notify team of issues

2. **Investigation**
   - [ ] Review build logs
   - [ ] Check environment variables
   - [ ] Test database connection
   - [ ] Verify API endpoints

3. **Fix & Redeploy**
   - [ ] Fix identified issues
   - [ ] Test locally
   - [ ] Deploy to preview first
   - [ ] Deploy to production

## Success Criteria

Deployment is successful when:
- [ ] Site loads without errors
- [ ] All features work as expected
- [ ] Performance is acceptable (Lighthouse >90)
- [ ] No critical errors in logs
- [ ] Authentication works correctly
- [ ] Database operations work
- [ ] Real-time features work
- [ ] Images and assets load
- [ ] Mobile experience is smooth

## Emergency Contacts

- **Supabase Support**: support@supabase.io
- **Netlify Support**: support@netlify.com
- **Stripe Support**: support@stripe.com

## Useful Commands

```bash
# Build locally
npm run build

# Preview build
npm run preview

# Deploy to Netlify
netlify deploy --prod

# Check Netlify status
netlify status

# View logs
netlify logs

# Rollback deployment
netlify rollback
```

## Notes

Date Deployed: _______________
Deployed By: _______________
Version/Commit: _______________
Issues Encountered: _______________
Resolution: _______________

---

**Remember**: Always test in a staging environment before deploying to production!

