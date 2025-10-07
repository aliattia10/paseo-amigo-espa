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
   - Create a `.env` file in the root directory
   - Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run the Development Server

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
