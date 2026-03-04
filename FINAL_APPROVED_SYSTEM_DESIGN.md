# ✅ GYMER VIỆT - FINAL SYSTEM DESIGN (APPROVED)

**Version:** Final (Based on Product Owner Feedback)
**Date:** Tháng 3, 2026
**Status:** Ready for Implementation
**Prepared by:** Product Team & Claude AI

---

## I. VERIFICATION SYSTEM - FINAL

### **ATHLETE VERIFICATION**

```
STEP 1: EMAIL VERIFICATION (Bắt buộc)
├─ Khi đăng ký: Gửi email xác minh
├─ Click link (24h hạn)
├─ Email verified ✅
└─ Unlock full features

STEP 2: ACHIEVEMENT VERIFICATION (Optional - Để lấy badge)
├─ Athlete upload achievement image/certificate
├─ Types: Medal, certificate, competition record, etc
├─ Admin review + verify
├─ If approved: ⭐ Athlete Verified badge
├─ If 3+ gold medals: 🏆 Elite Performer badge
└─ Display on profile

REGULAR USER:
├─ No verification needed
├─ Can browse & view profiles
├─ Cannot message coaches
└─ Can upgrade to Athlete role anytime

STATUS: ✅ APPROVED
```

### **COACH VERIFICATION**

```
STEP 1: EMAIL VERIFICATION (Bắt buộc)
├─ Khi đăng ký: Gửi email xác minh
├─ Click link (24h hạn)
├─ Email verified ✅
└─ Profile visible to athletes

STEP 2: CERTIFICATION VERIFICATION (Bắt buộc - BEFORE accepting clients)
├─ Coach upload:
│  ├─ Ảnh chứng chỉ (NASM, ACE, etc)
│  ├─ Ảnh selfie với chứng chỉ (liveness check)
│  └─ Certificate details (name, number, expiry)
│
├─ Admin review (God Mode):
│  ├─ Verify certificate authenticity
│  ├─ Check selfie (liveness detection)
│  ├─ Verify details match
│  └─ Status: Approve ✅ / Reject ❌ / Ask More Info ❓
│
├─ If approved:
│  ├─ ✅ Certification Verified badge (GREEN CHECK - PROMINENT)
│  ├─ Can accept athletes
│  ├─ Display in rankings
│  └─ High credibility signal
│
└─ If rejected:
   ├─ Cannot accept athletes
   ├─ Can resubmit after fix
   ├─ Can appeal with new docs
   └─ Email explains reason

IMPORTANT:
└─ ✅ Certification Verified is THE MOST IMPORTANT badge for coaches
   └─ This is what gives athletes trust
   └─ Must be prominent on profile & homepage

STATUS: ✅ APPROVED
```

---

## II. POINTS SYSTEM - FINAL

### **POINT MECHANICS**

```
INITIAL POINTS:
├─ All users (Regular, Athlete, Coach): 10 points
└─ Given on registration (to start equal)

DAILY CHECK-IN:
├─ Each day login: +1 point
├─ PENALTY: No login for 2+ days = -1 point
│  ├─ Day 1 after 2 days: -1 point
│  └─ Then can earn again next check-in
├─ Max gain per day: 1 point (no spam)
├─ Can see streak: "Logged in 30 days" badge
└─ Unlimited accumulation (no cap)

POINT CALCULATION EXAMPLE:
├─ Coach A: Registers = 10 points
│            Check-in Day 1 = +1 (total: 11)
│            Check-in Day 2 = +1 (total: 12)
│            Missing Day 3-4 = -1 (total: 11)
│            Check-in Day 5 = +1 (total: 12)
│            ... continues
│
└─ Coach B: Registers = 10 points
             No check-in (inactive)
             = stays 10 points

DISPLAY:
├─ Profile: Show current points + breakdown
├─ Homepage: Sort by points (highest first)
├─ Top 1-3: Featured with medal (🥇🥈🥉)
├─ Card shows: Name, Points, Badge status
└─ Leaderboard: Refresh hourly

TOPUP INTERPRETATION CLARIFIED:
├─ What you meant: Position on homepage sort (not payment)
├─ Correct: Highest points = featured first (automatic)
├─ No paid "bump" feature needed
├─ Merit-based ranking only ✅

STATUS: ✅ APPROVED (Points system is strict merit-based)
```

### **POINT SOURCES**

```
CURRENT MVP:
├─ Registration: 10 points (default)
├─ Daily check-in: +1 point
└─ 2+ day penalty: -1 point

FUTURE ADDITIONS (Phase 2):
├─ First positive review: +5 points
├─ Become Highly Rated (4.8+): +10 points
├─ Certification verified: +5 points
├─ Complete profile (100%): +5 points
└─ Athlete gets achievement verified: +3 points

STATUS: ✅ MVP ONLY (Just daily check-in for now)
```

---

## III. BADGE SYSTEM - FINAL

### **ATHLETE BADGES**

```
FLAT ICON DESIGN (Minimalist):

✅ EMAIL VERIFIED
├─ Icon: Checkmark + envelope (flat)
├─ Color: Green (#00AA00)
├─ Awarded: Automatic on email verification
├─ Display: Always on profile
└─ Meaning: Email confirmed

⭐ ATHLETE VERIFIED
├─ Icon: Star + medal (flat)
├─ Color: Gold (#FFD700)
├─ Awarded: Manual (admin verify achievement)
├─ Requirement: Upload achievement certificate
├─ Display: Prominent on profile
└─ Meaning: Verified competition athlete

🏆 ELITE PERFORMER
├─ Icon: Trophy (flat)
├─ Color: Gold (#FFD700) - Premium
├─ Awarded: Automatic when 3+ gold medals verified
├─ Requirement: 3 or more gold medal achievements
├─ Display: Top of profile (most prestigious)
└─ Meaning: Exceptional athlete

DISPLAY ON HOMEPAGE:
├─ Athlete card shows badges
├─ ⭐ badge = More credible
├─ 🏆 badge = Top tier
└─ Sort by points (not badges)

STATUS: ✅ APPROVED (Flat design, 3 badges only)
```

### **COACH BADGES**

```
FLAT ICON DESIGN (Minimalist):

✅ EMAIL VERIFIED
├─ Icon: Checkmark + envelope (flat)
├─ Color: Green (#00AA00)
├─ Awarded: Automatic on email verification
├─ Display: Always
└─ Meaning: Email confirmed

✅ CERTIFICATION VERIFIED
├─ Icon: Certificate + checkmark (flat)
├─ Color: Green (#00AA00) with GOLD ACCENT (★)
├─ Awarded: Manual (admin verify certificate)
├─ Requirement: Upload cert + selfie with cert
├─ Display: PROMINENT (top of profile, homepage)
├─ Importance: CRITICAL - This is trust signal
└─ Meaning: Admin verified coach (qualified)

🏆 HIGHLY RATED
├─ Icon: Star (flat)
├─ Color: Gold (#FFD700)
├─ Awarded: Automatic when rating ≥ 4.8
├─ Display: On profile
└─ Meaning: Excellent coach (4.8+ rating)

👥 EXPERIENCED COACH
├─ Icon: People + checkmark (flat)
├─ Color: Gray (#666666)
├─ Awarded: Automatic when clients ≥ 100
├─ Display: On profile
└─ Meaning: Proven track record (100+ clients)

DISPLAY ON HOMEPAGE:
├─ ✅ Certification Verified = MUST SHOW (this is key!)
├─ 🏆 Highly Rated = Show if earned
├─ 👥 Experienced = Show if earned
└─ Sort by points (but cert badge attracts athletes most)

IMPORTANT NOTE:
└─ Certification Verified is THE credibility badge
   └─ Athletes will choose verified coaches over unverified
   └─ This must be prominent & obvious

STATUS: ✅ APPROVED (4 badges, cert is KEY)
```

---

## IV. ADMIN GOD MODE - FINAL

### **NEW ADMIN DASHBOARD SECTIONS**

```
/admin/verifications (NEW PAGE)

SECTION 1: COACH CERTIFICATION VERIFICATION
├─ Status: ✅ ADMIN CAN VIEW MESSAGES
├─ Table showing:
│  ├─ Coach name
│  ├─ Email
│  ├─ Certificate type
│  ├─ Upload date
│  ├─ Status (Pending/Approved/Rejected)
│  └─ Actions: [View] [Approve] [Reject] [Ask Info] [Resubmit]
│
├─ Click coach → Full view:
│  ├─ Certificate image (zoom capability)
│  ├─ Selfie image (zoom capability)
│  ├─ Cert details (name, number, expiry)
│  ├─ Coach background info
│  └─ Admin notes field
│
├─ Admin actions:
│  ├─ [✅ Approve] → Badge added, coach unlocked
│  ├─ [❌ Reject] → Coach notified (reason required)
│  │  └─ Reason options: Blurry, Fake, Expired, Invalid, Other
│  ├─ [❓ Ask More Info] → Message sent to coach
│  └─ [View Private Messages] → Access coach convo (A)
│
└─ Filters:
   ├─ Status (Pending, Approved, Rejected)
   ├─ Certificate type
   ├─ Date range
   └─ Coach name search

SECTION 2: ATHLETE ACHIEVEMENT VERIFICATION
├─ Similar to coach certs (optional Phase 2)
├─ Athletes upload medal/achievement images
├─ Admin verifies
├─ If 3 gold verified → 🏆 Elite badge auto-awarded
└─ Can view & manage achievements

SECTION 3: POINTS MANAGEMENT
├─ View all users + points
├─ See check-in history
├─ See penalties applied
├─ Manual adjust (rare cases) ✅ ADMIN CAN
├─ Leaderboard view
└─ Activity audit log

SECTION 4: BADGE MANAGEMENT
├─ View all badges distributed
├─ Manual assign (rare)
├─ Manual revoke (if abuse)
├─ Bulk operations (export certified coaches)
└─ Audit trail (who did what)

SECTION 5: MESSAGE MONITORING
├─ ✅ ADMIN CAN ACCESS MESSAGES
├─ View flagged/reported conversations
├─ Search by user/keyword
├─ Moderation actions (warn, mute, ban)
├─ Privacy: Only flagged messages (not all)
└─ Audit trail (admin view logs)

ADMIN ACTIONS DASHBOARD:
├─ See pending verifications
├─ See appeals pending
├─ See user reports pending
├─ See suspended users
├─ See banned users
└─ Quick stats dashboard

STATUS: ✅ APPROVED (Full God Mode with message access)
```

---

## V. PERMISSION MATRIX - FINAL

### **REGULAR USER**

```
✅ Can:
├─ Create account
├─ Browse profiles
├─ View programs at /programs (existing)
├─ Subscribe to coach programs
├─ Subscribe to athlete programs
├─ Rate & review coaches
├─ Upgrade to Athlete/Coach role
└─ Limited messaging (if subscribed)

❌ Cannot:
├─ Coach others
├─ Create programs
├─ Accept athlete clients
└─ Full message access

STATUS: ✅ APPROVED
```

### **ATHLETE**

```
✅ Can:
├─ All regular user features
├─ Upload achievement (for badge)
├─ Get Athlete Verified ⭐ badge
├─ Get Elite Performer 🏆 badge
├─ Daily check-in (+1 point, -1 penalty)
├─ CREATE programs (at /programs existing)
├─ SELL their own programs (80% revenue)
├─ Subscribe to coach programs
├─ Subscribe to other athlete programs
├─ Message coaches (if subscribed)
├─ Rate & review coaches
├─ Join challenges
└─ Build points & appear in ranking

❌ Cannot:
├─ Coach regular users or coaches
│  └─ Reason: Role clarity (athlete ≠ coach)
│  └─ If wants to coach → Switch to Coach role
├─ Access admin features
├─ Create unlimited programs (can limit to 5?)
└─ Feature in "Coach" section

IMPORTANT RESTRICTION:
└─ Athlete CANNOT coach Coach
   └─ Because: Athlete = student, Coach = authority
   └─ This protects role integrity

STATUS: ✅ APPROVED (Cannot coach coaches - role clarity)
```

### **COACH**

```
✅ Can:
├─ All regular user features
├─ Upload certification (REQUIRED)
├─ Get ✅ Certification Verified badge (ADMIN verify)
├─ Get 🏆 Highly Rated badge (4.8+)
├─ Get 👥 Experienced Coach badge (100+ clients)
├─ Daily check-in (+1 point, -1 penalty)
├─ CREATE programs (at /programs existing)
├─ SELL their own programs (80% revenue)
├─ Subscribe to athlete programs (learning)
├─ Accept athlete clients (if certified)
├─ Message athletes (if subscribed)
├─ Rate & review athletes (behavior tracking)
├─ View athlete progress
├─ Export athlete data
├─ Appear in ranking by points
└─ Featured in "Coach" section

❌ Cannot:
├─ Subscribe to other coach programs
│  └─ Reason: Prevent coach competition
├─ Coach other coaches
├─ Access admin features
├─ Create unlimited programs (can limit to 5?)
└─ Verify own credentials (admin must verify)

IMPORTANT RESTRICTION:
└─ Coach CANNOT buy other coach programs
   └─ Reason: Prevent unfair competition

STATUS: ✅ APPROVED (No cross-coach programs)
```

---

## VI. PROGRAMS SYSTEM (EXISTING - LOGIC ONLY)

### **IMPORTANT CLARIFICATION**

```
⚠️ PROGRAM SYSTEM ALREADY EXISTS AT:
   https://www.gymerviet.com/programs

WHAT YOU ASKED:
├─ "Gói/khóa học ở đây là https://www.gymerviet.com/programs"
├─ "Đã có sẵn, không phải làm mới"
├─ "Chỉ logic lại ruler"
└─ MEANING: Only adjust permissions/logic, don't rebuild

WHAT THIS MEANS:
├─ Keep existing /programs page
├─ Keep existing structure
├─ Only change:
│  ├─ Who can create (add athletes)
│  ├─ Revenue split (change to 95-5)
│  ├─ Admin moderation rules
│  └─ Display logic (sort by type/creator)
└─ Do NOT rebuild from scratch

PROGRAMS LOGIC ADJUSTMENTS:

1. CREATORS:
   ├─ Current: Only coaches
   ├─ NEW: Coaches + Athletes
   └─ Both at same /programs page (unified)

2. REVENUE:
   ├─ Current: Unknown
   ├─ NEW: 95% to creator, 5% to platform
   │  └─ This is much more generous than original (80-20)
   │  └─ Encourages creator to promote more
   └─ Split payment processing unchanged

3. PROGRAM TYPES:
   ├─ Coach can create: Training, courses, meal plans, coaching
   ├─ Athlete can create: Same (all types allowed)
   └─ No distinction in types (unified)

4. QUALITY CONTROL:
   ├─ Current: Unknown
   ├─ NEW: Auto-publish (no approval needed)
   ├─ If flagged: Rapid admin review & removal
   ├─ False reports get flagged (prevent abuse)
   └─ Creator can appeal

5. DISPLAY:
   ├─ Filter by: Trainer vs Athlete creator
   ├─ Sort by: Points (coach/athlete points in ranking)
   ├─ Search: By title, creator, type
   ├─ Verified badge: Show cert badge on coach programs
   └─ Featured: Top creator programs based on points

STATUS: ✅ APPROVED (Keep /programs, adjust logic only)
```

---

## VII. REVENUE MODEL - FINAL

### **PROGRAM REVENUE SPLIT**

```
NEW SPLIT (Product Owner Decision):
├─ Creator (Coach or Athlete): 95%
├─ Platform (GymEr Việt): 5%
└─ Reason: Very generous to encourage creators

EXAMPLE:
├─ Program price: $100
├─ Creator gets: $95 (95%)
├─ GymEr gets: $5 (5%)
│  └─ To cover: Payment processing, server, support
│
└─ This is MUCH better than original 80-20
   └─ Creators will love this
   └─ Encourage more program creation

PAYMENT FLOW:
├─ Athlete/Coach creates program
├─ Sets price (coach: $29-999, athlete: $9-499)
├─ Athletes subscribe
├─ Payment processed via Stripe
├─ GymEr takes 5% cut
├─ Creator paid within 7 days
└─ Creator can withdraw to bank

STRIPE FEES (Not mentioned but exists):
├─ Stripe takes: 2.9% + $0.30 per transaction
├─ This is deducted from GymEr's 5% (not creator)
├─ Example: $100 program
│  ├─ Stripe fee: $3.20
│  ├─ GymEr platform: 5% = $5.00
│  ├─ After Stripe: $5.00 - $3.20 = $1.80 net to GymEr
│  └─ Creator: $95.00
│
└─ Note: Budget might need adjustment if margin too thin

STATUS: ✅ APPROVED (95-5 split is final)
```

---

## VIII. DESIGN SPECIFICATIONS - FINAL

### **FLAT ICON DESIGN**

```
STYLE: Flat, minimal, modern
├─ No gradients
├─ No shadows
├─ Simple outlines
├─ Consistent size
├─ 2-3 colors max per icon

EXAMPLES:

✅ Email Verified:
   ├─ Envelope outline + checkmark
   ├─ Green (#00AA00)
   └─ 24x24px

⭐ Athlete Verified:
   ├─ Star + medal outline
   ├─ Gold (#FFD700)
   └─ 24x24px

✅ Certification Verified:
   ├─ Certificate + checkmark
   ├─ Green with gold accent
   └─ 24x24px (prominent)

🏆 Elite Performer:
   ├─ Trophy outline
   ├─ Gold (#FFD700)
   └─ 24x24px

🏆 Highly Rated:
   ├─ Star outline
   ├─ Gold (#FFD700)
   └─ 24x24px

👥 Experienced Coach:
   ├─ People + checkmark
   ├─ Gray (#666666)
   └─ 24x24px

IMPLEMENTATION:
├─ Use: FontAwesome or custom SVG
├─ Consistency: Same stroke width
├─ Hover: Slight scale (+5%)
├─ Display: Next to name on profile & cards
└─ Mobile: Responsive (16x16 on mobile)

STATUS: ✅ APPROVED (Flat, minimal icons only)
```

### **POINTS DISPLAY**

```
HOMEPAGE:

Coach/Athlete Card:
┌──────────────────────────┐
│ [Avatar] Coach Name      │
│          Specialty       │
│                          │
│ ✅ Certification Verified│ ← If certified
│ 🏆 Highly Rated (4.8★)  │ ← If earned
│                          │
│ Points: 45 🏅           │ ← SHOW POINTS
│ Streak: 10 days 🔥      │ ← If applicable
│                          │
│ [View] [Contact]        │
└──────────────────────────┘

TOP 1-3 FEATURED:
┌──────────────────────────┐
│ 🥇 1st Coach Name        │ ← Gold medal
│    120 Points            │ ← Largest card
│    Featured description  │
└──────────────────────────┘

Profile Page:

Points Section:
├─ Current Points: 120
├─ Daily Streak: 30 days
├─ All-time High: 120
├─ Last Check-in: Today
└─ Rank: #3 in [Sport]

Points Breakdown:
├─ Initial: 10 (registration)
├─ Check-ins: +95 (from daily)
├─ Penalties: -5 (from 2-day gaps)
├─ Net: 100 points
└─ Recent: +1 today

STATUS: ✅ APPROVED (Points visible, streak shows engagement)
```

### **TOP 1-3 FEATURED DESIGN**

```
HOMEPAGE LAYOUT:

SECTION 1: FEATURED TOP 3
├─ Width: Full width
├─ Height: 300px each
├─ Layout: 3 cards side-by-side (desktop)
├─ Cards overlap slightly (depth effect)
│
├─ Card 1 (🥇 Gold):
│  ├─ Background: Light gold (#FFFACD)
│  ├─ Border: 2px gold (#FFD700)
│  ├─ Medal badge: Large (🥇)
│  ├─ Avatar: 120px
│  ├─ Name: 20px 600 weight
│  ├─ Points: 24px 600 weight
│  ├─ Badges: Show all
│  └─ [View Profile] button
│
├─ Card 2 (🥈 Silver):
│  ├─ Background: Light silver (#F0F0F0)
│  ├─ Border: 2px silver (#C0C0C0)
│  ├─ Medal badge: (🥈)
│  ├─ Avatar: 120px
│  ├─ Name: 20px 600 weight
│  ├─ Points: 24px 600 weight
│  └─ Similar to card 1
│
├─ Card 3 (🥉 Bronze):
│  ├─ Background: Light bronze (#FFE4B5)
│  ├─ Border: 2px bronze (#CD7F32)
│  ├─ Medal badge: (🥉)
│  ├─ Avatar: 120px
│  └─ Similar layout
│
└─ Mobile: Stack vertically (1 per row)

SECTION 2: REGULAR LISTINGS
├─ Below featured top 3
├─ Grid: 4 cards per row (desktop)
├─ Sorted: By points (after top 3)
├─ Normal size: (same design as before)
├─ Scrollable: Infinite scroll
└─ Filter: By type (Coach/Athlete)

DESIGN NOTES:
├─ Minimalist: No shadows, flat design
├─ Color: Gold/Silver/Bronze only (no gradients)
├─ Typography: Clear hierarchy
├─ Responsive: Works on all devices
└─ Fast: Images optimized, lazy load

STATUS: ✅ APPROVED (Featured top 3, flat design)
```

### **ADMIN VERIFICATION DASHBOARD**

```
/admin/verifications

LAYOUT:

Top section: Stats
├─ Total pending: 5
├─ Total approved: 245
├─ Total rejected: 12
├─ Avg review time: 2.3 hours

Main section: Table
├─ Columns:
│  ├─ Coach Name (sortable)
│  ├─ Email (sortable)
│  ├─ Cert Type (filter)
│  ├─ Upload Date (sortable)
│  ├─ Status (filter)
│  └─ Actions (view, approve, reject)
│
├─ Rows: 20 per page (with pagination)
├─ Filters: Status, Type, Date range
├─ Search: Coach name
└─ Sort: Default = newest first

Click row → Detail view:
├─ Left: Coach info
│  ├─ Name, email, phone
│  ├─ Registration date
│  ├─ Current status
│  └─ Appeal history (if exists)
│
├─ Middle: Images
│  ├─ Certificate image (zoom)
│  ├─ Selfie image (zoom)
│  └─ Gallery view (can zoom both)
│
├─ Right: Verification form
│  ├─ Certificate type: [dropdown]
│  ├─ Cert number: [text field]
│  ├─ Expiry date: [date field]
│  ├─ Admin notes: [textarea]
│  │
│  ├─ Status options:
│  │  ├─ [✅ Approve] (green button)
│  │  ├─ [❌ Reject] (red button)
│  │  │  └─ Reason: [dropdown]
│  │  │     ├─ Blurry image
│  │  │     ├─ Fake document
│  │  │     ├─ Expired cert
│  │  │     ├─ Invalid format
│  │  │     └─ Other
│  │  │
│  │  └─ [❓ Ask More Info] (yellow button)
│  │     └─ Message: [text field]
│  │
│  └─ [Message Coach] link (if need to communicate)

STATUS: ✅ APPROVED (Clean, functional dashboard)
```

### **PRODUCT MARKETPLACE DESIGN (FITNESS)**

```
/programs PAGE ENHANCEMENTS:

LAYOUT:

Left sidebar (filters):
├─ Creator type:
│  ├─ ☐ Coach programs
│  ├─ ☐ Athlete programs
│  └─ ☐ Both
├─ Program type:
│  ├─ ☐ Training
│  ├─ ☐ Video course
│  ├─ ☐ Meal plan
│  └─ ☐ Coaching
├─ Price range: [$0 - $999]
├─ Creator rating: [⭐⭐⭐+]
├─ Verified only: ☐
└─ Trending: ☐

Main area:

Search bar: [______________________] [Search]

Sort options:
├─ Most popular
├─ Newest
├─ Best rated
├─ Trending
├─ Price (low to high)
└─ Price (high to low)

Program cards (grid 3 per row):
┌────────────────────────────┐
│ [Cover image]              │
│                            │
│ Program title              │
│ Creator: Coach Name        │
│ ✅ Certified (if coach)    │
│ ⭐ Athlete Verified (if)   │
│                            │
│ ⭐⭐⭐⭐⭐ (4.8, 245 reviews)
│                            │
│ Duration: 8 weeks          │
│ Students: 1,234            │
│                            │
│ Price: $79 / $199          │
│ [View] [Subscribe]         │
└────────────────────────────┘

Creator info: [Avatar] [Name] [Stars]
Featured: Top creators get promoted
Verified: Show certification badge

STATUS: ✅ APPROVED (Fitness marketplace design)
```

---

## IX. DATABASE CHANGES NEEDED

### **NEW TABLES**

```sql
-- Verification
CREATE TABLE coach_verifications {
  id UUID PRIMARY KEY
  coach_id UUID REFERENCES coaches(id)
  certificate_image_url VARCHAR
  selfie_image_url VARCHAR
  certificate_type VARCHAR
  certificate_number VARCHAR
  issued_date DATE
  expiry_date DATE
  status VARCHAR (pending, approved, rejected)
  rejection_reason VARCHAR
  admin_notes TEXT
  admin_id UUID REFERENCES admins(id)
  verified_at TIMESTAMP
  created_at TIMESTAMP
  updated_at TIMESTAMP
}

CREATE TABLE athlete_achievements {
  id UUID PRIMARY KEY
  athlete_id UUID REFERENCES athletes(id)
  achievement_image_url VARCHAR
  title VARCHAR
  description TEXT
  sport VARCHAR
  achievement_date DATE
  medal_type VARCHAR (gold, silver, bronze, certificate, record)
  status VARCHAR (pending, approved, rejected)
  admin_id UUID REFERENCES admins(id)
  verified_at TIMESTAMP
  created_at TIMESTAMP
}

-- Points system
CREATE TABLE user_points {
  id UUID PRIMARY KEY
  user_id UUID REFERENCES users(id) UNIQUE
  current_points INT DEFAULT 10
  total_points INT DEFAULT 10
  daily_streak INT DEFAULT 0
  last_checkin_date DATE
  created_at TIMESTAMP
  updated_at TIMESTAMP
}

CREATE TABLE user_checkins {
  id UUID PRIMARY KEY
  user_id UUID REFERENCES users(id)
  checkin_date DATE
  points_earned INT DEFAULT 1
  created_at TIMESTAMP
  
  UNIQUE (user_id, checkin_date)
}

-- Badges
CREATE TABLE user_badges {
  id UUID PRIMARY KEY
  user_id UUID REFERENCES users(id)
  badge_type VARCHAR
  awarded_at TIMESTAMP
  awarded_by VARCHAR (system, admin)
  
  UNIQUE (user_id, badge_type)
}
```

---

## X. IMPLEMENTATION CHECKLIST

```
PHASE 1: CORE SYSTEMS (Week 1-2)
☐ Email verification (both users)
☐ Points system + daily check-in
☐ Badge system + display
☐ Admin verification dashboard
☐ Coach certification upload & admin verify
☐ Athlete achievement upload (optional)
☐ Database migrations
☐ API endpoints

PHASE 2: DISPLAY & RANKING (Week 3)
☐ Homepage sorting by points
☐ Top 1-3 featured cards
☐ Points display on profiles
☐ Badge display on profiles
☐ Points leaderboard page
☐ Messaging view access for admin

PHASE 3: POLISH (Week 4)
☐ Mobile responsiveness
☐ Performance optimization
☐ Admin dashboard polish
☐ User notifications
☐ Appeal handling
☐ Testing & QA

PHASE 4: PROGRAMS (Week 5+)
☐ Adjust /programs logic
☐ Allow athlete creators
☐ Update revenue split (95-5)
☐ Auto-publish moderation
☐ Creator badge display
└─ Note: Programs already exist, just adjust
```

---

## XI. KEY DECISIONS MADE

```
✅ Email-only verification (simplified)
✅ Daily check-in system (+1, -1 penalty)
✅ Points as rank system (not currency)
✅ Athlete CANNOT coach coaches (role clarity)
✅ Coach CANNOT buy coach programs (prevent competition)
✅ 95-5 revenue split (creators win)
✅ Admin can view flagged messages (moderation)
✅ Flat icon design (minimal)
✅ Featured top 3 on homepage
✅ No paid topup feature (merit-only)
✅ Programs at /programs (existing page, logic adjustment only)
✅ Athlete can create programs (same as coach)
✅ Auto-publish (no approval before posting)
```

---

## XII. SUCCESS METRICS

```
VERIFICATION:
├─ Email verification rate: > 95%
├─ Coach cert verification: 100%
├─ Time to verify: < 24 hours avg
└─ User trust score: +50% increase

POINTS SYSTEM:
├─ Daily check-in rate: > 60%
├─ Average points: 30-50 per user (after 1 month)
├─ Engagement: +40% vs no points
└─ Leaderboard views: 10K+ per month

BADGES:
├─ Coach cert badge recognition: > 80%
├─ User interest in verified coaches: +60%
├─ Verified coach conversion: +50%
└─ Badge collection drives engagement

PROGRAMS:
├─ Athlete creators: 20+ in first month
├─ Program revenue: $50K+ per month
├─ Athlete program sales: $10K+ per month
└─ Creator satisfaction: > 4.5/5

ADMIN:
├─ Admin dashboard usage: Daily
├─ Average review time: < 2 hours
├─ Verification accuracy: > 99%
└─ Appeal resolution: 100%
```

---

## XIII. TIMELINE

```
TOTAL DEVELOPMENT: 4 weeks

Week 1-2 (Core Systems):
├─ Verification (email, certs, badges)
├─ Points system
├─ Admin dashboard
└─ Estimated: 50-60 developer hours

Week 3 (Display):
├─ Homepage ranking
├─ Leaderboard
├─ Profile updates
└─ Estimated: 20-30 developer hours

Week 4 (Polish):
├─ QA & testing
├─ Mobile responsive
├─ Bug fixes
└─ Estimated: 20-30 developer hours

Week 5+ (Programs):
├─ Adjust existing logic
├─ Revenue split update
├─ Creator display
└─ Estimated: 10-15 developer hours

TOTAL: ~140-150 developer hours (about 4 weeks with 1 dev)
```

---

## XIV. FINAL APPROVAL

```
PRODUCT OWNER SIGN-OFF:
├─ Verification system: ✅ APPROVED
├─ Points system: ✅ APPROVED
├─ Badge system: ✅ APPROVED
├─ Permission matrix: ✅ APPROVED
├─ Admin God Mode: ✅ APPROVED
├─ Programs logic: ✅ APPROVED
├─ Revenue model: ✅ APPROVED
├─ Design specs: ✅ APPROVED
└─ Timeline: ✅ APPROVED

READY FOR IMPLEMENTATION: ✅ YES

Next step: Assign developers & start Week 1 tasks
```

---

**Status: FINAL APPROVED DESIGN - READY FOR CODING** ✅

**All questions answered, all decisions made, all logic clarified.**

**Ready to brief development team!** 🚀
