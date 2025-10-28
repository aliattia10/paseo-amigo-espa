# Paseo - Dog Walking & Sitting Platform

## 📚 Documentation Index

This project has been organized with clear, focused documentation. Here's what each file contains:

### Essential Documentation

1. **README.md** - Project overview and getting started
2. **QUICK_SETUP_STEPS.md** - ⚡ Fast 5-minute Supabase setup guide
3. **SUPABASE_COMPLETE_SETUP.md** - 📖 Detailed database setup with explanations
4. **DOG_PROFILE_IMPLEMENTATION.md** - Dog owner profile feature documentation

### Database

- **database/sprint_enhanced_profiles_availability_booking.sql** - Complete database migration script

### Configuration Files

- **netlify.toml** - Netlify deployment configuration
- **env.example** - Environment variables template
- **supabase/** - Supabase configuration files

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `env.example` to `.env` and fill in your Supabase credentials:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set Up Database
Follow **QUICK_SETUP_STEPS.md** (takes 5 minutes)

### 4. Run Development Server
```bash
npm run dev
```

### 5. Deploy to Netlify
```bash
npm run build
npx netlify-cli deploy --prod
```

## 🎯 Key Features

- ✅ Tinder-style card interface for browsing sitters
- ✅ Dog owner profile creation with required photos
- ✅ Sitter profiles with availability management
- ✅ Booking system with status tracking
- ✅ Real-time notifications
- ✅ Multi-language support (English/Spanish)
- ✅ Dark mode support
- ✅ Mobile-first responsive design

## 🗄️ Database Structure

### Main Tables
- **users** - User accounts (owners & sitters)
- **dogs** - Dog profiles with photos
- **bookings** - Booking requests and confirmations
- **availability** - Sitter time slots
- **notifications** - User notifications

### Storage
- **avatars/profiles/** - User profile pictures
- **avatars/dogs/** - Dog pictures

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Secure image upload with validation
- Authentication via Supabase Auth

## 📱 Live App

**Production URL:** https://paseop.netlify.app

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Deployment:** Netlify
- **i18n:** react-i18next

## 📝 Development Notes

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

### Checking TypeScript
```bash
npm run type-check
```

## 🐛 Troubleshooting

### Database Errors
- Check that you've run the migration script
- Verify RLS policies are set up
- See **SUPABASE_COMPLETE_SETUP.md** for detailed troubleshooting

### Image Upload Issues
- Verify `avatars` bucket exists in Supabase Storage
- Check bucket is set to Public
- Verify storage policies are configured

### Authentication Issues
- Check Supabase credentials in `.env`
- Verify email confirmation is set up in Supabase

## 📞 Support

For issues or questions:
1. Check the documentation files listed above
2. Review Supabase logs in dashboard
3. Check browser console for errors

## 🎨 Design System

The app uses a custom design system based on Material Design principles with:
- Custom color palette (terracotta, sunny, mediterranean)
- Consistent spacing and typography
- Smooth animations and transitions
- Accessible components

## 🌍 Internationalization

Supported languages:
- English (en)
- Spanish (es)

Translation files located in: `src/lib/i18n.ts`

## 📦 Project Structure

```
paseo-amigo-espa/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilities and configs
│   └── integrations/   # Supabase integration
├── database/           # SQL migration scripts
├── public/             # Static assets
└── docs/              # Documentation (this file)
```

## 🔄 Recent Updates

- ✅ Added dog owner profile setup with required photos
- ✅ Implemented booking system with status tracking
- ✅ Added availability management for sitters
- ✅ Enhanced error handling for database operations
- ✅ Improved mobile responsiveness
- ✅ Added comprehensive database setup guides

## 📄 License

[Your License Here]

## 👥 Contributors

[Your Team/Name Here]
