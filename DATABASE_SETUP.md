# Database Setup Guide

This guide will help you set up the database for the Paseo Amigo España application.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- PostgreSQL database (or use Supabase)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=your-database-url
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
```

## Database Schema

The application uses the following main tables:

### Users Table
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `password_hash` (VARCHAR)
- `user_type` (ENUM: 'owner', 'walker')
- `profile_completed` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Profiles Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `first_name` (VARCHAR)
- `last_name` (VARCHAR)
- `phone` (VARCHAR)
- `address` (TEXT)
- `city` (VARCHAR)
- `postal_code` (VARCHAR)
- `profile_picture` (VARCHAR)
- `bio` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Dogs Table
- `id` (UUID, Primary Key)
- `owner_id` (UUID, Foreign Key)
- `name` (VARCHAR)
- `breed` (VARCHAR)
- `age` (INTEGER)
- `size` (ENUM: 'small', 'medium', 'large')
- `temperament` (TEXT)
- `special_needs` (TEXT)
- `profile_picture` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Walk Requests Table
- `id` (UUID, Primary Key)
- `owner_id` (UUID, Foreign Key)
- `walker_id` (UUID, Foreign Key, Nullable)
- `dog_id` (UUID, Foreign Key)
- `status` (ENUM: 'pending', 'accepted', 'in_progress', 'completed', 'cancelled')
- `requested_date` (DATE)
- `requested_time` (TIME)
- `duration` (INTEGER) -- in minutes
- `location` (TEXT)
- `special_instructions` (TEXT)
- `price` (DECIMAL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Messages Table
- `id` (UUID, Primary Key)
- `sender_id` (UUID, Foreign Key)
- `receiver_id` (UUID, Foreign Key)
- `walk_request_id` (UUID, Foreign Key, Nullable)
- `content` (TEXT)
- `read` (BOOLEAN)
- `created_at` (TIMESTAMP)

### Reviews Table
- `id` (UUID, Primary Key)
- `reviewer_id` (UUID, Foreign Key)
- `reviewee_id` (UUID, Foreign Key)
- `walk_request_id` (UUID, Foreign Key)
- `rating` (INTEGER) -- 1-5 stars
- `comment` (TEXT)
- `created_at` (TIMESTAMP)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   cd backend && npm install
   ```

2. **Set up Supabase**
   - Create a new project in Supabase
   - Get your project URL and API keys
   - Update the environment variables

3. **Run Database Migrations**
   ```bash
   npm run db:migrate
   ```

4. **Seed the Database (Optional)**
   ```bash
   npm run db:seed
   ```

5. **Start the Development Server**
   ```bash
   # Terminal 1 - Backend
   npm run backend:dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

## Row Level Security (RLS)

The application uses Supabase's Row Level Security policies to ensure data privacy:

- Users can only access their own data
- Walkers can only see walk requests they've been assigned to
- Messages are only visible to the sender and receiver
- Reviews are public but can only be created by users who completed a walk

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your DATABASE_URL and SUPABASE_URL
   - Ensure your Supabase project is active

2. **Authentication Issues**
   - Verify your SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY
   - Check that RLS policies are properly configured

3. **Migration Errors**
   - Ensure all required tables exist
   - Check for foreign key constraints
   - Verify data types match the schema

### Getting Help

If you encounter issues:
1. Check the console logs for error messages
2. Verify your environment variables
3. Ensure all dependencies are installed
4. Check the Supabase dashboard for database errors

## Security Notes

- Never commit your `.env` file to version control
- Use strong, unique passwords for all accounts
- Regularly rotate your API keys
- Enable RLS policies for all tables
- Use HTTPS in production
