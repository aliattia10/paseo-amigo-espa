# 🐕 Paseo - Encuentra el paseador perfecto para tu perro

Una aplicación moderna para conectar dueños de perros con paseadores profesionales en España. Construida con React, TypeScript, Supabase y Tailwind CSS.

## Features

- 🔐 **Authentication System** - Secure user registration and login with Supabase Auth
- 🐕 **Dog Owner Dashboard** - Manage your dogs and find walkers
- 🚶 **Walker Dashboard** - Accept walk requests and manage availability
- 💬 **Real-time Messaging** - Instant chat between owners and walkers with Supabase subscriptions
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- ⭐ **Rating System** - Rate and review walkers with detailed feedback
- 🗺️ **Location-based Matching** - Find walkers near you
- 🎨 **Beautiful UI** - Spanish-inspired warm Mediterranean design
- 🔄 **Real-time Updates** - Live notifications and updates
- 💳 **Payment Integration Ready** - Structured for payment processing

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Real-time + Storage)
- **State Management**: React Query + Context API
- **Routing**: React Router DOM
- **Deployment**: Netlify

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd paseo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Supabase Setup

1. **Create a Supabase Project**
   - Go to [Supabase Console](https://supabase.com)
   - Create a new project
   - Wait for the project to be ready

2. **Set up Database Schema**
   - Go to the SQL Editor in your Supabase dashboard
   - Run the SQL script from `DEPLOYMENT.md` to create all tables and policies

3. **Get Supabase Configuration**
   - Go to Settings > API in your Supabase dashboard
   - Copy the Project URL and anon public key

4. **Update Environment Variables**
   - Copy `env.example` to `.env` in the root directory (or create `.env` and add):
   - Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. **If local app can’t load any Supabase data (empty dashboard, no pets/sitters):**
   - In **Supabase Dashboard** → **SQL Editor** → New query, paste and run the contents of **`RUN_THIS_IN_SUPABASE.sql`** (in the project root). This fixes RLS so `users`, `pets`, `subscription_plans`, `bookings`, `likes`, `passes`, `pet_likes`, `pet_passes` are readable by the app when logged in.
   - Restart the dev server and try again. In the browser console (F12) you’ll see `[NewHomePage]` warnings if a fetch still fails.

### 4. Supabase CLI (migrations)

The project uses the Supabase CLI for migrations. After linking (see below), push migrations with:

```bash
npm run supabase:db:push
# or: npx supabase db push --linked --yes
```

**If you see "Remote migration versions not found in local migrations directory":**  
Run the one-time fix in Supabase Dashboard → SQL Editor: open `supabase/fix_migration_versions.sql`, copy its contents, paste in a new query, and Run. Then run `npm run supabase:db:push` again.

**First-time link (optional):**

```bash
npm run supabase:login   # open browser to sign in
npm run supabase:link   # select project or use existing link
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── messaging/      # Real-time messaging components
│   └── ui/            # Reusable UI components
├── contexts/           # React contexts
├── hooks/             # Custom hooks
├── lib/               # Supabase configuration and services
├── pages/             # Page components
├── types/             # TypeScript type definitions
└── assets/            # Static assets
```

## Database Schema

### Tables

- **users**: User profiles and authentication data
- **dogs**: Dog profiles linked to owners
- **walker_profiles**: Walker-specific profile information
- **walk_requests**: Walk booking requests
- **chat_messages**: Real-time chat messages
- **reviews**: User reviews and ratings

All tables include Row Level Security (RLS) policies for data protection.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Netlify (deployed app)

Set these in **Netlify → Site → Site configuration → Environment variables** so the deployed build uses your Supabase project:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Supabase **anon** (public) key from Settings → API |

Optional (if you use them):

- `VITE_STRIPE_PUBLISHABLE_KEY` – Stripe publishable key
- `VITE_MIN_PAYMENT_MODE` – enable minimum-charge test pricing while keeping real Stripe flow active (`true`/`false`)
- `VITE_MIN_PAYMENT_CHF` – minimum amount to charge in CHF when test pricing is enabled (default `1.00`)
- `VITE_GOOGLE_MAPS_API_KEY` – Google Maps API key

After adding or changing variables, trigger a **new deploy** so the build picks them up. The app uses these only at **build time**; the browser still talks to Supabase directly. If loading fails only on some networks (e.g. firewall blocking Supabase), env vars on Netlify will not fix that—only the correct keys and a reachable Supabase URL.

### Minimum payment test mode (real payments, CHF)

Use this mode when you want to validate booking/payment/review flows with low real charges:

```env
VITE_MIN_PAYMENT_MODE=true
VITE_MIN_PAYMENT_CHF=1.00
```

- Payments still use real Stripe checkout.
- Charge amount is overridden to the configured minimum CHF value.
- Booking/payment flows remain unchanged (only charged amount changes).
- UI shows a test-pricing badge on booking/payment screens.
- Metadata is attached for auditability (`test_mode`, `original_amount_chf`, `charged_amount_chf`).

Before full launch pricing:
- Set `VITE_MIN_PAYMENT_MODE=false`
- Redeploy frontend
- Verify one normal-priced booking end-to-end

## 🚀 Deployment

### Netlify (Recommended)

Paseo is optimized for deployment on Netlify with automatic builds and deployments.

**Quick Deploy:**
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/paseo)

**Manual Deployment:**
1. **Connect to GitHub**
   - Push your code to GitHub
   - Connect your repository to Netlify

2. **Set Environment Variables**
   - Add your Supabase credentials in Netlify dashboard

3. **Deploy**
   - Netlify will automatically build and deploy your site

For detailed deployment instructions, see [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md).

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to any static hosting service

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@paseo.es or create an issue in this repository.

## 🌟 Features Highlights

- 🎯 **Smart Matching**: AI-powered matching between dog owners and walkers
- 💬 **Real-time Chat**: Instant messaging with walk tracking
- 💳 **Secure Payments**: Stripe integration for safe transactions
- 📱 **Mobile-First**: Optimized for mobile devices
- 🌍 **Spanish Market**: Built specifically for the Spanish market
- ⚡ **Fast & Reliable**: Built with modern web technologies

---

**¡Haz que tu perro disfrute de paseos increíbles!** 🐕✨
