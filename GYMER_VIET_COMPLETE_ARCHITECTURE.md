# 🏗️ GYMER VIỆT - COMPLETE SYSTEM ARCHITECTURE

## PROJECT OVERVIEW

**App Name:** GYMERVIET (Gym + Trainer Community)  
**Domain:** gymerviet.com  
**Focus:** Trainer-Centric Online Coaching Platform for Vietnam  
**MVP Timeline:** 2.5 months (10 weeks)  
**Team:** Solo founder (you handle frontend)  
**Target Market:** Vietnam (Vietnamese + English)  

---

## 📋 RECOMMENDED TECH STACK (FINAL)

### Frontend
```javascript
React.js (v18+)
├─ TypeScript (strict mode)
├─ Redux Toolkit (state)
├─ Tailwind CSS (styling)
├─ React Router v6 (navigation)
├─ React Query (data fetching)
├─ Recharts (progress charts)
├─ Axios (HTTP client)
├─ React Hook Form (forms)
├─ Zod (validation)
├─ Figma for designs ✅ (you have this!)
└─ Vite (build tool - faster than CRA)

Build & Deploy:
├─ Vite
├─ Vercel (free hosting, auto-deploy from Git)
└─ npm/pnpm
```

### Backend
```javascript
Node.js + Express.js (TypeScript)
├─ Express.js (web framework)
├─ PostgreSQL (database)
├─ TypeORM (ORM for PostgreSQL)
├─ Socket.io (real-time messaging)
├─ Bull (job queue)
├─ JWT + bcrypt (auth)
├─ Stripe API (payments)
├─ Winston (logging)
├─ Jest (testing)
└─ Zod (validation)

Deploy:
├─ Heroku (recommended MVP)
└─ npm/pnpm
```

### Database
```sql
PostgreSQL 14+
├─ Main database
├─ Redis (caching + real-time)
└─ AWS S3 (image storage)
```

### Infrastructure
```
MVP Phase:
├─ Backend: Heroku ($50-100/month)
├─ Database: Heroku PostgreSQL ($9/month)
├─ Frontend: Vercel (free)
├─ Images: AWS S3 ($1-10/month)
├─ Email: SendGrid (free tier)
├─ Payment: Stripe (2.9% + $0.30)
└─ Total: ~$60-120/month

Why Heroku?
✅ Deploy with git push
✅ PostgreSQL + Redis included
✅ Easy scaling
✅ Perfect for MVP
```

### Libraries to Install (Detailed List)

**Frontend - Essential:**
```bash
# Core
npm install react react-dom react-router-dom
npm install -D typescript @types/react

# State Management
npm install @reduxjs/toolkit react-redux

# Data Fetching
npm install @tanstack/react-query axios

# Styling
npm install -D tailwindcss postcss autoprefixer
npm install clsx tailwind-merge

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Charts
npm install recharts

# UI Components (optional, Tailwind is enough)
npm install @headlessui/react @heroicons/react

# Utilities
npm install date-fns classnames

# Environment
npm install dotenv
```

**Frontend - Dev Tools:**
```bash
npm install -D vite @vitejs/plugin-react
npm install -D eslint prettier eslint-config-prettier
npm install -D husky lint-staged
```

**Backend - Essential:**
```bash
npm install express cors dotenv helmet
npm install postgresql typeorm reflect-metadata
npm install jsonwebtoken bcryptjs
npm install stripe
npm install socket.io socket.io-client
npm install bull redis
npm install winston pino
npm install zod joi
npm install axios
```

**Backend - Dev Tools:**
```bash
npm install -D typescript @types/node @types/express
npm install -D jest @types/jest ts-jest
npm install -D nodemon ts-node
npm install -D eslint prettier
```

---

## 🗄️ DATABASE SCHEMA

### Core Tables (12 tables)

```sql
-- 1. USERS (Athletes)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    height_cm INT,
    current_weight_kg DECIMAL(5,2),
    goal VARCHAR(50), -- 'bulk', 'cut', 'maintenance'
    experience_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
    interests JSONB, -- ['gym', 'yoga', 'cardio']
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    INDEX idx_email,
    INDEX idx_created_at
);

-- 2. TRAINERS
CREATE TABLE trainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    specialties JSONB, -- ['strength', 'bodybuilding', 'yoga']
    certifications JSONB, -- [{'name': 'NASM', 'year': 2020}]
    years_experience INT,
    base_price_monthly DECIMAL(10,2), -- $79
    bio_detailed TEXT,
    stripe_account_id VARCHAR(255), -- For payouts
    is_verified BOOLEAN DEFAULT false,
    rating_avg DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    follower_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    INDEX idx_email,
    INDEX idx_rating,
    INDEX idx_created_at
);

-- 3. PROGRAMS
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES trainers(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_weeks INT, -- 4, 8, 12
    difficulty VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
    equipment_needed JSONB, -- ['barbell', 'dumbbell']
    price_monthly DECIMAL(10,2),
    price_one_time DECIMAL(10,2),
    thumbnail_url VARCHAR(500),
    is_published BOOLEAN DEFAULT false,
    max_clients INT DEFAULT 100,
    current_clients INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_trainer_id,
    INDEX idx_is_published,
    INDEX idx_created_at
);

-- 4. WORKOUTS (exercises per week/program)
CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES programs(id),
    week_number INT,
    day_number INT, -- 1-7
    name VARCHAR(255),
    description TEXT,
    duration_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_program_id,
    UNIQUE(program_id, week_number, day_number)
);

-- 5. EXERCISES (individual movements in a workout)
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES workouts(id),
    exercise_name VARCHAR(255),
    sets INT,
    reps_min INT,
    reps_max INT,
    weight_kg DECIMAL(6,2),
    rest_seconds INT,
    form_cues TEXT,
    video_url VARCHAR(500), -- YouTube link
    order_number INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_workout_id,
    INDEX idx_order_number
);

-- 6. SUBSCRIPTIONS
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    trainer_id UUID NOT NULL REFERENCES trainers(id),
    program_id UUID NOT NULL REFERENCES programs(id),
    subscription_type VARCHAR(50), -- 'monthly', 'one_time'
    price_paid DECIMAL(10,2),
    stripe_subscription_id VARCHAR(255), -- For recurring
    stripe_payment_intent_id VARCHAR(255), -- For one-time
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'cancelled'
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    next_billing_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id,
    INDEX idx_trainer_id,
    INDEX idx_status,
    INDEX idx_started_at
);

-- 7. WORKOUT_LOGS (athlete logs completion)
CREATE TABLE workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    workout_id UUID NOT NULL REFERENCES workouts(id),
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id,
    INDEX idx_workout_id,
    INDEX idx_completed_at
);

-- 8. USER_PROGRESS
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    weight_kg DECIMAL(5,2),
    chest_cm INT,
    waist_cm INT,
    hip_cm INT,
    arm_cm INT,
    logged_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id,
    INDEX idx_logged_at
);

-- 9. MESSAGES
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL, -- Either user_id or trainer_id
    receiver_id UUID NOT NULL,
    content TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_sender_id,
    INDEX idx_receiver_id,
    INDEX idx_created_at
);

-- 10. REVIEWS
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    trainer_id UUID NOT NULL REFERENCES trainers(id),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_trainer_id,
    INDEX idx_user_id,
    UNIQUE(subscription_id) -- One review per subscription
);

-- 11. PAYMENTS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    amount DECIMAL(10,2),
    stripe_charge_id VARCHAR(255),
    status VARCHAR(50), -- 'succeeded', 'failed', 'pending'
    payment_method VARCHAR(50), -- 'stripe_card', etc
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_subscription_id,
    INDEX idx_status,
    INDEX idx_created_at
);

-- 12. FOLLOWS
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    trainer_id UUID NOT NULL REFERENCES trainers(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id,
    INDEX idx_trainer_id,
    UNIQUE(user_id, trainer_id)
);

-- INDEXES for common queries
CREATE INDEX idx_subscriptions_user_trainer ON subscriptions(user_id, trainer_id);
CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id, created_at);
CREATE INDEX idx_workout_logs_user_date ON workout_logs(user_id, completed_at DESC);
CREATE INDEX idx_progress_user_date ON user_progress(user_id, logged_at DESC);
```

---

## 🔌 API SPECIFICATION (REST Endpoints)

### Authentication Endpoints

```
POST /api/v1/auth/register
├─ Body: { email, password, full_name, user_type: 'athlete'|'trainer' }
├─ Returns: { access_token, refresh_token, user }
└─ Rate limit: 5 per 15 minutes

POST /api/v1/auth/login
├─ Body: { email, password }
├─ Returns: { access_token, refresh_token, user }
└─ Rate limit: 10 per 15 minutes

POST /api/v1/auth/refresh
├─ Body: { refresh_token }
├─ Returns: { access_token }
└─ Rate limit: 100 per 15 minutes

POST /api/v1/auth/logout
├─ Headers: Authorization: Bearer {token}
└─ Returns: { success: true }

POST /api/v1/auth/forgot-password
├─ Body: { email }
└─ Returns: { message: 'Reset email sent' }

POST /api/v1/auth/reset-password
├─ Body: { token, new_password }
└─ Returns: { message: 'Password reset' }
```

### User Profile Endpoints

```
GET /api/v1/users/me
├─ Headers: Authorization: Bearer {token}
└─ Returns: { id, email, full_name, avatar_url, bio, ... }

PUT /api/v1/users/me
├─ Headers: Authorization: Bearer {token}
├─ Body: { full_name, bio, height_cm, current_weight_kg, ... }
└─ Returns: { updated user }

PUT /api/v1/users/me/avatar
├─ Headers: Authorization: Bearer {token}
├─ Body: FormData with image
└─ Returns: { avatar_url }

GET /api/v1/users/me/progress
├─ Headers: Authorization: Bearer {token}
├─ Query: ?from=2024-01-01&to=2024-03-04
└─ Returns: [{ weight_kg, logged_at, ... }]

POST /api/v1/users/me/progress
├─ Headers: Authorization: Bearer {token}
├─ Body: { weight_kg, chest_cm, waist_cm, ... }
└─ Returns: { progress record }
```

### Trainer Discovery & Profile Endpoints

```
GET /api/v1/trainers
├─ Query: ?specialty=strength&sort=rating&limit=10&offset=0
├─ Optional filters: specialty, min_rating, max_price, language
└─ Returns: [{ id, full_name, rating, price_monthly, ... }]

GET /api/v1/trainers/:trainer_id
├─ Returns: { 
│   id, full_name, bio, certifications, years_experience,
│   rating_avg, review_count, programs: [{...}], reviews: [{...}]
│ }
└─ Includes: programs, recent reviews, top comments

GET /api/v1/trainers/:trainer_id/programs
├─ Returns: [{ id, name, duration_weeks, price_monthly, ... }]
└─ Only published programs

GET /api/v1/trainers/:trainer_id/reviews
├─ Query: ?sort=recent&limit=10
└─ Returns: [{ rating, comment, user_name, created_at }]
```

### Trainer Dashboard Endpoints (Protected)

```
GET /api/v1/trainers/dashboard/overview
├─ Headers: Authorization: Bearer {trainer_token}
├─ Returns: { 
│   active_clients: 12,
│   monthly_revenue: 2380,
│   unread_messages: 5,
│   avg_rating: 4.8,
│   total_reviews: 124
│ }

POST /api/v1/trainers/programs
├─ Headers: Authorization: Bearer {trainer_token}
├─ Body: { name, description, duration_weeks, difficulty, price_monthly }
└─ Returns: { program }

PUT /api/v1/trainers/programs/:program_id
├─ Headers: Authorization: Bearer {trainer_token}
├─ Body: { name, description, ... }
└─ Returns: { updated program }

POST /api/v1/trainers/programs/:program_id/publish
├─ Headers: Authorization: Bearer {trainer_token}
└─ Returns: { is_published: true }

GET /api/v1/trainers/dashboard/clients
├─ Headers: Authorization: Bearer {trainer_token}
├─ Returns: [{ 
│   user_id, user_name, program_id, started_at,
│   status, latest_progress
│ }]

GET /api/v1/trainers/dashboard/clients/:user_id
├─ Headers: Authorization: Bearer {trainer_token}
├─ Returns: { 
│   user: {...},
│   subscription: {...},
│   progress: [...],
│   workout_completion: {...},
│   latest_messages: [...]
│ }

GET /api/v1/trainers/dashboard/payments
├─ Headers: Authorization: Bearer {trainer_token}
├─ Returns: { 
│   total_revenue: 2380,
│   pending_payout: 1200,
│   last_payout_date: '2024-03-01',
│   payments: [{ amount, status, date }]
│ }
```

### Subscription & Payment Endpoints

```
POST /api/v1/subscriptions
├─ Headers: Authorization: Bearer {user_token}
├─ Body: { trainer_id, program_id, subscription_type: 'monthly'|'one_time' }
├─ Returns: { stripe_intent: {...}, subscription: {...} }
└─ Calls Stripe to create payment intent

POST /api/v1/subscriptions/confirm-payment
├─ Headers: Authorization: Bearer {user_token}
├─ Body: { stripe_payment_intent_id }
├─ Validates payment success
└─ Creates subscription in DB

GET /api/v1/subscriptions/me
├─ Headers: Authorization: Bearer {user_token}
├─ Returns: [{ 
│   id, trainer_name, program_name, started_at,
│   status, next_billing_date, price_monthly
│ }]

GET /api/v1/subscriptions/:subscription_id/workouts
├─ Headers: Authorization: Bearer {user_token}
├─ Query: ?week=1
├─ Returns: [{
│   id, week_number, day_number, name, exercises: [{...}]
│ }]

POST /api/v1/workouts/:workout_id/log
├─ Headers: Authorization: Bearer {user_token}
├─ Body: { notes: 'Felt strong today' }
└─ Returns: { logged }
```

### Messaging Endpoints

```
GET /api/v1/messages/conversations
├─ Headers: Authorization: Bearer {token}
└─ Returns: [{ 
│   conversation_id, 
│   other_user: { id, name, avatar },
│   last_message, 
│   unread_count, 
│   last_message_at 
│ }]

GET /api/v1/messages/conversations/:conversation_id
├─ Headers: Authorization: Bearer {token}
├─ Query: ?limit=30&offset=0
└─ Returns: [{ id, sender_id, content, created_at, is_read }]

POST /api/v1/messages/send
├─ Headers: Authorization: Bearer {token}
├─ Body: { receiver_id, content }
├─ Emits via Socket.io for real-time
└─ Returns: { message }

WebSocket Connection (Socket.io):
├─ Connect: /socket.io
├─ Emit: 'message:send' → { receiver_id, content }
├─ Listen: 'message:receive' ← { message }
└─ Auto-mark as read when received
```

### Review Endpoints

```
POST /api/v1/reviews
├─ Headers: Authorization: Bearer {user_token}
├─ Body: { trainer_id, subscription_id, rating: 1-5, comment }
└─ Returns: { review }

PUT /api/v1/reviews/:review_id
├─ Headers: Authorization: Bearer {user_token}
├─ Body: { rating, comment }
└─ Returns: { updated review }

GET /api/v1/trainers/:trainer_id/reviews
├─ Returns: [{ rating, comment, user_name, created_at }]
└─ Paginated, sorted by recent
```

---

## 🔐 SECURITY IMPLEMENTATION

### Password Hashing (bcryptjs)

```typescript
// backend/src/utils/password.ts
import bcryptjs from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcryptjs.genSalt(12); // Cost factor: 12
  return bcryptjs.hash(password, salt);
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcryptjs.compare(password, hash);
};
```

### JWT Token Strategy

```typescript
// backend/src/utils/jwt.ts
import jwt from 'jsonwebtoken';

interface TokenPayload {
  user_id: string;
  email: string;
  user_type: 'athlete' | 'trainer';
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '15m', // Short-lived
    algorithm: 'HS256'
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: '7d', // Long-lived
    algorithm: 'HS256'
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
};
```

### Middleware for Authentication

```typescript
// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer {token}
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const payload = verifyAccessToken(token);
    req.user = payload; // Attach user to request
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const trainerOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.user_type !== 'trainer') {
    return res.status(403).json({ error: 'Trainers only' });
  }
  next();
};

export const athleteOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.user_type !== 'athlete') {
    return res.status(403).json({ error: 'Athletes only' });
  }
  next();
};
```

### Rate Limiting

```typescript
// backend/src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
});

// Usage in routes
app.post('/api/v1/auth/login', authLimiter, loginController);
app.use('/api/v1/', generalLimiter);
```

### CORS Configuration

```typescript
// backend/src/config/cors.ts
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
```

### Input Validation (Zod)

```typescript
// backend/src/schemas/auth.ts
import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password min 8 chars'),
  full_name: z.string().min(2),
  user_type: z.enum(['athlete', 'trainer']),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Middleware for validation
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      return res.status(400).json({ errors: error.errors });
    }
  };
};
```

### Environment Variables (.env)

```bash
# JWT
JWT_SECRET=your_super_secret_key_min_32_chars_long_12345678
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars_long_12345678

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/gymer_viet

# Redis
REDIS_URL=redis://localhost:6379

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SENDGRID_API_KEY=SG...

# Frontend
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
PORT=3001
```

---

## 📁 PROJECT STRUCTURE (Folder Organization)

### Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # PostgreSQL connection
│   │   ├── redis.ts             # Redis connection
│   │   ├── stripe.ts            # Stripe config
│   │   └── cors.ts              # CORS config
│   │
│   ├── entities/                # TypeORM entities (DB models)
│   │   ├── User.ts
│   │   ├── Trainer.ts
│   │   ├── Program.ts
│   │   ├── Workout.ts
│   │   ├── Subscription.ts
│   │   ├── Message.ts
│   │   ├── Review.ts
│   │   └── ...
│   │
│   ├── routes/
│   │   ├── auth.ts              # /api/v1/auth
│   │   ├── users.ts             # /api/v1/users
│   │   ├── trainers.ts          # /api/v1/trainers
│   │   ├── programs.ts          # /api/v1/programs
│   │   ├── subscriptions.ts     # /api/v1/subscriptions
│   │   ├── messages.ts          # /api/v1/messages
│   │   └── reviews.ts           # /api/v1/reviews
│   │
│   ├── controllers/
│   │   ├── authController.ts    # Auth logic
│   │   ├── userController.ts    # User logic
│   │   ├── trainerController.ts # Trainer logic
│   │   ├── programController.ts # Program logic
│   │   ├── subscriptionController.ts
│   │   ├── messageController.ts
│   │   └── reviewController.ts
│   │
│   ├── services/
│   │   ├── authService.ts       # Auth business logic
│   │   ├── userService.ts
│   │   ├── trainerService.ts
│   │   ├── programService.ts
│   │   ├── subscriptionService.ts
│   │   ├── stripeService.ts     # Stripe integration
│   │   ├── emailService.ts      # SendGrid
│   │   └── messageService.ts
│   │
│   ├── middleware/
│   │   ├── auth.ts              # JWT middleware
│   │   ├── errorHandler.ts
│   │   ├── requestLogger.ts
│   │   └── rateLimit.ts
│   │
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   │
│   ├── jobs/
│   │   ├── emailJobs.ts         # Bull jobs
│   │   ├── payoutJobs.ts        # Monthly payouts
│   │   └── subscriptionJobs.ts  # Renewal reminders
│   │
│   ├── schemas/                 # Zod schemas
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   └── program.ts
│   │
│   ├── socket/
│   │   └── handlers.ts          # Socket.io event handlers
│   │
│   └── app.ts                   # Express app setup
│
├── .env.example
├── tsconfig.json
├── package.json
└── docker-compose.yml           # Local PostgreSQL + Redis
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── LogoutButton.tsx
│   │   │
│   │   ├── Trainer/
│   │   │   ├── TrainerCard.tsx
│   │   │   ├── TrainerProfile.tsx
│   │   │   ├── TrainerDashboard.tsx
│   │   │   ├── ProgramBuilder.tsx
│   │   │   └── ClientList.tsx
│   │   │
│   │   ├── Athlete/
│   │   │   ├── WorkoutView.tsx
│   │   │   ├── ProgressTracker.tsx
│   │   │   ├── TrainerFinder.tsx
│   │   │   └── SubscriptionFlow.tsx
│   │   │
│   │   ├── Shared/
│   │   │   ├── Header.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── ProgressChart.tsx
│   │   │   └── MessageBox.tsx
│   │   │
│   │   └── Layout/
│   │       ├── MainLayout.tsx
│   │       ├── AuthLayout.tsx
│   │       └── DashboardLayout.tsx
│   │
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── TrainerExplore.tsx
│   │   ├── TrainerProfile.tsx
│   │   ├── Dashboard.tsx
│   │   ├── MyWorkouts.tsx
│   │   ├── MyProgress.tsx
│   │   ├── Messages.tsx
│   │   └── Settings.tsx
│   │
│   ├── store/
│   │   ├── slices/
│   │   │   ├── authSlice.ts      # Redux slice for auth
│   │   │   ├── userSlice.ts
│   │   │   ├── trainerSlice.ts
│   │   │   └── uiSlice.ts
│   │   │
│   │   └── store.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTrainers.ts
│   │   ├── useWorkouts.ts
│   │   ├── useMessages.ts
│   │   └── useApiCall.ts
│   │
│   ├── services/
│   │   ├── api.ts               # Axios setup
│   │   ├── auth.ts              # Auth API calls
│   │   ├── trainers.ts
│   │   ├── workouts.ts
│   │   ├── subscriptions.ts
│   │   ├── messages.ts
│   │   └── socket.ts
│   │
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── validators.ts
│   │   └── formatters.ts
│   │
│   ├── styles/
│   │   ├── globals.css           # Tailwind
│   │   └── theme.css
│   │
│   ├── types/
│   │   ├── index.ts              # TypeScript types
│   │   ├── api.ts
│   │   ├── models.ts
│   │   └── redux.ts
│   │
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx                  # Vite entry
│
├── .env.example
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🚀 DEPLOYMENT SETUP (Heroku)

### Heroku Procfile

```
# Procfile
web: npm run start
```

### Heroku Environment Variables

```bash
heroku config:set JWT_SECRET=your_secret
heroku config:set JWT_REFRESH_SECRET=your_secret
heroku config:set NODE_ENV=production
heroku config:set STRIPE_SECRET_KEY=sk_...
heroku config:set STRIPE_PUBLISHABLE_KEY=pk_...
heroku config:set SENDGRID_API_KEY=SG_...
heroku config:set FRONTEND_URL=https://gymerviet.com
```

### Deploy Commands

```bash
# Install Heroku CLI
npm i -g heroku

# Login to Heroku
heroku login

# Create app
heroku create gymer-viet-backend

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Add Redis addon
heroku addons:create heroku-redis:premium-0

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

---

## ✅ SECURITY CHECKLIST BEFORE LAUNCH

- [ ] HTTPS enforced (Heroku auto-handles)
- [ ] Password hashing with bcryptjs (12 cost factor)
- [ ] JWT tokens implemented (15m access, 7d refresh)
- [ ] Refresh token rotation working
- [ ] Rate limiting configured
- [ ] Input validation with Zod
- [ ] CORS policy set correctly
- [ ] Environment variables not in code
- [ ] Database backups automated
- [ ] Error logging doesn't leak sensitive info
- [ ] SQL injection prevention (TypeORM parameterized)
- [ ] XSS prevention (React auto-escapes)
- [ ] Stripe PCI compliance verified
- [ ] Audit logging enabled
- [ ] Sentry error tracking configured

---

## 📊 NEXT STEPS

### Phase 1 (Week 1-2): Foundation
- [ ] Create GitHub repo
- [ ] Set up Figma designs
- [ ] Design database schema
- [ ] Init Node backend + React frontend

### Phase 2 (Week 3-4): Core Features
- [ ] Auth system (register, login)
- [ ] User profiles
- [ ] Trainer discovery page
- [ ] Reviews & ratings

### Phase 3 (Week 5-6): Coaching
- [ ] Subscriptions & Stripe
- [ ] Program management
- [ ] Workout assignment
- [ ] Messaging system

### Phase 4 (Week 7-8): Polish
- [ ] Testing
- [ ] Security review
- [ ] Performance optimization
- [ ] Trainer dashboard

### Phase 5 (Week 9): Launch
- [ ] Final polish
- [ ] Documentation
- [ ] Deploy to Heroku
- [ ] LAUNCH! 🚀

This is your complete foundation! Ready to code? 🚀
