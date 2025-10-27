# 🐕 Paseo - Dog Walking App

A modern, full-featured dog walking platform built with React, TypeScript, and Supabase. Connect dog owners with trusted dog walkers in their area.

## ✨ Features

### For Dog Owners
- 🔍 **Find Walkers**: Browse and discover trusted dog walkers in your area
- 🐾 **Dog Management**: Create and manage profiles for multiple dogs
- 💬 **Real-time Messaging**: Chat with walkers in real-time
- ⭐ **Review System**: Rate and review your walking experiences
- 📱 **Activity Feed**: Stay updated with community activities
- 🎯 **Match System**: Tinder-style walker discovery

### For Dog Walkers
- 📊 **Dashboard**: Track your walks, earnings, and ratings
- 📅 **Availability Management**: Set your schedule and hourly rates
- 👤 **Profile Creation**: Showcase your experience and skills
- 💰 **Payment Integration**: Receive payments through Stripe
- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations

### Technical Features
- 🔐 **Secure Authentication**: Email/password auth with Supabase
- 🌐 **i18n Support**: Multi-language support (Spanish/English)
- 📱 **Responsive Design**: Mobile-first approach
- ⚡ **Real-time Updates**: Live activity feed and messaging
- 🎨 **Modern UI**: Built with Tailwind CSS and shadcn/ui
- 🔒 **Row Level Security**: Secure data access with Supabase RLS
- 📸 **Image Upload**: Profile and dog photos with Supabase Storage

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Navigation
- **React i18next** - Internationalization

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Storage
  - Row Level Security

### Additional Services
- **Stripe** - Payment processing
- **Netlify** - Hosting and deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account (for payments)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd paseo-amigo-espa
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp env.example .env
```

Edit `.env` with your credentials:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-key
```

4. **Set up the database**
- Go to your Supabase project
- Navigate to SQL Editor
- Copy and run `database/setup_complete.sql`

5. **Run the development server**
```bash
npm run dev
```

Visit `http://localhost:5173` 🎉

## 📁 Project Structure

```
paseo-amigo-espa/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard views
│   │   ├── messaging/      # Chat components
│   │   ├── nearby/         # Walker discovery
│   │   ├── profile/        # Profile management
│   │   └── ui/             # Reusable UI components
│   ├── contexts/           # React contexts
│   ├── lib/                # Utilities and services
│   │   ├── supabase-services.ts  # Supabase API
│   │   ├── matches-services.ts   # Match system
│   │   ├── activity-services.ts  # Activity feed
│   │   └── nearby-services.ts    # Walker search
│   ├── types/              # TypeScript types
│   └── hooks/              # Custom React hooks
├── database/               # SQL scripts
│   └── setup_complete.sql  # Complete DB setup
├── supabase/              # Supabase migrations
└── public/                # Static assets
```

## 🗄️ Database Schema

### Main Tables
- **users** - User profiles and authentication
- **dogs** - Dog profiles
- **walker_profiles** - Walker-specific information
- **walk_requests** - Walk bookings
- **reviews** - User reviews
- **matches** - Walker discovery matches
- **activity_feed** - Community activity
- **messages** - Real-time messaging

See `database/setup_complete.sql` for complete schema.

## 🔐 Authentication Flow

1. User signs up with email/password
2. Supabase creates auth user
3. Profile is created in `users` table
4. User selects role (Owner/Walker/Both)
5. Redirected to appropriate onboarding

## 📱 Key Features Implementation

### Walker Discovery (Tinder-style)
- Location-based matching
- Like/pass system
- Mutual match detection
- Real-time notifications

### Real-time Messaging
- Supabase real-time subscriptions
- Per-walk-request chat rooms
- Message history persistence
- Read receipts

### Activity Feed
- Public and private activities
- Real-time updates
- Filter by activity type
- User engagement tracking

## 🎨 UI/UX Highlights

- **Modern Gradient Design**: Beautiful gradients throughout
- **Smooth Animations**: Framer Motion animations
- **Responsive Layout**: Mobile-first approach
- **Accessibility**: ARIA labels and keyboard navigation
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: User-friendly error messages

## 🚀 Deployment

### Deploy to Netlify

1. **Build the project**
```bash
npm run build
```

2. **Deploy**
```bash
netlify deploy --prod
```

Or use the deploy script:
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Environment Variables on Netlify

Add these in Site settings > Environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_APP_URL`

### Supabase Configuration

1. Add Netlify URL to Auth > URL Configuration
2. Update redirect URLs
3. Configure email templates
4. Set up CORS

See `SETUP_GUIDE.md` for detailed instructions.

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

## 🧪 Testing

### Test Accounts

Create test accounts for both roles:

**Owner:**
- Email: owner@test.com
- Password: test123456

**Walker:**
- Email: walker@test.com
- Password: test123456

### Test Data

Run `database/seed_comprehensive.sql` to add test data.

## 🔒 Security

- Row Level Security (RLS) on all tables
- Authenticated-only endpoints
- Input validation
- XSS protection
- CSRF protection
- Secure headers (see `netlify.toml`)

## 🐛 Troubleshooting

### Common Issues

**"Failed to fetch user profile"**
- Check RLS policies
- Verify authentication
- Check Supabase credentials

**"Storage upload failed"**
- Verify storage buckets exist
- Check storage policies
- Confirm file size under 5MB

**Build failures**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist && npm run build`
- Check environment variables

See `SETUP_GUIDE.md` for more troubleshooting.

## 📚 Documentation

- [Setup Guide](SETUP_GUIDE.md) - Complete setup instructions
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Deployment instructions
- [Database Setup](DATABASE_SETUP.md) - Database configuration

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Lucide Icons](https://lucide.dev) - Icons
- [Tailwind CSS](https://tailwindcss.com) - Styling

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review Supabase documentation

## 🗺️ Roadmap

- [ ] Push notifications
- [ ] Advanced scheduling
- [ ] GPS tracking during walks
- [ ] In-app payments
- [ ] Video calls
- [ ] Walker verification system
- [ ] Insurance integration
- [ ] Multi-language support expansion
- [ ] Mobile apps (iOS/Android)

## 📊 Project Status

🟢 Active Development

Last Updated: January 2025

---

Made with ❤️ for dog lovers everywhere

