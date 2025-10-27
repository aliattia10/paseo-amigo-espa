# Complete Setup Guide for Paseo App

This guide will help you set up the Paseo dog walking app from scratch with Supabase and deploy it to Netlify.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account
- Netlify account (for deployment)
- Stripe account (for payments)

## Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd paseo-amigo-espa
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up Supabase

### 3.1 Create a New Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for project to be created

### 3.2 Get Your Supabase Credentials

1. Go to Project Settings > API
2. Copy your Project URL
3. Copy your `anon` public key

### 3.3 Run Database Setup

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy the contents of `database/setup_complete.sql`
4. Paste and run it in the SQL Editor

This will create all necessary:
- Tables (users, dogs, walker_profiles, walk_requests, reviews, matches, activity_feed, messages)
- Indexes for performance
- Functions for business logic
- Triggers for automation
- Row Level Security (RLS) policies
- Storage buckets for images

### 3.4 Enable Email Auth

1. Go to Authentication > Providers
2. Enable Email provider
3. Disable "Confirm email" if you want to test quickly (enable it for production!)

### 3.5 Set Up Storage

The SQL script already creates the buckets, but verify:
1. Go to Storage
2. You should see `profile-images` and `dog-images` buckets
3. Both should be public

## Step 4: Configure Environment Variables

### 4.1 Create Local .env File

Copy `env.example` to `.env`:

```bash
cp env.example .env
```

### 4.2 Update .env File

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key

# Backend API URL (if using backend)
VITE_API_URL=https://your-backend-url.com

# App Configuration
VITE_APP_NAME=Paseo
VITE_APP_DESCRIPTION=Encuentra el paseador perfecto para tu perro
VITE_APP_URL=http://localhost:5173
```

## Step 5: Run Locally

```bash
npm run dev
```

The app should now be running on `http://localhost:5173`

## Step 6: Test the Application

### 6.1 Create Test Accounts

1. Sign up as an owner:
   - Email: owner@test.com
   - Password: test123456
   - User Type: Owner

2. Sign up as a walker:
   - Email: walker@test.com
   - Password: test123456
   - User Type: Walker

### 6.2 Test Features

- Create a dog profile (as owner)
- Update your profile
- Search for nearby walkers
- Like/pass on walkers
- Check activity feed
- Send messages

## Step 7: Deploy to Netlify

### 7.1 Build for Production

```bash
npm run build
```

This creates a `dist` folder with your production build.

### 7.2 Deploy to Netlify

#### Option A: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

#### Option B: Deploy via Netlify UI

1. Go to [Netlify](https://netlify.com)
2. Click "Add new site" > "Import an existing project"
3. Connect to your Git repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click "Deploy site"

### 7.3 Set Environment Variables on Netlify

1. Go to Site settings > Environment variables
2. Add all variables from your `.env` file:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `VITE_APP_URL` (use your Netlify URL)
3. Redeploy the site

### 7.4 Configure Redirects

The `netlify.toml` file is already configured with:
- SPA redirects (all routes to index.html)
- Security headers
- Asset caching

## Step 8: Configure Supabase for Production

### 8.1 Update Auth Settings

1. Go to Authentication > URL Configuration
2. Add your Netlify URL to Site URL
3. Add Netlify URL to Redirect URLs

### 8.2 Configure Email Templates

1. Go to Authentication > Email Templates
2. Customize confirmation and password reset emails
3. Update redirect URLs to point to your Netlify domain

### 8.3 Set Up CORS

1. Go to API Settings
2. Add your Netlify URL to allowed origins

## Step 9: Test Production Deployment

1. Visit your Netlify URL
2. Test sign up/login
3. Test all major features
4. Check browser console for errors
5. Test on mobile devices

## Troubleshooting

### Issue: "Failed to fetch user profile"

**Solution:** Check that:
1. RLS policies are correctly set up
2. User is authenticated
3. Supabase credentials are correct

### Issue: "Storage upload failed"

**Solution:** Check that:
1. Storage buckets exist
2. Storage policies allow uploads
3. File size is under limit (5MB)

### Issue: "No nearby walkers found"

**Solution:**
1. Ensure there are walker accounts in the database
2. Check that walkers have the same city as the owner
3. Verify RLS policies allow viewing walker profiles

### Issue: Netlify build fails

**Solution:**
1. Check that all dependencies are in `package.json`
2. Verify build command is correct
3. Check environment variables are set
4. Look at build logs for specific errors

## Database Migrations

If you need to make changes to the database schema:

1. Create a new migration file in `supabase/migrations/`
2. Name it with timestamp: `YYYYMMDDHHMMSS_description.sql`
3. Add your SQL changes
4. Run it in Supabase SQL Editor

## Seeding Test Data

To add test data to your database:

1. Go to SQL Editor in Supabase
2. Run the `database/seed_comprehensive.sql` file
3. This adds test users, dogs, and walk requests

## Security Checklist

Before going to production:

- [ ] Enable email confirmation in Supabase Auth
- [ ] Review and test all RLS policies
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting
- [ ] Review and update security headers
- [ ] Set up monitoring and error tracking
- [ ] Enable HTTPS only
- [ ] Review storage policies
- [ ] Set up backup strategy
- [ ] Configure custom domain with SSL

## Performance Optimization

- [ ] Enable CDN for static assets
- [ ] Configure browser caching
- [ ] Optimize images (compress, use WebP)
- [ ] Enable gzip compression
- [ ] Monitor Core Web Vitals
- [ ] Set up performance monitoring

## Monitoring and Analytics

Consider setting up:
- Supabase Analytics (built-in)
- Google Analytics or Plausible
- Error tracking (Sentry, Rollbar)
- Uptime monitoring (UptimeRobot)

## Backup Strategy

1. Enable Supabase automatic backups (Pro plan)
2. Export database regularly
3. Back up environment variables
4. Version control all code

## Next Steps

1. Set up custom domain
2. Configure email sending (SendGrid, Mailgun)
3. Set up push notifications
4. Add payment processing
5. Implement advanced features
6. Set up CI/CD pipeline

## Support

For issues or questions:
- Check GitHub Issues
- Review Supabase documentation
- Join community Discord

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

