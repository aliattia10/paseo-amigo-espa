# 🚀 Paseo - Netlify Deployment Guide

This guide will help you deploy your Paseo dog walking app to Netlify.

## 📋 Prerequisites

- ✅ Netlify account (free at [netlify.com](https://netlify.com))
- ✅ GitHub repository with your code
- ✅ Supabase project set up
- ✅ Stripe account (for payments)

## 🎯 Deployment Steps

### 1. Prepare Your Repository

Make sure your code is pushed to GitHub with all the latest changes:

```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

### 2. Deploy to Netlify

#### Option A: Deploy from GitHub (Recommended)

1. **Go to Netlify Dashboard**
   - Visit [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"

2. **Connect GitHub**
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access your repositories
   - Select your `paseo` repository

3. **Configure Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   Node version: 18
   ```

4. **Set Environment Variables**
   Go to Site settings → Environment variables and add:
   ```
   VITE_SUPABASE_URL=https://zxbfygofxxmfivddwdqt.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4YmZ5Z29meHhtZml2ZGR3ZHF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjkyNTAsImV4cCI6MjA3MzY0NTI1MH0.6V11hebajJyNKKEeI0MqcoG8n2Hc0Rli8SoUpstm-C4
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51Mv1dLAKjpyONsXT2WTBK9ad3XZpt9Kt9ZF3RDEjW41yoF0pF4d4mbw1MgzHcSPjkrR1awfkJl99tO8vxaQgke2e005JajbdVi
   VITE_APP_NAME=Paseo
   VITE_APP_URL=https://your-site-name.netlify.app
   ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete (2-3 minutes)

#### Option B: Drag & Drop Deployment

1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Drag & Drop**
   - Go to [netlify.com/drop](https://netlify.com/drop)
   - Drag the `dist` folder to the deployment area

### 3. Configure Custom Domain (Optional)

1. **Go to Site Settings**
   - Click on your site → Site settings → Domain management

2. **Add Custom Domain**
   - Click "Add custom domain"
   - Enter your domain (e.g., `paseo.es` or `paseo.com`)

3. **Configure DNS**
   - Add the Netlify DNS records to your domain provider
   - Or use Netlify DNS nameservers

### 4. Set Up Backend (Optional)

If you want to deploy the backend API as well:

1. **Deploy Backend to Netlify Functions**
   - The backend can be deployed as Netlify Functions
   - Or deploy separately to another service (Vercel, Railway, etc.)

2. **Update API URL**
   - Update the `VITE_API_URL` environment variable
   - Or update the proxy in `netlify.toml`

## 🔧 Environment Variables

### Required Variables
```env
VITE_SUPABASE_URL=https://zxbfygofxxmfivddwdqt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4YmZ5Z29meHhtZml2ZGR3ZHF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNjkyNTAsImV4cCI6MjA3MzY0NTI1MH0.6V11hebajJyNKKEeI0MqcoG8n2Hc0Rli8SoUpstm-C4
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51Mv1dLAKjpyONsXT2WTBK9ad3XZpt9Kt9ZF3RDEjW41yoF0pF4d4mbw1MgzHcSPjkrR1awfkJl99tO8vxaQgke2e005JajbdVi
```

### Optional Variables
```env
VITE_API_URL=https://your-backend-url.netlify.app
VITE_APP_NAME=Paseo
VITE_APP_DESCRIPTION=Encuentra el paseador perfecto para tu perro
VITE_APP_URL=https://your-site-name.netlify.app
```

## 🚀 Build Configuration

The `netlify.toml` file is already configured with:

- ✅ Build command: `npm run build`
- ✅ Publish directory: `dist`
- ✅ Node version: 18
- ✅ Security headers
- ✅ SPA redirects
- ✅ Asset caching

## 📊 Post-Deployment Checklist

### ✅ Verify Deployment
- [ ] Site loads without errors
- [ ] All pages are accessible
- [ ] Images and assets load correctly
- [ ] Responsive design works on mobile

### ✅ Test Functionality
- [ ] User registration/login works
- [ ] Database connections are working
- [ ] Payment integration (Stripe) is functional
- [ ] File uploads work (if applicable)

### ✅ SEO & Performance
- [ ] Meta tags are correct
- [ ] Site loads quickly
- [ ] Images are optimized
- [ ] SSL certificate is active

### ✅ Analytics & Monitoring
- [ ] Set up Google Analytics (optional)
- [ ] Monitor error logs in Netlify dashboard
- [ ] Set up uptime monitoring

## 🔍 Troubleshooting

### Common Issues

1. **Build Fails**
   ```
   Solution: Check Node version (should be 18)
   Check: npm install runs successfully locally
   ```

2. **Environment Variables Not Working**
   ```
   Solution: Ensure all variables start with VITE_
   Check: Variables are set in Netlify dashboard
   ```

3. **404 Errors on Refresh**
   ```
   Solution: SPA redirects are configured in netlify.toml
   Check: All routes redirect to index.html
   ```

4. **API Calls Failing**
   ```
   Solution: Update CORS settings in backend
   Check: API URLs are correct
   ```

### Debug Steps

1. **Check Build Logs**
   - Go to Netlify dashboard → Deploys
   - Click on failed deploy to see logs

2. **Test Locally**
   ```bash
   npm run build
   npm run preview
   ```

3. **Check Environment Variables**
   - Verify all required variables are set
   - Test with a simple console.log in your app

## 📈 Performance Optimization

### Already Configured
- ✅ Asset caching (1 year for static assets)
- ✅ Gzip compression
- ✅ Security headers
- ✅ Optimized build process

### Additional Optimizations
- Add image optimization (Netlify Image CDN)
- Implement service worker for offline functionality
- Use Netlify Edge Functions for dynamic content

## 🔒 Security Features

The deployment includes:
- ✅ HTTPS enforcement
- ✅ Security headers (XSS protection, content type, etc.)
- ✅ Frame options (prevent clickjacking)
- ✅ Referrer policy
- ✅ Permissions policy

## 📱 Mobile Optimization

- ✅ Responsive design
- ✅ Touch-friendly interface
- ✅ Mobile-first approach
- ✅ PWA-ready (can be enhanced)

## 🎉 Success!

Once deployed, your Paseo app will be available at:
- **Default URL**: `https://your-site-name.netlify.app`
- **Custom Domain**: `https://your-domain.com` (if configured)

### Next Steps
1. Share your app with users
2. Monitor usage and performance
3. Collect feedback and iterate
4. Consider adding more features

## 🆘 Support

If you encounter issues:
1. Check the [Netlify documentation](https://docs.netlify.com/)
2. Review build logs in the Netlify dashboard
3. Test locally first to isolate issues
4. Check the [Paseo GitHub repository](https://github.com/your-username/paseo) for updates

---

**¡Felicitaciones!** 🎉 Your Paseo app is now live and ready to help dog owners find the perfect walker for their furry friends!
