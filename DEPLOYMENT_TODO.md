# I. PRE-DEPLOYMENT (Chuẩn bị trước khi Deploy)

## Phase 1: Security Audit & Best Practices (CRITICAL)

### 1.1 Security Checklist
- [x] Kiểm tra tất cả `console.log()` debug code (remove trước deploy)
- [x] Verify không có hardcoded credentials trong code
- [x] Scan npm dependencies: `npm audit` - fix vulnerabilities
- [x] Enable HTTPS everywhere (redirect HTTP → HTTPS)
- [x] CORS configuration: restrict domains (not *)
- [x] Rate limiting enabled on all APIs
- [x] SQL injection prevention: verify parameterized queries
- [x] XSS prevention: React auto-escapes, verify no `dangerouslySetInnerHTML`
- [x] CSRF tokens verified
- [x] Password hashing: bcryptjs cost factor = 12 (verify)
- [x] JWT secret length: min 32 characters (verify)
- [x] Env variables: never committed to Git
- [x] `.gitignore`: includes `.env`, `node_modules/`, `dist/`

Tools:
```bash
npm audit                    # Check vulnerabilities
npm audit fix               # Auto-fix if possible
npm outdated                # Check outdated packages
snyk test                   # Advanced security scanning (if needed)
```

### 1.2 Performance Check
- [x] Frontend bundle size < 500KB (gzip)
- [x] API response time < 200ms (target)
- [x] Database queries: check slow queries (no N+1 queries)
- [x] Images: optimized & compressed
- [x] Lazy loading: implement for images & routes
- [x] Caching strategy: verified

Check:
```bash
npm run build               # Build production
npx vite-plugin-inspect    # Analyze bundle
```

### 1.3 Database Preparation
- [x] All migrations ready & tested locally
- [x] Backup strategy decided
- [x] Test data cleanup (remove dev data)
- [x] Database indexes verified
- [x] Charset: UTF-8 (for Vietnamese)
- [x] Timezone: UTC for timestamps
- [x] Connection pooling: configured

## Phase 2: Infrastructure Planning

### 2.1 Server Choice
Recommended Stack for GYMERVIET:
**Option 1 (RECOMMENDED): DigitalOcean + Vercel + Supabase**
├─ Backend: DigitalOcean App Platform ($12/month)
│  └─ Auto-scaling, CI/CD, SSL included
├─ Database: Supabase (PostgreSQL) ($25/month)
│  └─ Managed, backups, SSL included
├─ Frontend: Vercel (Free tier)
│  └─ Auto-deploy from Git, CDN included
├─ Cache: Redis on DigitalOcean ($7/month)
├─ Storage: AWS S3 ($1-5/month)
└─ Total: ~$45-50/month (very reasonable)

### 2.2 Domain Setup
- [ ] Register domain: gymerviet.com (already purchased)
- [ ] Domain registrar: GoDaddy / Namecheap / Google Domains
- [ ] DNS records configured:
  - A record: points to backend IP
  - CNAME: www → gymerviet.com
  - MX records (for email, if needed)
  - TXT: for email verification (SPF, DKIM)

Expected:
- Domain: gymerviet.com
- Backend API: api.gymerviet.com
- Frontend: gymerviet.com (or www.gymerviet.com)
- Trainer profiles: trainer-slug.gymerviet.com (future, via CNAME wildcard)

# II. BACKEND DEPLOYMENT

## Phase 3: Backend Infrastructure Setup

### 3.1 DigitalOcean App Platform Setup (Recommended)
1. Create DigitalOcean Account
2. Create App Platform App
   - Connect GitHub repo
   - Select backend folder
   - Buildpack: Node.js
   - Start command: npm start
   - Plan: Basic ($12/month)
3. Configure Environment Variables
4. Set Build Command
5. Enable Auto-Deploy

### 3.2 Supabase PostgreSQL Setup
1. Create Supabase Project
2. Initialize Database (Run migrations & Seed)
3. Setup Connection (`DATABASE_URL`)
4. Backups Enable
5. Security (SSL, IP restriction, PgBouncer)

### 3.3 Redis Cache Setup (DigitalOcean)
1. Create DigitalOcean Database (Redis)
2. Configuration (`REDIS_URL`)
3. Usage in App

### 3.4 SSL/TLS Certificate (AUTOMATIC)
DigitalOcean handles SSL automatically.

### 3.5 Webhook Configuration (Sepay)
- Cấu hình Webhook trong hệ thống Sepay trỏ tới: `https://api.gymerviet.com/api/v1/subscriptions/webhook/sepay`

# III. FRONTEND DEPLOYMENT

## Phase 4: Frontend to Vercel

### 4.1 Vercel Setup (Recommended)
1. Connect GitHub
2. Configure Project
3. Environment Variables (`VITE_API_URL=https://api.gymerviet.com/api/v1`)
4. Custom Domain
5. Deploy

### 4.2 vercel.json Configuration
Set up rewrite rules to `index.html` for SPA routing.

### 4.3 CI/CD Pipeline (Automatic)
Automatic deployment on git push.

# IV. CONFIGURATION & MONITORING

## Phase 5: Production Configuration

### 5.1 Environment Variables Checklist
**BACKEND (node)**
- [ ] NODE_ENV=production
- [ ] PORT=3001
- [ ] JWT_SECRET
- [ ] JWT_REFRESH_SECRET
- [ ] DATABASE_URL
- [ ] REDIS_URL
- [ ] SENDGRID_API_KEY
- [ ] AWS_ACCESS_KEY_ID
- [ ] AWS_SECRET_ACCESS_KEY
- [ ] AWS_S3_BUCKET
- [ ] FRONTEND_URL=https://gymerviet.com

**FRONTEND (React)**
- [ ] VITE_API_URL=https://api.gymerviet.com/api/v1

### 5.2 CORS Configuration (Backend)
Restrict to `['https://gymerviet.com', 'https://www.gymerviet.com']`.

## Phase 6: Monitoring & Logging
- [ ] Sentry / Error Tracking
- [ ] Logs Monitoring (PM2/DigitalOcean)
- [ ] Uptime Monitoring (Uptime Robot)
- [ ] Database Monitoring (Supabase)

## Phase 7: Backup & Disaster Recovery
- [ ] Manual Database Backups (Cronjob to S3)
- [ ] Secrets Backup (Offline storage)
- [ ] Disaster Recovery Plan

# V. TESTING & VERIFICATION
- [ ] Functionality Tests (Registration, Subscriptions, Payments)
- [ ] Performance Tests (Google PageSpeed, Lighthouse)
- [ ] Security Tests (HTTPS, CORS, Rate Limiting, Injection prevention)
- [ ] Browser Compatibility

# VI. LAUNCH CHECKLIST
## 9.1 Final Checks (24 hours before)
- [ ] Security checks passed
- [ ] Functionality working
- [ ] Monitoring enabled

## 9.2 Launch Day
- Backup DB, Switch DNS, Monitor metrics, Celebrate.

# VII. COST BREAKDOWN
- Expected Total Monthly: ~$45-50/month

---
⚠️ REMEMBER: Thực hiện các bước trên CHỈ khi được cấp phép.
