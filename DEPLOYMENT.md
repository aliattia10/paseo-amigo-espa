# Deployment Guide - ¿Damos un Paseo?

This guide will help you deploy the ¿Damos un Paseo? application to Netlify with Supabase integration.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Netlify Account**: Create a free account at [netlify.com](https://netlify.com)
3. **GitHub Repository**: Push your code to GitHub

## Step 1: Set up Supabase

### 1.1 Create a New Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `paseo-amigo-espa`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
5. Click "Create new project"

### 1.2 Set up Database Schema
Run the following SQL in your Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create users table
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('owner', 'walker')),
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dogs table
CREATE TABLE public.dogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age TEXT NOT NULL,
  breed TEXT,
  notes TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create walker_profiles table
CREATE TABLE public.walker_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT NOT NULL,
  experience TEXT NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  availability TEXT[] NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_walks INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  tags TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create walk_requests table
CREATE TABLE public.walk_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  walker_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES public.dogs(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('walk', 'care')),
  duration INTEGER NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in-progress', 'completed', 'cancelled')),
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.walk_requests(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  walk_request_id UUID REFERENCES public.walk_requests(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reviewed_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[] NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  interval TEXT NOT NULL,
  features TEXT[] NOT NULL,
  stripe_price_id TEXT NOT NULL,
  popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES public.subscription_plans(id),
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'incomplete')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_methods table
CREATE TABLE public.payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  card_brand TEXT NOT NULL,
  card_last4 TEXT NOT NULL,
  card_exp_month INTEGER NOT NULL,
  card_exp_year INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (id, name, price, interval, features, stripe_price_id, popular) VALUES
('monthly', 'Plan Mensual', 9.99, 'month', ARRAY[
  'Acceso ilimitado a compañeros verificados',
  'Chat en tiempo real',
  'Solicitudes de paseo ilimitadas',
  'Soporte prioritario',
  'Perfil destacado'
], 'price_monthly_999', false),
('6months', 'Plan 6 Meses', 49.99, '6months', ARRAY[
  'Todo lo del plan mensual',
  'Ahorro del 17%',
  'Acceso anticipado a nuevas funciones',
  'Sesiones de entrenamiento gratuitas',
  'Soporte premium'
], 'price_6months_4999', true),
('yearly', 'Plan Anual', 89.99, 'year', ARRAY[
  'Todo lo del plan de 6 meses',
  'Ahorro del 25%',
  'Funciones premium exclusivas',
  'Consultoría personalizada',
  'Soporte VIP 24/7'
], 'price_yearly_8999', false);

-- Set up Row Level Security policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own dogs" ON public.dogs FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own dogs" ON public.dogs FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own dogs" ON public.dogs FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Walker profiles are public" ON public.walker_profiles FOR SELECT USING (true);
CREATE POLICY "Users can manage own walker profile" ON public.walker_profiles FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view related walk requests" ON public.walk_requests FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = walker_id);
CREATE POLICY "Users can create walk requests" ON public.walk_requests FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update related walk requests" ON public.walk_requests FOR UPDATE USING (auth.uid() = owner_id OR auth.uid() = walker_id);

CREATE POLICY "Users can view chat messages for their requests" ON public.chat_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.walk_requests 
    WHERE id = request_id AND (owner_id = auth.uid() OR walker_id = auth.uid())
  )
);
CREATE POLICY "Users can send chat messages for their requests" ON public.chat_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.walk_requests 
    WHERE id = request_id AND (owner_id = auth.uid() OR walker_id = auth.uid())
  )
);

CREATE POLICY "Reviews are public" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Subscription plans are public
CREATE POLICY "Subscription plans are public" ON public.subscription_plans FOR SELECT USING (true);

-- Users can manage their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own subscriptions" ON public.user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Users can manage their own payment methods
CREATE POLICY "Users can view own payment methods" ON public.payment_methods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own payment methods" ON public.payment_methods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payment methods" ON public.payment_methods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own payment methods" ON public.payment_methods FOR DELETE USING (auth.uid() = user_id);

-- Create storage policies
CREATE POLICY "Images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 1.3 Get Supabase Credentials
1. Go to Settings > API in your Supabase dashboard
2. Copy the following values:
   - Project URL
   - Anon public key

## Step 2: Set up Netlify

### 2.1 Connect Repository
1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose GitHub and select your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

### 2.2 Set Environment Variables
In your Netlify site settings, go to Site settings > Environment variables and add:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

**Note**: For production, you'll also need to set up Stripe webhooks and use production Stripe keys.

### 2.3 Deploy
1. Click "Deploy site"
2. Wait for the build to complete
3. Your site will be available at a Netlify subdomain

## Step 3: Configure Custom Domain (Optional)

1. In Netlify, go to Domain settings
2. Add your custom domain
3. Configure DNS settings as instructed
4. Enable HTTPS (automatic with Netlify)

## Step 4: Test the Application

1. Visit your deployed site
2. Create a test account
3. Test the messaging functionality
4. Verify real-time updates work

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

## Troubleshooting

### Common Issues

1. **Build fails**: Check that all dependencies are in package.json
2. **Supabase connection fails**: Verify environment variables are set correctly
3. **Real-time not working**: Check Supabase RLS policies
4. **Images not uploading**: Verify storage bucket exists and policies are correct

### Debug Steps

1. Check Netlify build logs
2. Check browser console for errors
3. Verify Supabase logs in dashboard
4. Test API endpoints directly

## Security Considerations

1. **Row Level Security**: All tables have RLS enabled
2. **API Keys**: Never commit real API keys to version control
3. **CORS**: Supabase handles CORS automatically
4. **Authentication**: Supabase Auth handles user management

## Performance Optimization

1. **Image Optimization**: Use Supabase Storage with image transformations
2. **Caching**: Implement proper caching strategies
3. **CDN**: Netlify provides global CDN
4. **Database Indexing**: Add indexes for frequently queried columns

## Monitoring

1. **Netlify Analytics**: Monitor site performance
2. **Supabase Dashboard**: Monitor database usage
3. **Error Tracking**: Consider adding Sentry or similar
4. **Uptime Monitoring**: Use services like UptimeRobot

## Backup Strategy

1. **Database**: Supabase provides automatic backups
2. **Code**: GitHub provides version control
3. **Environment Variables**: Document all variables
4. **Custom Code**: Regular commits to Git

## Scaling Considerations

1. **Database**: Supabase scales automatically
2. **CDN**: Netlify provides global CDN
3. **Serverless**: Both platforms are serverless
4. **Monitoring**: Set up proper monitoring as you scale

For more detailed information, refer to the [Supabase Documentation](https://supabase.com/docs) and [Netlify Documentation](https://docs.netlify.com/).
