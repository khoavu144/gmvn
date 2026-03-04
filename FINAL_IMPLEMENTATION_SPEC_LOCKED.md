# ✅ FINAL IMPLEMENTATION SPECIFICATION - GYMER VIỆT

**Status:** APPROVED BY PRODUCT OWNER - READY FOR DEVELOPMENT
**Date:** Tháng 3, 2026
**Version:** FINAL v1.0
**All Decisions Locked In:** YES ✅

---

## I. ATHLETE ACHIEVEMENT VERIFICATION - FINAL SPEC

### **Decision: Proof URL NOT Required (But optional)**

```
IMPLEMENTATION:

CREATE TABLE athlete_achievements {
  id UUID PRIMARY KEY
  athlete_id UUID REFERENCES athletes(id)
  
  -- REQUIRED FIELDS:
  achievement_title VARCHAR(255) -- "National Boxing Championship 2024"
  competition_name VARCHAR(255) -- "Vietnam National Boxing Federation"
  organizing_body VARCHAR(255) -- "VBA" or similar
  achievement_level VARCHAR(50) -- "LOCAL" / "NATIONAL" / "INTERNATIONAL"
  achievement_date DATE -- When achieved
  certificate_image_url VARCHAR -- MUST be clear image
  medal_type VARCHAR(50) -- "GOLD" / "SILVER" / "BRONZE"
  
  -- OPTIONAL:
  proof_url VARCHAR(500) -- Link to official results (not required)
  additional_notes TEXT
  
  -- VERIFICATION:
  status VARCHAR(50) -- "PENDING" / "APPROVED" / "REJECTED"
  admin_id UUID REFERENCES admins(id)
  verification_notes TEXT
  verified_at TIMESTAMP
  
  -- AUDIT:
  created_at TIMESTAMP
  updated_at TIMESTAMP
}

ADMIN VERIFICATION LOGIC:

If proof_url provided:
├─ Try to verify against official results
├─ If found: Confidence = 95% → Auto-approve
├─ If not found: Ask for alternative proof
└─ Proof verified: Approve with high confidence

If NO proof_url:
├─ Manual review by admin
├─ Check: Image quality, organization legitimacy, date plausible
├─ If all good: Approve (but marked as "unverified proof")
├─ If questionable: Ask for more info or reject
└─ Admin judgment = final decision

BADGE PROGRESSION:

⭐ ATHLETE VERIFIED
├─ Awarded: When first achievement approved
├─ Display: Gold star icon
└─ Meaning: "Verified competition athlete"

🥇 NATIONAL ATHLETE
├─ Awarded: When achievement = NATIONAL level approved
├─ Display: Gold medal
└─ Meaning: "Competed at national level"

🌟 INTERNATIONAL COMPETITOR
├─ Awarded: When achievement = INTERNATIONAL level approved
├─ Display: Globe + star
└─ Meaning: "Competed internationally"

🏆 ELITE PERFORMER
├─ Awarded: When 3+ gold medals from APPROVED achievements
├─ Display: Trophy (premium)
└─ Meaning: "Exceptional athlete"

STATUS: ✅ APPROVED - NO PROOF URL REQUIRED
```

---

## II. POINTS SYSTEM - FINAL SPEC

### **Decision: 30-40-30 Weights (Activity-Reputation-Quality)**

```
COMPOSITE RANKING FORMULA:

CompositeScore = 
  (0.3 * ActivityScore) +
  (0.4 * ReputationScore) +
  (0.3 * QualityScore)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ACTIVITY SCORE (30% weight):

Initial: +10 points (all users on registration)

Daily Check-in:
├─ Each day login: +1 point
├─ Max: 1 per 24h (prevent spam)
└─ Unlimited accumulation

Penalty System:
├─ If no login for 2+ days: -1 point (deducted day after gap)
├─ If no login for 7 days: -3 points
├─ If no login for 30 days: streak reset to 0
└─ Can always come back (not banned)

Scoring Cap:
├─ Raw activity = days active (can go 0-unlimited)
├─ Normalized = min(100, days_active) / 100
├─ So: 100 days = 100 score, 365 days still = 100 score
└─ Prevents infinite growth, keeps fair

Formula: activity_normalized = min(100, days_active) / 100 * 100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. REPUTATION SCORE (40% weight - MOST IMPORTANT):

Certification Status (Coach only):
├─ Not certified: +0
├─ Certified + approved: +25
└─ Most important for coaches!

Average Rating (1-5 scale):
├─ Formula: (average_rating / 5) * 60
├─ 5.0 rating: 60 points
├─ 4.8 rating: 57.6 points
├─ 3.5 rating: 42 points
├─ 2.0 rating: 24 points
└─ Strong incentive for good service

Number of Reviews (confidence):
├─ Formula: min(50, num_reviews) / 50 * 15
├─ 50+ reviews: 15 points (proven quality)
├─ 10 reviews: 3 points
├─ 1 review: 0.3 points
└─ More reviews = more confidence

Total Reputation: 0-100
└─ Example: Certified (25) + 4.8 rating (57.6) + 50 reviews (15) = 97.6

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. QUALITY SCORE (30% weight):

Client Retention Rate:
├─ Formula: (retention_percentage) * 30
├─ 100% retention: 30 points
├─ 80% retention: 24 points
├─ 50% retention: 15 points
└─ Measures: Do clients stick around?

Program Completion Rate:
├─ Formula: (completion_percentage) * 20
├─ 100% completion: 20 points
├─ 50% completion: 10 points
└─ Measures: Do clients finish programs?

Athlete Achievements:
├─ Formula: min(10, num_achievements) / 10 * 20
├─ 10+ achievements: 20 points
├─ 5 achievements: 10 points
├─ 0 achievements: 0 points
└─ Measures: Do athletes win with this coach?

Badges Earned:
├─ Formula: num_badges * 10 (max 5 badges = 50)
├─ Each badge: +10 points
├─ Max: 50 points
└─ Measures: Verified, experienced, rated, etc

Total Quality: 0-100
└─ Example: Retention (25) + Completion (18) + Achievements (15) + Badges (40) = 98

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FINAL COMPOSITE CALCULATION:

Example Coach A (low activity, high quality):
├─ Activity: 50 points (logged in some, not every day)
├─ Reputation: 85 points (4.8 rating, certified, 20 reviews)
├─ Quality: 80 points (high retention, completions, athletes winning)
└─ Composite = (0.3 * 50) + (0.4 * 85) + (0.3 * 80)
   = 15 + 34 + 24 = 73 ✅ GOOD RANK

Example Coach B (high activity, low quality):
├─ Activity: 90 points (checks in every day)
├─ Reputation: 40 points (3.0 rating, not certified, 5 reviews)
├─ Quality: 30 points (low retention, low completion)
└─ Composite = (0.3 * 90) + (0.4 * 40) + (0.3 * 30)
   = 27 + 16 + 9 = 52 ❌ POOR RANK

BENEFIT:
└─ Quality coaches rank higher
   └─ Even with less activity
   └─ Prevents low-quality coaches from dominating
   └─ Creates incentive to improve service

STATUS: ✅ APPROVED - 30-40-30 WEIGHTS
```

### **Decision: Decay System IMPLEMENTED**

```
DECAY MECHANICS:

Purpose: Prevent points inflation, maintain fair competition

Activity Score Decay:
├─ If inactive 7 days: Lose current streak, -3 activity points
├─ If inactive 30 days: Streak reset to 0
├─ Monthly decay: 5% per month inactive
│  └─ After 6 months: 78% retained
│  └─ After 12 months: 61% retained
├─ Can always come back (not permanent)
└─ Fresh check-in removes penalty

Reputation & Quality:
├─ Reputation: 2% decay per month (rating doesn't disappear)
├─ Quality: 0% decay (past achievements matter)
└─ Reason: Build trust over time, not lost quickly

FORMULA:
└─ ActivityScore_after_decay = ActivityScore * (0.95 ^ months_inactive)

EFFECT:
├─ After 6 months inactive: 78% points
├─ After 12 months inactive: 61% points
├─ Creates continuous need to stay engaged
└─ New coaches can catch up if they perform well

EXAMPLE:
├─ Coach A: Had 200 points
│           Inactive 6 months
│           Now: 200 * 0.78 = 156 points
│           Can be caught by new coach with good quality
│
└─ Coach B: 50 points (new)
           High quality: Reputation 85 + Quality 80
           Can reach top 50 quickly with engagement

STATUS: ✅ APPROVED - DECAY IMPLEMENTED
```

### **Decision: Monthly Seasonal Leaderboard**

```
LEADERBOARD STRUCTURE:

1. MONTHLY LEADERBOARD (Active - Featured):
   ├─ Resets every month (1st of month)
   ├─ Top 10 featured on homepage
   ├─ Composite score recalculated each month
   ├─ Ranking: By composite score (30-40-30)
   ├─ Visibility: Huge (drives engagement)
   ├─ Rewards:
   │  ├─ 1st place: "Coach of the Month" badge + featured
   │  ├─ 2nd-3rd: Featured in search results
   │  └─ 4-10: Listed in leaderboard
   └─ Psychology: Fresh chance every month to win

2. ALL-TIME LEADERBOARD (Historical):
   ├─ Never resets
   ├─ Shows lifetime achievements
   ├─ "Hall of Fame" section
   ├─ Visible but not on homepage
   └─ Respect for veterans, but doesn't suppress new coaches

MECHANICS:

Each month (1st day):
├─ Activity scores reset to baseline (10)
├─ Reputation scores carry forward
├─ Quality scores carry forward
├─ Fresh race for activity begins
└─ Everyone competes based on current quality + new activity

EXAMPLE:

Month 1:
├─ Coach A: Activity 20, Reputation 85, Quality 80 = 77
├─ Coach B: Activity 15, Reputation 70, Quality 60 = 60
├─ Coach C: Activity 10, Reputation 90, Quality 85 = 78 ✅ WINNER
└─ Result: Coach C wins Month 1 (even though newer)

Month 2 (reset):
├─ Coach A: Activity 10, Reputation 85 (+1 from month), Quality 82 (+2) = 76.4
├─ Coach B: Activity 12, Reputation 71, Quality 62 = 62.8
├─ Coach C: Activity 5, Reputation 92, Quality 86 = 81.4 ✅ LEAD
├─ Coach D (new): Activity 8, Reputation 50, Quality 40 = 43.2
└─ Result: Coach C still leading, but Coach D can catch up

BENEFITS:
├─ New coaches see: "I can win this month"
├─ Prevents dead weight (old low-quality coaches staying top)
├─ Monthly winners get attention (viral potential)
├─ Drives monthly engagement spikes
└─ Fair competition: Quality matters most

DISPLAY:

Homepage:
├─ Section: "This Month's Top Coaches"
├─ Shows: Top 3 with medals (🥇🥈🥉)
├─ Size: Large featured cards
└─ CTA: "View full leaderboard"

Leaderboard Page:
├─ Tab 1: "This Month" (current)
├─ Tab 2: "All-Time" (historical)
├─ Sort: By composite (or custom filters)
├─ Filters: Sport, location, rating
└─ Export: Can share/screenshot

STATUS: ✅ APPROVED - MONTHLY RESET IMPLEMENTED
```

---

## III. BADGE SYSTEM - FINAL SPEC

### **Decision: Badge Multipliers STACK**

```
BADGE MULTIPLIER SYSTEM:

How it works:
├─ Each badge provides a ranking multiplier
├─ Multipliers STACK (multiply each other)
├─ Base composite score × all applicable multipliers
└─ Higher badges = significantly higher ranking

BADGE MULTIPLIERS:

For COACHES:

✅ Certification Verified: ×1.15 (15% boost)
├─ Requirement: Admin-verified certificate
├─ Why: Most important for coaches
├─ Impact: Huge (biggest single multiplier)
└─ Example: 60 score → 69

🏆 Highly Rated (4.8+): ×1.10 (10% boost)
├─ Requirement: Average rating ≥ 4.8
├─ Why: Good service = good coach
├─ Impact: Strong
└─ Example: 60 score → 66

👥 Experienced Coach (100+ clients): ×1.05 (5% boost)
├─ Requirement: 100+ lifetime students
├─ Why: Proven track record
├─ Impact: Modest
└─ Example: 60 score → 63

For ATHLETES:

⭐ Athlete Verified: ×1.10 (10% boost)
├─ Requirement: One achievement verified
├─ Why: Proven competition athlete
└─ Example: 60 score → 66

🥇 National Athlete: ×1.15 (15% boost)
├─ Requirement: National-level achievement
├─ Why: Higher competition level
└─ Example: 60 score → 69

🌟 International Competitor: ×1.20 (20% boost)
├─ Requirement: International achievement
├─ Why: Highest level
└─ Example: 60 score → 72

🏆 Elite Performer: ×1.30 (30% boost)
├─ Requirement: 3+ gold medals
├─ Why: Exceptional achievement
└─ Example: 60 score → 78

STACKING EXAMPLE:

Coach A (minimal):
├─ Base score: 60
├─ No multipliers: 60
└─ Rank: Middle tier

Coach B (certified + rated):
├─ Base score: 60
├─ Certified: 60 × 1.15 = 69
├─ Rated: 69 × 1.10 = 75.9
└─ Rank: Top tier

Athlete C (minimal):
├─ Base score: 60
├─ No multipliers: 60
└─ Rank: Middle

Athlete D (international + elite):
├─ Base score: 60
├─ International: 60 × 1.20 = 72
├─ Elite (3+ golds): 72 × 1.30 = 93.6
└─ Rank: Exceptional (93.6!)

STACKING RULES:

Multiplier order (doesn't matter, math is same):
├─ All apply simultaneously
├─ Can't get same badge twice
├─ Can earn more badges over time
└─ Score updates in real-time as badges earned

Maximum theoretical:
├─ Coach: 1.15 × 1.10 × 1.05 = 1.33× (33% boost)
├─ Athlete: 1.10 × 1.15 × 1.20 × 1.30 = 1.98× (98% boost!)
└─ Top athletes can have 2x the base score

INCENTIVE:

"Get certified" → +15%
"Get 4.8 rating" → +10%
"Get 100 clients" → +5%

Total: +30%+

Psychology:
└─ Coach sees: "I can rank 30% higher if I get cert + rated"
   └─ Clear path to top ranking
   └─ Motivates action

STATUS: ✅ APPROVED - MULTIPLIERS STACK
```

---

## IV. PERMISSIONS - FINAL SPEC

### **Decision: Athlete Can Coach Coaches (Skill-Based)**

```
NEW PERMISSION SYSTEM:

OLD (Role-based - REJECTED):
├─ Athlete role = cannot coach anyone
├─ Only Coach role = can teach
└─ Problem: Blocks elite athletes

NEW (Skill-based - APPROVED):
├─ Anyone can create coaching content
├─ But must prove expertise (verification)
├─ Verified → Can teach anyone (athlete, coach, regular)
└─ Unverified → Cannot teach

VERIFICATION FOR ATHLETE WANTING TO TEACH:

Option A (Preferred):
├─ Athlete has 3+ national achievement verified
├─ Automatically qualified to teach
├─ Can mark programs as "coaching content"
└─ Implicit: "I won, so I know the sport"

Option B:
├─ Get recommendation from certified coach
├─ Certified coach vouches: "This athlete can teach"
├─ Athlete gets "Verified Coach" badge
└─ Manual but social proof

Option C:
├─ Get own coaching certificate (NASM, ACE, etc)
├─ Same as regular coach
├─ Athlete role + Coach credential
└─ Formal proof of expertise

IMPLEMENTATION:

CREATE TABLE coach_qualifications {
  id UUID PRIMARY KEY
  athlete_id UUID REFERENCES athletes(id)
  qualification_type VARCHAR -- "elite_athlete", "certified_coach", "recommendation"
  qualification_level INT -- 1 (basic) to 3 (elite)
  verified_by ADMIN or SYSTEM
  can_coach_coaches BOOLEAN -- TRUE if qualified
  created_at TIMESTAMP
}

WHEN ATHLETE WANTS TO CREATE COACHING PROGRAM:
├─ System checks: Does athlete have coaching qualification?
├─ If YES (3+ national medals): Allow immediately
├─ If NO: Show options:
│  ├─ "Get coaching certificate"
│  ├─ "Request recommendation from coach"
│  └─ "Earn more achievements"
│
└─ Once qualified: Can create coaching content

ATHLETE CREATES PROGRAM:

Program options same as coach:
├─ Training programs ("How I train for nationals")
├─ Video courses ("Technique breakdowns")
├─ Nutrition guides ("What I eat before competition")
└─ Coaching packages ("I coach other athletes")

Label on program:
├─ Shows: "Program by Elite Athlete"
├─ Or: "Program by Certified Coach (Athlete Profile)"
└─ Trust signal: Athlete's achievements visible

CAN TEACH:
├─ Regular users: YES
├─ Other athletes: YES
├─ Coaches: YES ← NEW ALLOWED
└─ Reason: Knowledge sharing, skill-based

CANNOT DO:
├─ Cannot force coaching on unwilling users
├─ Cannot access users' data without consent
├─ Cannot claim to be certified if not
└─ Same rules as coaches

BENEFITS:
├─ Elite athletes can share knowledge
├─ Marketplace more diverse
├─ Network effects increase
├─ Coaches learn from athletes
└─ Platform = true knowledge exchange

RISK MITIGATION:
├─ Only verified athletes (3+ medals or cert)
├─ Not just anyone
├─ Admin can revoke if issues
├─ Same quality gates as coaches
└─ Trust maintained

STATUS: ✅ APPROVED - SKILL-BASED PERMISSIONS
```

### **Coach Can Buy Coach Programs (ALLOWED)**

```
REVERSAL: Previously "coach cannot buy coach programs"
NEW DECISION: Coaches CAN buy from other coaches

LOGIC:
├─ Learning = growth
├─ Coach buying course = stays on platform
├─ Cross-learning increases network effect
├─ No conflict (not competing for same students)
└─ More revenue = good for platform

RESTRICTION:
├─ Can BUY: Yes
├─ Can RE-SELL: NO (copyright infringement)
├─ Can COPY: NO (plagiarism)
├─ Can SHARE: NO (license violation)
└─ Enforcement: Contractual + IP law

USE CASES:
├─ Coach A (strength) buys nutrition course from Coach B
├─ Coach C buys marketing course from Coach D
├─ Coach E learns new methodology from Coach F
└─ All stay on platform, more engagement

STATUS: ✅ APPROVED - COACHES CAN BUY COACH PROGRAMS
```

---

## V. REVENUE MODEL - FINAL SPEC

### **Decision: 95-5 Launch, Scale to 90-10**

```
PHASE 1: LAUNCH (First 3 months)

Split: 95% creator, 5% platform
├─ Creator: $95 per $100 sale
├─ Platform: $5 per $100 sale
└─ After Stripe (2.9% + $0.30): Platform keeps ~$1.80

Goal: Incentivize creators to join, build catalog

Projected Year 1 Month 1-3:
├─ Revenue: $50K, $100K, $150K (growing)
├─ Platform keeps: $2.5K, $5K, $7.5K
├─ Burn rate: -$27.5K, -$25K, -$22.5K (acceptable for launch)
└─ Runway: Sufficient (assuming $150K-200K initial funding)

PHASE 2: SCALE (Month 4-6)

Tiered split:
├─ Tier 1 (< $1K/month sales): 95-5
├─ Tier 2 ($1K-5K/month): 90-10
├─ Tier 3 (> $5K/month): 85-15
└─ Staggered transition, not sudden

Goal: Balance creator incentive + platform sustainability

Projected Month 6:
├─ Revenue: $500K cumulative (growing to ~$200K/month)
├─ Platform keeps: $50K+ (10% average)
├─ Burn rate: Approaching break-even
└─ Runway: Can sustain ops

PHASE 3: MATURE (Month 7-12)

Additional revenue:
├─ Featured placement fee: $50-100/month
│  └─ "Featured this month" section
│
├─ Creator tools subscription: $9.99/month (optional)
│  ├─ Analytics dashboard
│  ├─ Email marketing to students
│  ├─ A/B testing tools
│  └─ Launch tracking
│
└─ Certification prep courses: 20% platform cut
   └─ GymEr helps coaches get certified

Projected Month 12:
├─ Program revenue: $1.5M cumulative
├─ Platform takes: 12-15% average
├─ Featured fees: $30K
├─ Tool subscriptions: $20K
├─ Cert courses: $10K
├─ Total: $220K+ revenue
├─ Monthly costs: $30K
└─ Profitable! 🎉

COMMUNICATION TO CREATORS:

Transparency:
├─ Day 1: "We start at 95-5 to help you succeed"
├─ Month 3: "Thank you for joining. Here's our roadmap"
├─ Month 4: Announce tiered transition
├─ Why: "Scale helps us grow marketplace for everyone"
└─ Grandfathered: Option to lock in 95-5 for 12 months

Fairness:
├─ Top creators (the ones making $5K+): Make more absolute
│  └─ $5K at 95-5 = $4,750
│  └─ $5K at 85-15 = $4,250
│  └─ Still $4.2K (acceptable, percentage matters less at scale)
│
└─ Early supporters: Get loyalty program
   ├─ "Early Creator" badge
   ├─ Featured section
   └─ Special promotion

DATABASE:

CREATE TABLE revenue_tiers {
  id UUID PRIMARY KEY
  creator_id UUID REFERENCES users(id)
  monthly_sales DECIMAL
  split_percentage INT (95 or 90 or 85)
  effective_from DATE
  created_at TIMESTAMP
}

CREATE TABLE financial_transactions {
  id UUID PRIMARY KEY
  program_id UUID
  buyer_id UUID
  creator_id UUID
  gross_amount DECIMAL
  platform_fee DECIMAL (split %)
  stripe_fee DECIMAL (2.9% + $0.30)
  creator_amount DECIMAL
  status VARCHAR (pending, completed, refunded)
  transaction_date TIMESTAMP
}

STATUS: ✅ APPROVED - 95-5 LAUNCH, SCALE TO 90-10+
```

---

## VI. ADMIN GOD MODE - FINAL SPEC

### **Decision: 2nd Approval Required (High-Risk Actions)**

```
ADMIN ACTIONS CATEGORIZED:

HIGH-RISK (require 2nd approval):
├─ Ban user (permanent)
├─ Approve coach certification
├─ Reject coach certification
├─ Adjust points > 50
├─ Approve athlete achievement (national+)
├─ Delete program
├─ Refund dispute decision
└─ Required: 2 different admins

MEDIUM-RISK (require audit log only):
├─ Approve athlete achievement (local)
├─ Adjust points < 50
├─ Temporary ban (1-30 days)
├─ Flag program
├─ Adjust revenue split
└─ Required: Logged, can be reviewed later

LOW-RISK (logged but not blocked):
├─ View flagged message
├─ Add admin note
├─ Create announcement
├─ Export reports
└─ Required: Audit log only

WORKFLOW FOR HIGH-RISK:

Admin A initiates:
├─ Fill form: Action type + reason + details
├─ Review: Preview changes
├─ Submit: "Request approval from Admin B"

Admin B reviews:
├─ See Admin A's request
├─ View all details
├─ Option A: [✅ Approve]
├─ Option B: [❌ Reject]
├─ Option C: [❓ Ask more info]
└─ Must leave comment

If approved:
├─ Action executes
├─ Both admins' IDs logged
├─ Timestamps recorded
├─ Immutable audit trail

If rejected:
├─ Action cancelled
├─ Admin A notified (reason)
├─ Can resubmit if issues fixed

IMMUTABLE AUDIT LOG:

CREATE TABLE admin_audit_log {
  id UUID PRIMARY KEY (immutable)
  admin_id UUID REFERENCES admins(id)
  approver_id UUID (who approved, if high-risk)
  action VARCHAR (ban_user, approve_cert, etc)
  action_category VARCHAR (high, medium, low)
  target_user_id UUID (affected user)
  target_resource_id UUID (program, achievement, etc)
  
  old_value TEXT (what was before)
  new_value TEXT (what became)
  
  ip_address INET (admin's IP)
  user_agent TEXT (browser info)
  
  timestamp TIMESTAMP (immutable - server time)
  reason TEXT (admin's explanation)
  result VARCHAR (approved, rejected, cancelled)
  
  CONSTRAINT immutable_log CHECK (timestamp IS NOT NULL)
  CONSTRAINT immutable_id CHECK (id IS NOT NULL)
}

RULES:
├─ Cannot delete rows (REVOKE DELETE privilege)
├─ Cannot update rows (REVOKE UPDATE privilege)
├─ Can only INSERT new rows
├─ Archive to immutable storage (S3) weekly
├─ Blockchain optional (for extra trust)

ADMIN DASHBOARD:

/admin/audit-log
├─ View all actions
├─ Filter: By admin, action type, date, user
├─ Search: By user ID or resource
├─ Export: Reports (CSV/PDF)
├─ Alert: Suspicious patterns
│  ├─ Same admin always approving their friend
│  ├─ Multiple high-risk actions same day
│  ├─ Late-night actions (unusual time)
│  └─ Admin flagged for review

/admin/pending-approvals
├─ Queue of waiting requests
├─ From least → most urgent
├─ Badge: "2 days pending" = urgent
└─ Can filter/search

INSIDER ABUSE PREVENTION:

Detection:
├─ Admin A approves all certs for Coach B
├─ System alerts: "Potential conflict"
├─ Super admin reviews
└─ If confirmed: Fire Admin A

Deterrent:
├─ Everything logged
├─ Queryable forever
├─ Can be subpoenaed
├─ Legal liability if caught
└─ Fear of getting caught = incentive

STATUS: ✅ APPROVED - 2ND APPROVAL REQUIRED FOR HIGH-RISK
```

---

## VII. AUTO-PUBLISH WITH QUALITY GATES - FINAL SPEC

### **Decision: AI Flags + Report Threshold**

```
AUTO-PUBLISH POLICY:

Default: Programs publish immediately
├─ No review queue (slow)
├─ No gatekeeper (scalable)
├─ Trust in community (flags catch bad ones)
└─ Speed > perfection

BUT WITH QUALITY GATES:

GATE 1: AI CONTENT FILTERING

Flags if program contains:
├─ Claims: "lose X kg in 1 week" → flag
├─ Claims: "cure disease" → flag
├─ Claims: "steroids recommended" → flag
├─ Nutrition: < 1200 cal/day → flag (dangerous)
├─ Nutrition: > 5000 cal/day → flag (excessive)
├─ Prohibited substances mentioned → flag
└─ Action: Flag for review, but publish (not block)

Implementation:
├─ Keyword list (regex patterns)
├─ NLP model (detects claims)
├─ Calorie calculator (parses nutrition)
└─ Pre-launch: Manual review of flagged content

GATE 2: REPORT THRESHOLD

User reports:
├─ Student can report: "Low quality", "Dangerous", "Fake transformation"
├─ Provide reason + evidence
└─ Admin reviews reports

If 3+ reports:
├─ Program auto-hidden (pending admin review)
├─ Not deleted (creator can appeal)
├─ Creator notified: "Program hidden due to reports"

If 5+ reports:
├─ Creator gets warning: "Multiple complaints"
├─ Program stays hidden
└─ Investigation triggered

GATE 3: REFUND TRACKING

Program quality = refund rate

If refund rate > 20%:
├─ Program flagged: "High refund rate"
├─ Manual review of content
├─ If bad: Deactivate
├─ Creator counseled: "Improve content"

If refund rate > 50%:
├─ Program auto-deactivated
├─ Creator suspended from creating
└─ Requires resubmission + review

If refund rate > 70%:
├─ Creator flagged as spam/fraud
├─ Account suspended
└─ May require removal

GATE 4: CREATOR VERIFICATION

New creator restrictions:
├─ First program: AI review only (not human)
├─ Reviews: Monitor closely
├─ If bad reviews: Flag second program
└─ After 5 successful programs: Trust increased

Bad creators:
├─ Track pattern of refunds/complaints
├─ 2+ bad programs: Manual review required
├─ 3+ bad programs: Account suspended
└─ Appeals possible (can improve)

APPEAL PROCESS:

Creator disputes:
├─ "My program is good, unfair flagging"
├─ Submit appeal: Provide evidence
├─ Admin review: Check content manually
├─ If unfair: Unblock + apologize
├─ If fair: Deny + explain needed improvements

Time limit:
├─ Appeal within 7 days
├─ After 7 days: Program deleted
└─ Can resubmit improved version

QUALITY GATE DASHBOARD:

/admin/quality-control
├─ Pending reviews (AI flagged)
├─ Recent reports (3+ complaints)
├─ High refund rate programs
├─ Suspicious creators
├─ Appeals queue
└─ One-click actions: Approve, Reject, Request changes

WORKFLOW:

Creator uploads program
  ↓
AI filters for banned content
  ├─ If no flags: Auto-publish ✅
  └─ If flagged: Publish but marked "Under review"
  ↓
Program live (users can buy)
  ↓
Users buy / report issues
  ├─ If 3+ reports: Auto-hide
  ├─ If 20%+ refunds: Flag
  └─ If content bad: Deactivate
  ↓
Admin reviews if flagged
  ├─ Approve: Remove flag
  ├─ Reject: Delete (creator can appeal)
  └─ Request changes: Give deadline to fix
  ↓
Creator can appeal
  ├─ Provide evidence it's good
  ├─ Admin re-reviews
  └─ Final decision

BENEFITS:
├─ Fast (no queue, auto-publish)
├─ Safe (community flags bad ones)
├─ Fair (appeals possible)
├─ Scalable (AI handles volume)
└─ Creator-friendly (chance to improve)

STATUS: ✅ APPROVED - AI FLAGS + REPORT THRESHOLD
```

---

## VIII. DATABASE SCHEMA - FINAL ADDITIONS

```sql
-- New tables for enhanced system

CREATE TABLE athlete_achievements {
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id),
  achievement_title VARCHAR(255),
  competition_name VARCHAR(255),
  organizing_body VARCHAR(255),
  achievement_level VARCHAR(50), -- LOCAL/NATIONAL/INTERNATIONAL
  achievement_date DATE,
  certificate_image_url VARCHAR,
  medal_type VARCHAR(50), -- GOLD/SILVER/BRONZE
  proof_url VARCHAR(500), -- Optional
  status VARCHAR(50), -- PENDING/APPROVED/REJECTED
  admin_id UUID REFERENCES admins(id),
  verification_notes TEXT,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_athlete_id, INDEX idx_status
};

CREATE TABLE user_points_history {
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  points_change INT,
  reason VARCHAR(50), -- daily_checkin, penalty, decay, award
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id, INDEX idx_timestamp
};

CREATE TABLE ranking_cache {
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  rank INT,
  composite_score DECIMAL(10, 2),
  activity_score DECIMAL(10, 2),
  reputation_score DECIMAL(10, 2),
  quality_score DECIMAL(10, 2),
  multiplier DECIMAL(3, 2), -- From badges
  final_score DECIMAL(10, 2),
  season VARCHAR(50), -- current month
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id, INDEX idx_season, INDEX idx_final_score
};

CREATE TABLE program_reports {
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES products(id),
  reporter_id UUID NOT NULL REFERENCES users(id),
  reason VARCHAR(50), -- low_quality, dangerous, fake, spam
  description TEXT,
  status VARCHAR(50), -- open, investigating, resolved
  resolution TEXT,
  report_count INT DEFAULT 1,
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_program_id, INDEX idx_status
};

CREATE TABLE financial_transactions {
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES products(id),
  creator_id UUID NOT NULL REFERENCES users(id),
  buyer_id UUID NOT NULL REFERENCES users(id),
  gross_amount DECIMAL(10, 2),
  split_percentage INT, -- 95, 90, 85
  platform_fee DECIMAL(10, 2),
  stripe_fee DECIMAL(10, 2),
  creator_amount DECIMAL(10, 2),
  status VARCHAR(50), -- pending, completed, refunded
  refund_reason VARCHAR,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_creator_id, idx_buyer_id
};

CREATE TABLE admin_audit_log {
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admins(id),
  approver_id UUID REFERENCES admins(id), -- High-risk only
  action VARCHAR(50),
  action_category VARCHAR(20), -- high, medium, low
  target_user_id UUID REFERENCES users(id),
  target_resource_id UUID,
  old_value TEXT,
  new_value TEXT,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason TEXT,
  result VARCHAR(50), -- approved, rejected, executed
  INDEX idx_admin_id, idx_timestamp, idx_target_user_id
};

CREATE TABLE revenue_tiers {
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  monthly_sales_threshold DECIMAL(10, 2),
  split_percentage INT, -- 95, 90, 85
  effective_from DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_creator_id
};
```

---

## IX. IMPLEMENTATION TIMELINE - FINAL

```
PHASE 1: CORE (Week 1-2)
├─ Composite ranking system (30-40-30)
├─ Decay system (5% monthly)
├─ Badge multipliers (stack)
├─ Admin 2nd approval (high-risk)
├─ Database schema updates
└─ CRITICAL: Must complete before launch

PHASE 2: FEATURES (Week 3)
├─ Athlete achievement verification (metadata + tiers)
├─ Seasonal leaderboard (monthly reset)
├─ AI quality gates + refund tracking
├─ Skill-based coach permissions
├─ Coach-to-coach program marketplace
└─ IMPORTANT: Complete within 2 weeks of launch

PHASE 3: OPTIMIZATION (Week 4)
├─ Ranking cache + cron job (50x faster)
├─ Redis layer for leaderboard
├─ Admin audit dashboard
├─ Creator appeal workflow
├─ Financial transaction tracking
└─ NICE-TO-HAVE: Can be added gradually

TOTAL: 4 weeks development
STATUS: ✅ LOCKED & READY FOR CODING
```

---

## X. FINAL APPROVAL CHECKLIST

```
ALL DECISIONS LOCKED:

VERIFICATION:
☑️ Athlete proof URL: NOT REQUIRED (but optional)

POINTS:
☑️ Weights: 30-40-30 (activity-reputation-quality)
☑️ Decay: YES (5% monthly)
☑️ Seasonal: YES (monthly reset)

BADGES:
☑️ Multipliers: STACK (compound together)

PERMISSIONS:
☑️ Athlete coaching: SKILL-BASED YES
☑️ Coach buying coach: ALLOWED YES

REVENUE:
☑️ Model: 95-5 LAUNCH, scale to 90-10+

ADMIN:
☑️ 2nd approval: YES (high-risk actions)

QUALITY:
☑️ Auto-publish: AI FLAGS + REPORTS

DATABASE:
☑️ Schema: 8 new tables added
☑️ Optimization: Cache + cron job

TIMELINE:
☑️ Phase 1 (critical): Week 1-2
☑️ Phase 2 (important): Week 3
☑️ Phase 3 (optimization): Week 4

═══════════════════════════════════════════════════════

STATUS: ✅ ALL APPROVED - READY FOR DEVELOPMENT

═══════════════════════════════════════════════════════
```

---

## XI. SUMMARY FOR DEVELOPMENT TEAM

```
🎯 GYMER VIỆT - FINAL APPROVED SPECIFICATION

Priority 1 (Week 1-2 - CRITICAL):
✅ Composite ranking (30-40-30 formula)
✅ Decay system (prevent inflation)
✅ Badge multipliers (stack effect)
✅ Admin 2nd approval (security)

Priority 2 (Week 3 - IMPORTANT):
✅ Athlete achievement standards (metadata + tiers)
✅ Seasonal leaderboard (monthly reset)
✅ Quality gates (AI + reports)
✅ Skill-based permissions (athlete coaches)

Priority 3 (Week 4 - OPTIMIZATION):
✅ Ranking cache (50x faster)
✅ Audit dashboard
✅ Financial tracking

Revenue: 95-5 launch, scale to 90-10+
Timeline: 4 weeks = November launch ready
Database: 8 new tables + indexes
API: 20+ endpoints updated

🚀 READY TO CODE - NO MORE CHANGES
```

---

**PRODUCT OWNER FINAL APPROVAL:**

```
Date Approved: Tháng 3, 2026
All decisions locked: ✅ YES
Ready for development: ✅ YES
Final version: ✅ FINAL v1.0

Signed: Product Owner (You)
Status: IMPLEMENTATION READY
```

**This is the FINAL SPEC. No more changes. Development can start immediately.** ✅
