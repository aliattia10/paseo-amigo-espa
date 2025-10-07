# Paseo Amigo España - Backend API

This is the backend API for the Paseo Amigo España dog walking application, built with Express.js, TypeScript, and Supabase.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete user profiles for dog owners and walkers
- **Dog Profiles**: Manage dog information and photos
- **Walker Profiles**: Detailed walker profiles with ratings and availability
- **Walk Requests**: Create, manage, and track walk requests
- **Real-time Chat**: Messaging between owners and walkers
- **Review System**: Rate and review walkers after completed walks
- **Subscription Management**: Premium subscription plans with Stripe integration
- **Payment Processing**: Secure payment handling with Stripe
- **File Uploads**: Image uploads for profiles and dogs
- **Real-time Notifications**: Push notifications for app events
- **Database**: PostgreSQL with Supabase (includes RLS policies)

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Database configuration
│   ├── controllers/
│   │   ├── authController.ts    # Authentication logic
│   │   ├── userController.ts    # User management
│   │   ├── dogController.ts     # Dog management
│   │   └── walkerController.ts  # Walker profiles
│   ├── middleware/
│   │   ├── auth.ts             # Authentication middleware
│   │   ├── errorHandler.ts     # Error handling
│   │   └── notFound.ts         # 404 handler
│   ├── routes/
│   │   ├── auth.ts             # Authentication routes
│   │   ├── users.ts            # User routes
│   │   ├── dogs.ts             # Dog routes
│   │   ├── walkers.ts          # Walker routes
│   │   ├── walkRequests.ts     # Walk request routes
│   │   ├── chat.ts             # Chat routes
│   │   ├── reviews.ts          # Review routes
│   │   ├── subscriptions.ts    # Subscription routes
│   │   ├── payments.ts         # Payment routes
│   │   └── notifications.ts    # Notification routes
│   ├── database/
│   │   ├── seed.ts             # Database seeding
│   │   ├── migrate.ts          # Database migration
│   │   └── reset.ts            # Database reset
│   └── server.ts               # Main server file
├── database/
│   └── schema.sql              # Complete database schema
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── env.example                 # Environment variables template
```

## 🛠️ Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your actual values:
   - Supabase URL and keys
   - JWT secret
   - Stripe keys
   - Email configuration

3. **Set up the database**:
   ```bash
   # Run the migration (copy schema to Supabase SQL editor)
   npm run db:migrate
   
   # Seed with sample data
   npm run db:seed
   ```

## 🚀 Running the Application

### Development
```bash
npm run dev
```
Server will start on `http://localhost:3001`

### Production
```bash
npm run build
npm start
```

## 📊 Database Setup

### 1. Create Supabase Project
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key to `.env`

### 2. Run Database Migration
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy the contents of `database/schema.sql`
4. Execute the SQL to create all tables and policies

### 3. Seed Sample Data
```bash
npm run db:seed
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Show migration instructions
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Clear all data from database

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Dogs
- `GET /api/dogs` - Get user's dogs
- `POST /api/dogs` - Create new dog
- `GET /api/dogs/:id` - Get dog by ID
- `PUT /api/dogs/:id` - Update dog
- `DELETE /api/dogs/:id` - Delete dog

### Walkers
- `GET /api/walkers` - Get all walkers (public)
- `GET /api/walkers/:id` - Get walker by ID
- `POST /api/walkers/profile` - Create walker profile
- `PUT /api/walkers/profile` - Update walker profile

### Walk Requests
- `GET /api/walk-requests` - Get user's walk requests
- `POST /api/walk-requests` - Create walk request
- `GET /api/walk-requests/:id` - Get walk request by ID
- `PUT /api/walk-requests/:id` - Update walk request
- `DELETE /api/walk-requests/:id` - Cancel walk request

### Chat
- `GET /api/chat/:requestId` - Get chat messages
- `POST /api/chat/:requestId` - Send message

### Reviews
- `GET /api/reviews/user/:userId` - Get reviews for user
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Subscriptions
- `GET /api/subscriptions/plans` - Get subscription plans
- `GET /api/subscriptions/current` - Get current subscription
- `POST /api/subscriptions/subscribe` - Subscribe to plan
- `PUT /api/subscriptions/cancel` - Cancel subscription

### Payments
- `GET /api/payments/methods` - Get payment methods
- `POST /api/payments/methods` - Add payment method
- `DELETE /api/payments/methods/:id` - Delete payment method
- `POST /api/payments/process` - Process payment

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/mark-all-read` - Mark all as read

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🛡️ Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **CORS**: Configured for specific origins
- **Helmet**: Security headers
- **Input Validation**: Joi schema validation
- **Row Level Security**: Database-level security policies
- **JWT Authentication**: Secure token-based auth

## 📝 Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
STRIPE_PUBLISHABLE_KEY=your-publishable-key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@paseoamigo.es

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:5173
```

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 📚 Documentation

- API documentation is available at `/api-docs` when running in development mode
- Database schema is documented in `database/schema.sql`
- Type definitions are in `src/config/database.ts`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@paseoamigo.es or create an issue in the repository.
