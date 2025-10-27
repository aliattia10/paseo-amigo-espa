# 🚀 Quick Deployment Guide

**Get your Paseo app live in 15 minutes!**

## Prerequisites
- Supabase account
- Netlify account
- GitHub repository (optional)

---

## Step 1: Set Up Supabase (5 minutes)

### 1.1 Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name it "paseo-app"
4. Choose region closest to your users
5. Set a strong database password
6. Wait for project creation (~2 minutes)

### 1.2 Run Database Setup
1. Go to SQL Editor
2. Open `database/setup_complete.sql` from this repo
3. Copy all content
4. Paste in SQL Editor
5. Click "Run" ▶️
6. Wait for success message ✅

### 1.3 Get Your Keys
1. Go to Settings > API
2. Copy:
   - Project URL
   - `anon` public key
3. Save these for Step 3

### 1.4 Configure Auth
1. Go to Authentication > Providers
2. Enable "Email" provider
3. Disable "Confirm email" (for testing)
   - ⚠️ Enable for production!

---

## Step 2: Build Locally (2 minutes)

```bash
# Install dependencies
npm install

# Create .env file
cp env.example .env

# Edit .env with your Supabase keys
# VITE_SUPABASE_URL=your-project-url
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Test build
npm run build

# Test locally
npm run dev
```

Visit `http://localhost:5173` and test signup/login.

---

## Step 3: Deploy to Netlify (5 minutes)

### Option A: Via Netlify CLI (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Option B: Via Netlify UI

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Connect to your Git repo
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

---

## Step 4: Configure Netlify (2 minutes)

### 4.1 Add Environment Variables
1. Go to Site settings > Environment variables
2. Add these variables:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-key (optional)
VITE_APP_URL=your-netlify-url
```

### 4.2 Redeploy
1. Go to Deploys
2. Click "Trigger deploy"
3. Wait for deployment ✅

---

## Step 5: Configure Supabase for Production (1 minute)

1. Go to Supabase Authentication > URL Configuration
2. Add your Netlify URL to:
   - Site URL
   - Redirect URLs

Example: `https://your-app.netlify.app`

---

## Step 6: Test! 🎉

Visit your Netlify URL and test:

✅ Sign up as owner
✅ Create dog profile
✅ Sign up as walker (different email)
✅ Search for walkers
✅ Like a walker
✅ Send message

---

## 🐛 Troubleshooting

### Build fails on Netlify
- Check Node version is 18
- Verify environment variables are set
- Check build logs for specific error

### "Failed to fetch user profile"
- Verify RLS policies are set (ran setup_complete.sql)
- Check Supabase credentials are correct
- Ensure user is authenticated

### Images don't upload
- Verify storage buckets exist in Supabase
- Check storage policies are set
- File must be under 5MB

### Can't find walkers
- Create a walker account
- Ensure walker has same city as owner
- Check RLS policies allow viewing walker profiles

---

## 📋 Post-Deployment Checklist

- [ ] Test signup/login
- [ ] Test profile creation
- [ ] Test dog profile creation
- [ ] Test walker search
- [ ] Test messaging
- [ ] Test image upload
- [ ] Test on mobile device
- [ ] Enable email confirmation in Supabase
- [ ] Set up custom domain (optional)
- [ ] Configure email templates
- [ ] Set up error tracking
- [ ] Set up analytics

---

## 🎯 Quick Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Netlify
netlify deploy --prod

# View deployment logs
netlify logs

# Open admin
netlify open:admin
```

---

## 📞 Need Help?

1. Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions
2. Review [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
3. Check Supabase logs in Dashboard > Logs
4. Check Netlify build logs in Deploys

---

## 🎉 Success!

Your Paseo app is now live! 

**Next steps:**
1. Create test accounts
2. Share with beta testers
3. Monitor error logs
4. Collect feedback
5. Iterate and improve

---

*Time to deployment: ~15 minutes ⚡*

