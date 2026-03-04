# 🚀 GYMER VIỆT - DEVELOPMENT STARTUP GUIDE

Quick setup to start coding!

---

## PART 1: BACKEND SETUP (Node.js + Express + TypeScript)

### Step 1: Initialize Project

```bash
# Create backend folder
mkdir gymer-viet-backend
cd gymer-viet-backend

# Initialize npm
npm init -y

# Install dependencies
npm install express cors dotenv helmet zod
npm install postgresql typeorm reflect-metadata
npm install jsonwebtoken bcryptjs
npm install stripe axios
npm install socket.io socket.io-client
npm install bull redis
npm install winston

# Install dev dependencies
npm install -D typescript @types/node @types/express
npm install -D ts-node nodemon
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D eslint prettier
npm install -D jest @types/jest ts-jest

# Git setup
git init
echo "node_modules/\n.env\n.env.local\ndist/" > .gitignore
```

### Step 2: TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 3: Package.json Scripts

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  }
}
```

### Step 4: Create Main App File

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
```

### Step 5: Create .env File

```bash
# .env (NEVER commit this!)
JWT_SECRET=your_super_secret_key_min_32_chars_long_12345678
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars_long_12345678
DATABASE_URL=postgresql://postgres:password@localhost:5432/gymer_viet
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
SENDGRID_API_KEY=SG...
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
PORT=3001
```

### Step 6: Setup PostgreSQL & Redis Locally

```bash
# Using Docker (Recommended)
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: gymer_viet
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
EOF

# Start services
docker-compose up -d

# Check if running
docker ps
```

### Step 7: Test Backend

```bash
# Start dev server
npm run dev

# In another terminal, test API
curl http://localhost:3001/api/v1/health

# Should return:
# {"status":"OK","timestamp":"2024-03-04T..."}
```

---

## PART 2: FRONTEND SETUP (React + Vite + TypeScript)

### Step 1: Create React App with Vite

```bash
# In parent directory
npm create vite@latest gymer-viet-frontend -- --template react-ts

cd gymer-viet-frontend

# Install dependencies
npm install

# Install additional packages
npm install react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

npm install @reduxjs/toolkit react-redux
npm install @tanstack/react-query axios
npm install react-hook-form zod @hookform/resolvers
npm install recharts
npm install socket.io-client
npm install date-fns classnames
npm install dotenv

# Dev tools
npm install -D eslint prettier
npm install -D @types/react @types/react-dom
```

### Step 2: Tailwind CSS Setup

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        danger: '#EF4444',
      }
    },
  },
  plugins: [],
}
```

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background-color: #f9fafb;
}
```

### Step 3: Create Redux Store

```typescript
// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Step 4: Create Auth Service

```typescript
// src/services/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic here
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Step 5: Setup React Router

```typescript
// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { store } from './store/store';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TrainerExplore from './pages/TrainerExplore';
import Dashboard from './pages/Dashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/trainers" element={<TrainerExplore />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
```

### Step 6: Create .env File

```bash
# .env
VITE_API_URL=http://localhost:3001/api/v1
VITE_APP_NAME=GYMERVIET
```

### Step 7: Test Frontend

```bash
# Start dev server
npm run dev

# Open http://localhost:5173
```

---

## PART 3: GIT & VERSION CONTROL

### Initialize Git Repository

```bash
# Create main repo
mkdir gymer-viet
cd gymer-viet
git init

# Add subdirectories
git submodule add ./gymer-viet-backend backend
git submodule add ./gymer-viet-frontend frontend

# Or just keep both folders in one repo:
# .
# ├── backend/
# └── frontend/
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/auth-system

# Make changes
# Commit
git add .
git commit -m "feat: add authentication system"

# Push to GitHub
git push origin feature/auth-system

# Create Pull Request on GitHub
# After review, merge to main
git checkout main
git pull origin main

# Delete branch
git branch -d feature/auth-system
```

---

## PART 4: DEVELOPMENT WORKFLOW

### Day 1: Authentication

**Backend:**
```bash
# Create auth routes
touch src/routes/auth.ts
touch src/controllers/authController.ts
touch src/services/authService.ts

# Create user entity
touch src/entities/User.ts
```

**Frontend:**
```bash
# Create auth pages
touch src/pages/Login.tsx
touch src/pages/Register.tsx

# Create auth components
touch src/components/Auth/LoginForm.tsx
touch src/components/Auth/RegisterForm.tsx
```

### Day 2: Trainer Discovery

**Backend:**
```bash
# Create trainer routes
touch src/routes/trainers.ts
touch src/controllers/trainerController.ts

# Create trainer entity
touch src/entities/Trainer.ts
```

**Frontend:**
```bash
# Create trainer pages
touch src/pages/TrainerExplore.tsx
touch src/pages/TrainerProfile.tsx

# Create trainer components
touch src/components/Trainer/TrainerCard.tsx
touch src/components/Trainer/TrainerFilter.tsx
```

### Day 3: Subscriptions

**Backend:**
```bash
# Create subscription routes
touch src/routes/subscriptions.ts
touch src/controllers/subscriptionController.ts
touch src/services/stripeService.ts

# Create subscription entity
touch src/entities/Subscription.ts
```

**Frontend:**
```bash
# Create subscription pages
touch src/pages/SubscriptionFlow.tsx

# Create subscription components
touch src/components/Subscription/PaymentForm.tsx
```

---

## PART 5: TESTING LOCALLY

### Test Auth Endpoint

```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Test registration
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "user_type": "athlete"
  }'

# Should return: { access_token, refresh_token, user }
```

### Test Frontend

```bash
# In frontend folder
npm run dev

# Open http://localhost:5173
# Try login page - should connect to http://localhost:3001
```

---

## PART 6: COMMON COMMANDS

### Backend

```bash
npm run dev           # Start development server
npm run build         # Build TypeScript
npm run start         # Start built server
npm run test          # Run tests
npm run lint          # Check code style
npm run format        # Auto-format code
```

### Frontend

```bash
npm run dev           # Start Vite dev server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Check code style
```

### Docker (if using docker-compose)

```bash
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose logs -f postgres   # View logs
docker-compose ps                 # View running containers
```

---

## ✅ CHECKLIST: YOU'RE READY TO CODE!

- [ ] Backend running on http://localhost:3001
- [ ] Frontend running on http://localhost:5173
- [ ] PostgreSQL running on localhost:5432
- [ ] Redis running on localhost:6379
- [ ] Git initialized
- [ ] Figma opened for design reference
- [ ] .env files created (not committed)
- [ ] Can make API calls from frontend

## 🚀 Next: Start with Auth System

Begin with authentication:
1. Create login/register endpoints
2. Create login/register pages
3. Test with Postman or curl
4. Move to next feature

Good luck! 💪
