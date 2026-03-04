# 🎯 TRAINER PROFILE SYSTEM - COMPLETE DESIGN

## OVERVIEW

Trainer profile không chỉ là thông tin, nó là **LANDING PAGE ĐẦY ĐỦ**:
- Trang CV chuyên biệt cho fitness
- Chia sẻ trên mạng xã hội (Facebook, Instagram)
- Download PDF đầy đủ (CV + portfolio)
- Responsive design (Mobile-first)
- Analytics (xem ai truy cập, engagement)

---

## 1. TRAINER PROFILE STRUCTURE (Database Schema)

### Main Tables

```sql
-- Trainer Profile (cơ bản)
CREATE TABLE trainer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES trainers(id) UNIQUE,
    
    -- HEADER/COVER
    cover_image_url VARCHAR(500),
    headline TEXT, -- "Strength Coach | 10+ Years Experience"
    bio_short VARCHAR(500), -- Tóm tắt 1-2 dòng
    bio_long TEXT, -- Chi tiết dài (MD support)
    
    -- SOCIAL LINKS
    social_links JSONB, -- {facebook, instagram, youtube, tiktok, twitter, website}
    
    -- CONTACT
    phone VARCHAR(20),
    email VARCHAR(255),
    location VARCHAR(255),
    timezone VARCHAR(50),
    language JSONB, -- ['Vietnamese', 'English', 'Chinese']
    
    -- PROFESSIONAL INFO
    years_experience INT,
    clients_trained INT,
    success_stories INT,
    transformation_photos INT,
    
    -- SPECIALTIES (expanded)
    specialties JSONB, -- Array of detailed specialties
    
    -- CERTIFICATIONS & CREDENTIALS
    certifications JSONB, -- Array with name, issuer, year, url, image
    awards JSONB, -- Giải thưởng
    media_features JSONB, -- Xuất hiện trên media
    
    -- PRICING
    base_price_monthly DECIMAL(10,2),
    base_price_one_time DECIMAL(10,2),
    pricing_details TEXT, -- Mô tả gói
    
    -- ADDITIONAL SETTINGS
    is_accepting_clients BOOLEAN DEFAULT true,
    availability_calendar JSONB,
    
    -- DESIGN/CUSTOMIZATION
    theme_color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color
    accent_color VARCHAR(7) DEFAULT '#10B981',
    custom_css TEXT, -- Limited custom CSS
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_trainer_id,
    INDEX idx_created_at
);

-- SECTIONS (Custom blocks trainers can add)
CREATE TABLE profile_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES trainer_profiles(id),
    
    section_type VARCHAR(50), -- 'about', 'experience', 'testimonials', 'gallery', 'services', 'blog', 'faq'
    section_title VARCHAR(255),
    section_content TEXT, -- JSON or markdown
    section_order INT,
    is_visible BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_profile_id,
    INDEX idx_section_order
);

-- EXPERIENCE DETAILS (Chi tiết kinh nghiệm)
CREATE TABLE trainer_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES trainers(id),
    
    job_title VARCHAR(255),
    organization VARCHAR(255),
    location VARCHAR(255),
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN,
    description TEXT,
    achievements JSONB, -- Array of achievements
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_trainer_id,
    INDEX idx_start_date
);

-- SPECIALTIES DETAILED (Chi tiết từng specialty)
CREATE TABLE trainer_specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES trainers(id),
    
    specialty_name VARCHAR(255), -- "Strength Training", "Weight Loss", etc
    specialty_icon VARCHAR(255), -- Icon identifier
    description TEXT,
    years_in_specialty INT,
    client_success_rate DECIMAL(3,2), -- 0.95 = 95%
    clients_in_this_specialty INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_trainer_id
);

-- TESTIMONIALS/REVIEWS (Từ clients)
CREATE TABLE trainer_testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES trainers(id),
    review_id UUID NOT NULL REFERENCES reviews(id),
    
    client_name VARCHAR(255),
    client_avatar_url VARCHAR(500),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    result_achieved TEXT, -- "Lost 20kg in 3 months"
    result_image_url VARCHAR(500), -- Before/after or transformation
    transformation_timeline VARCHAR(100), -- "3 months", "6 months"
    is_featured BOOLEAN DEFAULT false, -- Pinned testimonial
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_trainer_id,
    INDEX idx_is_featured
);

-- GALLERY/PORTFOLIO (Hình ảnh transformation)
CREATE TABLE trainer_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES trainers(id),
    
    image_url VARCHAR(500),
    image_title VARCHAR(255),
    image_description TEXT,
    client_name VARCHAR(255), -- "John Doe" or "Anonymous"
    before_after BOOLEAN, -- true if before/after composite
    transformation_timeline VARCHAR(100),
    category VARCHAR(50), -- 'transformation', 'training', 'event', 'facility'
    order_number INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_trainer_id,
    INDEX idx_category
);

-- FAQ SECTION
CREATE TABLE trainer_faq (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES trainers(id),
    
    question VARCHAR(500),
    answer TEXT,
    category VARCHAR(100), -- 'pricing', 'training', 'nutrition', 'general'
    order_number INT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_trainer_id
);

-- SOCIAL PROOF/MEDIA MENTIONS
CREATE TABLE trainer_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES trainers(id),
    
    media_title VARCHAR(255),
    media_source VARCHAR(255), -- "VTV News", "Báo 24h", etc
    media_url VARCHAR(500),
    media_image VARCHAR(500),
    publication_date DATE,
    description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_trainer_id,
    INDEX idx_publication_date
);

-- PROFILE CUSTOMIZATION SETTINGS
CREATE TABLE profile_customization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES trainers(id) UNIQUE,
    
    -- Layout
    layout_style VARCHAR(50) DEFAULT 'modern', -- 'modern', 'classic', 'minimal', 'creative'
    
    -- Sections to display
    show_about BOOLEAN DEFAULT true,
    show_experience BOOLEAN DEFAULT true,
    show_specialties BOOLEAN DEFAULT true,
    show_certifications BOOLEAN DEFAULT true,
    show_testimonials BOOLEAN DEFAULT true,
    show_gallery BOOLEAN DEFAULT true,
    show_programs BOOLEAN DEFAULT true,
    show_pricing BOOLEAN DEFAULT true,
    show_faq BOOLEAN DEFAULT true,
    show_blog BOOLEAN DEFAULT false,
    
    -- CTA Button
    cta_button_text VARCHAR(100) DEFAULT 'Subscribe Now',
    cta_button_action VARCHAR(50), -- 'subscribe', 'contact', 'book_consultation'
    
    -- Analytics
    is_public BOOLEAN DEFAULT true,
    track_views BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PROFILE VIEW ANALYTICS
CREATE TABLE profile_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES trainers(id),
    user_id UUID, -- NULL if anonymous
    
    view_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_duration_seconds INT,
    referrer VARCHAR(500), -- Where did they come from
    device_type VARCHAR(50), -- 'mobile', 'tablet', 'desktop'
    country VARCHAR(100),
    
    INDEX idx_trainer_id,
    INDEX idx_view_timestamp
);

-- PROFILE URL SLUG (SEO friendly)
CREATE TABLE profile_slugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES trainers(id) UNIQUE,
    
    slug VARCHAR(255) UNIQUE NOT NULL, -- 'john-strength-coach', 'jane-yoga-master'
    custom_domain VARCHAR(255), -- For premium: 'coach.johndoe.com'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_slug,
    INDEX idx_trainer_id
);
```

---

## 2. TRAINER PROFILE UI DESIGN (Landing Page)

### Profile Layout (Figma wireframe)

```
╔════════════════════════════════════════════════════════════╗
│                    PROFILE HEADER                           │
├────────────────────────────────────────────────────────────┤
│  [COVER IMAGE - Full width, 400px height]                  │
│                                                             │
│  [SHARE] [DOWNLOAD PDF] [EDIT] [MENU]                      │
└────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════╗
│                    TRAINER INFO CARD                        │
├─────────────────────────┬──────────────────────────────────┤
│  [AVATAR]               │  John Smith                      │
│  (200x200)              │  🏆 NASM Certified Trainer       │
│                         │  💪 Strength & Conditioning     │
│                         │  📍 Ho Chi Minh City            │
│                         │                                  │
│                         │  ⭐ 4.9 (45 reviews)            │
│                         │  👥 120+ Clients Trained       │
│                         │  📈 95% Success Rate           │
│                         │                                  │
│                         │  [SUBSCRIBE]  [CONTACT]        │
│                         │  [FOLLOW] [SHARE]              │
├─────────────────────────┴──────────────────────────────────┤
│  QUICK STATS                                               │
│  ├─ 10+ Years Experience  │ 50+ Transformations          │
│  ├─ 500+ Success Stories  │ $50K+ Combined Loss          │
│  └─ Available for 1-on-1  │ Accepting 5 new clients      │
└────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════╗
│  ABOUT ME                                                   │
├────────────────────────────────────────────────────────────┤
│  "I'm a certified strength coach with 10+ years of         │
│  experience helping clients achieve their fitness goals.   │
│  My approach combines personalized training with           │
│  nutrition guidance to ensure sustainable results.         │
│                                                             │
│  I specialize in strength training, weight loss, and       │
│  body transformation. All my programs are backed by        │
│  science and proven with real client results."            │
└────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════╗
│  SPECIALTIES                                                │
├────────────────────────────────────────────────────────────┤
│  [STRENGTH TRAINING]      [WEIGHT LOSS]                   │
│  10 years | 85 clients    | 5 years | 120 clients        │
│  92% Success Rate         | 95% Success Rate             │
│                                                             │
│  [BODYBUILDING]           [FUNCTIONAL TRAINING]           │
│  8 years | 45 clients     | 6 years | 65 clients        │
│  88% Success Rate         | 90% Success Rate             │
└────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════╗
│  CERTIFICATIONS & CREDENTIALS                              │
├────────────────────────────────────────────────────────────┤
│  🏅 NASM Personal Trainer          ✓ Verified (2015)      │
│  🏅 ACE Health Coach               ✓ Verified (2018)      │
│  🏅 ISSA Strength Coach            ✓ Verified (2020)      │
│  🏅 Precision Nutrition Level 1    ✓ Verified (2019)      │
│                                                             │
│  🥇 "Best Trainer 2023" - FitnessPro Magazine            │
│  🥇 "Top 10 Coaches Vietnam" - Fit Awards 2022           │
└────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════╗
│  EXPERIENCE                                                 │
├────────────────────────────────────────────────────────────┤
│  💼 Head Coach at FitLife Gym (2018 - Present)            │
│     • Managed 15-person training team                      │
│     • Trained 200+ clients successfully                    │
│     • Developed custom programs for athletes               │
│                                                             │
│  💼 Senior Trainer at PowerFit (2015 - 2018)              │
│     • Personal training for elite clients                  │
│     • Nutrition coaching                                   │
│     • Corporate wellness programs                          │
│                                                             │
│  💼 Junior Trainer at First Fitness (2013 - 2015)         │
│     • Group classes and personal training                  │
│     • Client onboarding and assessments                    │
└────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════╗
│  TRANSFORMATIONS & PORTFOLIO                               │
├────────────────────────────────────────────────────────────┤
│  [BEFORE/AFTER IMAGE 1] [BEFORE/AFTER IMAGE 2]           │
│  "Lost 25kg in 4 months"              "Gained 8kg muscle" │
│  John Doe | 4 months                  Jane Smith | 5 mo   │
│                                                             │
│  [BEFORE/AFTER IMAGE 3] [BEFORE/AFTER IMAGE 4]           │
│  "Complete transformation"            "Strength focused"  │
│  Mike Johnson | 6 months              Sarah Lee | 3 mo    │
│                                                             │
│  [See all 50+ transformations]                            │
└────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════╗
│  TESTIMONIALS                                               │
├────────────────────────────────────────────────────────────┤
│  ⭐⭐⭐⭐⭐                                                    │
│  "John completely transformed my body in 3 months! He's    │
│  patient, knowledgeable, and always motivates me to push   │
│  harder. Highly recommend!"                               │
│  - Sarah Johnson                                           │
│  Lost 20kg | 3 months                                      │
│                                                             │
│  ⭐⭐⭐⭐⭐                                                    │
│  "Best investment for my health. John's personalized       │
│  approach and attention to detail set him apart."         │
│  - Michael Chen                                            │
│  Gained muscle & definition | 4 months                     │
└────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════╗
│  MY PROGRAMS                                                │
├────────────────────────────────────────────────────────────┤
│  [STRENGTH PROGRAM]         [WEIGHT LOSS PROGRAM]         │
│  12 weeks | $199/month      8 weeks | $99/month          │
│  ⭐ 98 clients | 94% success | ⭐ 156 clients | 96% success│
│                                                             │
│  [MUSCLE BUILDING]          [FUNCTIONAL FITNESS]          │
│  16 weeks | $299/month      10 weeks | $149/month        │
│  ⭐ 45 clients | 92% success | ⭐ 78 clients | 91% success│
└────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════╗
│  PRICING                                                    │
├────────────────────────────────────────────────────────────┤
│  [1-on-1 Coaching] $79/month                              │
│  ├─ Custom workout plan                                    │
│  ├─ Weekly progress check-ins                              │
│  └─ Nutrition guidance                                     │
│                                                             │
│  [12-Week Program] $297                                    │
│  ├─ Complete 12-week program                               │
│  ├─ Video form guides                                      │
│  └─ 2 video call consultations                             │
│                                                             │
│  [VIP Package] $499/month                                  │
│  ├─ Everything in 1-on-1                                   │
│  ├─ 4 video calls per month                                │
│  ├─ Priority messaging                                     │
│  └─ Meal plan + grocery list                               │
└────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════╗
│  FAQ                                                        │
├────────────────────────────────────────────────────────────┤
│  Q: How long until I see results?                         │
│  A: Most clients see visible changes within 2-3 weeks,     │
│     with significant results in 8-12 weeks...             │
│                                                             │
│  Q: Do I need gym equipment?                              │
│  A: No, I offer programs for home, gym, or outdoor...     │
│                                                             │
│  Q: Can you help with nutrition?                          │
│  A: Yes, nutrition is integral to my programs...          │
└────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════╗
│  CONTACT & SOCIAL                                           │
├────────────────────────────────────────────────────────────┤
│  📧 john@fitlife.com                                       │
│  📱 +84 903 123 456                                        │
│  📍 Ho Chi Minh City, Vietnam                              │
│  🕐 UTC+7                                                  │
│                                                             │
│  [FACEBOOK] [INSTAGRAM] [YOUTUBE] [TIKTOK] [WEBSITE]     │
└────────────────────────────────────────────────────────────┘
```

---

## 3. CUSTOM FIELDS CONFIGURATION (Admin Panel)

### Profile Field Management (God Mode)

```typescript
// Field definitions - Admin can customize
const TRAINER_PROFILE_FIELDS = {
  // BASIC SECTION
  basic: {
    headline: {
      type: 'text',
      label: 'Professional Headline',
      placeholder: 'e.g., "Strength Coach | 10+ Years"',
      maxLength: 200,
      required: true,
      visible: true,
      order: 1,
    },
    bio_short: {
      type: 'textarea',
      label: 'Short Bio',
      placeholder: '1-2 sentence summary',
      maxLength: 500,
      rows: 3,
      required: true,
      visible: true,
      order: 2,
    },
    bio_long: {
      type: 'rich_editor',
      label: 'Detailed Bio',
      placeholder: 'Full story about you...',
      supports_markdown: true,
      supports_embed: true,
      required: false,
      visible: true,
      order: 3,
    },
  },

  // STATS SECTION
  stats: {
    years_experience: {
      type: 'number',
      label: 'Years of Experience',
      min: 0,
      max: 50,
      required: true,
      visible: true,
      order: 1,
    },
    clients_trained: {
      type: 'number',
      label: 'Clients Trained',
      min: 0,
      required: false,
      visible: true,
      order: 2,
    },
    success_stories: {
      type: 'number',
      label: 'Success Stories',
      min: 0,
      required: false,
      visible: true,
      order: 3,
    },
    success_rate: {
      type: 'percentage',
      label: 'Client Success Rate',
      min: 0,
      max: 100,
      required: false,
      visible: true,
      order: 4,
    },
  },

  // SPECIALTIES
  specialties: {
    type: 'multi_select',
    label: 'Specialties',
    options: [
      'Strength Training',
      'Bodybuilding',
      'Weight Loss',
      'Muscle Gain',
      'Functional Fitness',
      'HIIT Training',
      'Yoga',
      'Pilates',
      'CrossFit',
      'Sports Training',
      'Rehabilitation',
      'Nutrition Coaching',
      'Online Coaching',
      'Group Classes',
      'Corporate Wellness',
    ],
    allow_custom: true, // Trainers can add custom specialties
    max_items: 10,
    required: true,
    visible: true,
  },

  // EXPERIENCE
  experience: {
    type: 'repeating_group',
    label: 'Work Experience',
    fields: {
      job_title: { type: 'text', required: true },
      organization: { type: 'text', required: true },
      start_date: { type: 'date', required: true },
      end_date: { type: 'date', required: false },
      is_current: { type: 'checkbox' },
      description: { type: 'textarea', maxLength: 500 },
      achievements: { type: 'textarea', placeholder: 'Key achievements...' },
    },
    allow_multiple: true,
    visible: true,
    order: 5,
  },

  // CERTIFICATIONS
  certifications: {
    type: 'repeating_group',
    label: 'Certifications & Credentials',
    fields: {
      cert_name: {
        type: 'text',
        label: 'Certification Name',
        required: true,
      },
      issuer: {
        type: 'select',
        label: 'Issuing Organization',
        options: ['NASM', 'ACE', 'ISSA', 'IFBB', 'Custom...'],
        allow_custom: true,
        required: true,
      },
      issue_date: {
        type: 'date',
        label: 'Issue Date',
        required: true,
      },
      expiry_date: {
        type: 'date',
        label: 'Expiry Date (if applicable)',
        required: false,
      },
      credential_url: {
        type: 'url',
        label: 'Credential URL',
        required: false,
      },
      credential_image: {
        type: 'image_upload',
        label: 'Certificate Image',
        max_size: '5MB',
        required: false,
      },
    },
    allow_multiple: true,
    visible: true,
    order: 6,
  },

  // AWARDS
  awards: {
    type: 'repeating_group',
    label: 'Awards & Recognition',
    fields: {
      award_name: { type: 'text', required: true },
      awarding_organization: { type: 'text', required: true },
      award_date: { type: 'date', required: true },
      award_image: { type: 'image_upload' },
      award_description: { type: 'textarea' },
    },
    allow_multiple: true,
    visible: true,
    order: 7,
  },

  // MEDIA MENTIONS
  media_features: {
    type: 'repeating_group',
    label: 'Media Features & Press',
    fields: {
      media_title: { type: 'text', required: true },
      media_source: { type: 'text', required: true }, // "VTV", "Báo 24h", etc
      publication_date: { type: 'date', required: true },
      media_url: { type: 'url', required: false },
      media_image: { type: 'image_upload' },
    },
    allow_multiple: true,
    visible: true,
    order: 8,
  },

  // CONTACT INFO
  contact: {
    email: { type: 'email', required: false, visible: true },
    phone: { type: 'phone', required: false, visible: true },
    location: { type: 'text', required: false, visible: true },
    timezone: { type: 'select', options: ['UTC-8', 'UTC+0', 'UTC+7', ...], visible: true },
  },

  // SOCIAL LINKS
  social_links: {
    type: 'group',
    label: 'Social Media & Web',
    fields: {
      facebook: { type: 'url', placeholder: 'https://facebook.com/...' },
      instagram: { type: 'url', placeholder: 'https://instagram.com/...' },
      youtube: { type: 'url', placeholder: 'https://youtube.com/...' },
      tiktok: { type: 'url', placeholder: 'https://tiktok.com/...' },
      twitter: { type: 'url', placeholder: 'https://twitter.com/...' },
      website: { type: 'url', placeholder: 'https://...' },
      linkedin: { type: 'url', placeholder: 'https://linkedin.com/...' },
    },
    visible: true,
  },

  // GALLERY/PORTFOLIO
  gallery: {
    type: 'file_upload_group',
    label: 'Transformation Gallery',
    allows: ['before_after', 'training_photo', 'event_photo'],
    max_files: 50,
    visible: true,
  },

  // CUSTOM SECTIONS
  custom_sections: {
    type: 'repeating_group',
    label: 'Custom Sections',
    fields: {
      section_title: { type: 'text', required: true },
      section_type: {
        type: 'select',
        options: ['about', 'services', 'methodology', 'testimonials', 'faq', 'blog'],
      },
      section_content: { type: 'rich_editor' },
      display_order: { type: 'number' },
      is_visible: { type: 'checkbox', default: true },
    },
    allow_multiple: true,
    visible: true,
  },
};
```

---

## 4. ADMIN PANEL (God Mode) - Field Management

### Admin Interface for Field Control

```typescript
// AdminPanel for managing trainer profile fields

interface AdminFieldControl {
  // Global settings
  global_settings: {
    // Which sections to show/hide globally
    mandatory_sections: string[], // Cannot be disabled
    optional_sections: string[], // Can be disabled per trainer
    default_theme: string, // 'modern', 'classic', 'minimal', 'creative'
    default_colors: {
      primary: string,
      accent: string,
    },
  },

  // Per-field controls
  field_management: {
    [fieldName: string]: {
      // Visibility
      is_active: boolean, // Admin can disable a field entirely
      is_mandatory: boolean, // Force trainers to fill
      is_readonly: boolean, // Trainers cannot edit
      
      // Validation
      validation_rules: ValidationRule[],
      custom_error_message: string,
      
      // Display
      display_label: string, // Custom label
      display_order: number,
      display_section: string, // Which section to group in
      help_text: string,
      placeholder: string,
      
      // Access
      visibility_level: 'public' | 'public_with_subscription' | 'private',
      show_in_cv_export: boolean,
      show_in_pdf_export: boolean,
      
      // Customization
      allow_trainer_customize: boolean,
      custom_css_allowed: boolean,
    }
  },

  // Conditional fields (show based on conditions)
  conditional_fields: {
    [fieldName: string]: {
      visible_if: {
        field: string,
        condition: 'equals' | 'contains' | 'gt' | 'lt',
        value: any,
      }[],
    }
  },
}
```

### Admin Panel UI Mock

```
╔══════════════════════════════════════════════════════════════╗
│  ADMIN PANEL - TRAINER PROFILE FIELD MANAGEMENT              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  [GLOBAL SETTINGS] [FIELD MANAGER] [TEMPLATES] [ANALYTICS]  │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  FIELD MANAGEMENT                                            │
│                                                               │
│  📋 BASIC INFORMATION                                        │
│  ├─ ✅ Headline              [Edit] [Hide] [Make mandatory] │
│  ├─ ✅ Short Bio             [Edit] [Hide] [Make mandatory] │
│  ├─ ✅ Long Bio              [Edit] [Hide] [Optional]       │
│  ├─ ✅ Cover Image           [Edit] [Hide] [Optional]       │
│  └─ ⭕ Additional Field      [Edit] [Hide]                  │
│                                                               │
│  💪 PROFESSIONAL STATS                                       │
│  ├─ ✅ Years Experience      [Edit] [Hide] [Mandatory]      │
│  ├─ ✅ Clients Trained       [Edit] [Hide] [Optional]       │
│  ├─ ✅ Success Stories       [Edit] [Hide] [Optional]       │
│  └─ ⭕ Custom Metric         [Edit] [Hide]                  │
│                                                               │
│  🎓 CREDENTIALS                                              │
│  ├─ ✅ Certifications        [Edit] [Hide] [Mandatory]      │
│  ├─ ✅ Awards                [Edit] [Hide] [Optional]       │
│  ├─ ✅ Media Features        [Edit] [Hide] [Optional]       │
│  └─ ➕ Add Field             [Create new field]             │
│                                                               │
│  💼 EXPERIENCE                                               │
│  ├─ ✅ Work Experience       [Edit] [Hide] [Mandatory]      │
│  └─ ✅ Specialties           [Edit] [Hide] [Mandatory]      │
│                                                               │
│  📸 PORTFOLIO                                                │
│  ├─ ✅ Gallery/Transformations [Edit] [Hide] [Optional]     │
│  └─ ✅ Testimonials           [Edit] [Hide] [Optional]      │
│                                                               │
│  ⚙️ ADVANCED OPTIONS                                         │
│  ├─ ✅ Pricing Details        [Edit] [Hide] [Optional]      │
│  ├─ ✅ FAQ Section            [Edit] [Hide] [Optional]      │
│  ├─ ✅ Custom Sections        [Edit] [Hide] [Optional]      │
│  ├─ ✅ Theme Customization    [Edit] [Hide] [Optional]      │
│  └─ ✅ Social Links           [Edit] [Hide] [Optional]      │
│                                                               │
│  [SAVE CHANGES]  [RESET TO DEFAULT]  [CREATE TEMPLATE]     │
│                                                               │
└──────────────────────────────────────────────────────────────┘

FIELD DETAIL EDITOR (Click on any field):

╔══════════════════════════════════════════════════════════════╗
│  EDIT FIELD: "Years Experience"                             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  BASIC SETTINGS                                              │
│  Field Name:          years_experience                       │
│  Display Label:       [Years of Experience]                 │
│  Field Type:          [Number] ▼                            │
│  Help Text:           [Optional guidance for trainers]      │
│  Placeholder:         [Enter a number...]                   │
│                                                               │
│  VISIBILITY & CONTROL                                        │
│  ☑️ Field Active               (Admin can disable entirely)  │
│  ☑️ Mandatory for Trainers     (Force trainers to fill)      │
│  ☐ Read-Only                  (Trainers cannot edit)        │
│  ☑️ Show in Public Profile     (Visible to everyone)        │
│  ☑️ Show in CV Export          (Include in PDF)             │
│  ☑️ Allow Trainer Customization (They can hide it)          │
│                                                               │
│  VALIDATION                                                  │
│  Min Value:           [0] ▼                                  │
│  Max Value:           [50] ▼                                 │
│  Custom Error Msg:    [Please enter a valid number]         │
│                                                               │
│  DISPLAY OPTIONS                                             │
│  Section:             [Professional Stats] ▼                │
│  Display Order:       [1] ▼                                  │
│  Column Width:        [Full Width] ▼                         │
│                                                               │
│  [SAVE]  [CANCEL]  [DUPLICATE]  [DELETE]                    │
│                                                               │
└──────────────────────────────────────════════════════════════╘
```

---

## 5. EXPORT FEATURES (Download Profile as CV)

### Export Formats

```typescript
// Export service
export class ProfileExportService {
  
  // 1. PDF Export (Professional CV format)
  async exportAsPDF(trainerId: string): Promise<Buffer> {
    const profile = await getTrainerProfile(trainerId);
    const pdf = new PDFDocument();
    
    // Header with cover image/avatar
    pdf.image(profile.avatarUrl, 50, 50, { width: 100 });
    pdf.fontSize(24).text(profile.fullName, 160, 50);
    pdf.fontSize(12).text(profile.headline, 160, 80);
    
    // Quick Stats
    pdf.fontSize(10).text(`Years Experience: ${profile.yearsExperience}`, 50, 180);
    pdf.text(`Clients Trained: ${profile.clientsTrained}`);
    pdf.text(`Success Rate: ${profile.successRate}%`);
    
    // About
    pdf.fontSize(14).text('About Me', 50, 250);
    pdf.fontSize(10).text(profile.bioLong);
    
    // Specialties
    pdf.fontSize(14).text('Specialties', 50, 400);
    profile.specialties.forEach((s) => {
      pdf.text(`• ${s.name} (${s.yearsExperience} years)`);
    });
    
    // Certifications
    pdf.fontSize(14).text('Certifications', 50, 500);
    profile.certifications.forEach((c) => {
      pdf.text(`✓ ${c.name} - ${c.issuer} (${c.issueDate.year})`);
    });
    
    // Experience
    pdf.fontSize(14).text('Experience', 50, 600);
    profile.experience.forEach((exp) => {
      pdf.text(`${exp.jobTitle} at ${exp.organization}`);
      pdf.text(`${exp.startDate} - ${exp.endDate || 'Present'}`);
      pdf.text(exp.description);
    });
    
    // Results/Testimonials
    pdf.fontSize(14).text('Client Results', 50, 700);
    profile.testimonials.slice(0, 3).forEach((t) => {
      pdf.text(`• ${t.resultAchieved} - ${t.clientName}`);
    });
    
    // Contact
    pdf.fontSize(10).text(`Contact: ${profile.email} | ${profile.phone}`);
    pdf.text(`Location: ${profile.location}`);
    
    return pdf.output();
  }
  
  // 2. HTML Export (Shareable landing page)
  async exportAsHTML(trainerId: string): Promise<string> {
    const profile = await getTrainerProfile(trainerId);
    return renderTrainerProfile(profile); // React to HTML
  }
  
  // 3. JSON Export (Data backup, import to other platforms)
  async exportAsJSON(trainerId: string): Promise<object> {
    return await getTrainerProfile(trainerId);
  }
  
  // 4. LinkedIn Export (Format for LinkedIn profile)
  async exportForLinkedIn(trainerId: string): Promise<string> {
    const profile = await getTrainerProfile(trainerId);
    return formatForLinkedIn(profile);
  }
}
```

### Profile Sharing Features

```typescript
// Sharing options
interface ProfileSharingOptions {
  // Public link
  public_url: string, // gymerviet.com/trainers/john-strength-coach
  
  // Custom domain (Premium)
  custom_domain: string, // coach.johndoe.com
  
  // QR Code
  qr_code_url: string, // Auto-generated QR
  
  // Social sharing
  share_templates: {
    facebook: string, // Pre-filled Facebook post
    instagram: string, // Bio link + story template
    whatsapp: string, // Share message
    twitter: string, // Tweet template
  },
  
  // Download options
  download_pdf: boolean,
  download_png: boolean, // Screenshot as PNG
  download_json: boolean,
  
  // Analytics
  track_shares: boolean,
  track_downloads: boolean,
  track_profile_views: boolean,
  
  // Access control
  is_public: boolean,
  requires_email_to_view: boolean,
  password_protected: boolean,
  expiration_date: Date | null,
}
```

---

## 6. TRAINER PROFILE API ENDPOINTS

```typescript
// API Routes for Profile Management

// GET - Retrieve trainer profile (public)
GET /api/v1/trainers/:trainer_id/profile
GET /api/v1/profiles/:slug (by slug, e.g., /john-strength-coach)

// PUT - Update profile (trainer only)
PUT /api/v1/trainers/me/profile
PUT /api/v1/trainers/me/profile/sections
PUT /api/v1/trainers/me/profile/customization

// POST - Add profile sections/gallery
POST /api/v1/trainers/me/profile/sections
POST /api/v1/trainers/me/profile/gallery
POST /api/v1/trainers/me/profile/testimonials
POST /api/v1/trainers/me/profile/experience
POST /api/v1/trainers/me/profile/certifications

// DELETE - Remove sections
DELETE /api/v1/trainers/me/profile/sections/:section_id
DELETE /api/v1/trainers/me/profile/gallery/:image_id

// EXPORT/DOWNLOAD
GET /api/v1/trainers/:trainer_id/profile/export/pdf
GET /api/v1/trainers/:trainer_id/profile/export/json
GET /api/v1/trainers/:trainer_id/profile/export/html
GET /api/v1/trainers/:trainer_id/profile/qr-code

// SHARING
GET /api/v1/trainers/:trainer_id/profile/share-link
POST /api/v1/trainers/me/profile/share
GET /api/v1/trainers/:trainer_id/profile/analytics

// ADMIN - Field Management
GET /api/v1/admin/profile-fields (list all available fields)
PUT /api/v1/admin/profile-fields/:field_id (update field config)
POST /api/v1/admin/profile-fields (create custom field)
DELETE /api/v1/admin/profile-fields/:field_id
GET /api/v1/admin/profile-templates (get templates)
POST /api/v1/admin/profile-templates (create template)

// CUSTOMIZATION
PUT /api/v1/trainers/me/profile/theme
PUT /api/v1/trainers/me/profile/customization
GET /api/v1/trainers/me/profile/customization
```

---

## 7. PROFILE THEMES (Design Templates)

```typescript
// Pre-designed themes trainers can choose
const PROFILE_THEMES = {
  modern: {
    name: 'Modern',
    description: 'Clean, contemporary design',
    primary_color: '#3B82F6',
    accent_color: '#10B981',
    font_family: 'Inter, sans-serif',
    layout: 'card-based',
    features: ['gradient_header', 'floating_buttons', 'dark_mode'],
  },
  
  classic: {
    name: 'Classic',
    description: 'Traditional professional look',
    primary_color: '#1F2937',
    accent_color: '#F59E0B',
    font_family: 'Georgia, serif',
    layout: 'traditional',
    features: ['formal_header', 'sidebar', 'serif_fonts'],
  },
  
  minimal: {
    name: 'Minimal',
    description: 'Simple and focused',
    primary_color: '#FFFFFF',
    accent_color: '#000000',
    font_family: 'Helvetica, sans-serif',
    layout: 'single_column',
    features: ['no_animations', 'whitespace', 'typography_focused'],
  },
  
  creative: {
    name: 'Creative',
    description: 'Bold and artistic',
    primary_color: '#EC4899',
    accent_color: '#06B6D4',
    font_family: 'Poppins, sans-serif',
    layout: 'asymmetric',
    features: ['animations', 'bold_colors', 'creative_sections'],
  },
};
```

---

## 8. SUMMARY OF FEATURES

### Trainer Profile System Includes:

✅ **Professional Landing Page**
- Full bio with rich media
- Professional photo/avatar
- Cover image
- Social links

✅ **Detailed Information**
- Experience history
- Certifications (with verification)
- Specialties (with detailed descriptions)
- Awards & recognition
- Media mentions

✅ **Social Proof**
- Testimonials from clients
- Before/After photos
- Transformation stories
- Success statistics
- Reviews & ratings

✅ **Customization**
- Multiple color themes
- Custom sections
- Layout options
- Limited CSS customization

✅ **Sharing & Export**
- Public URL (SEO-friendly slug)
- QR code generation
- PDF export (CV format)
- HTML/JSON export
- Social media sharing
- Email sharing

✅ **Analytics**
- Profile view tracking
- Engagement metrics
- Traffic source analysis
- Download tracking
- Conversion tracking

✅ **Admin Control (God Mode)**
- Enable/disable fields
- Make fields mandatory/optional
- Custom field creation
- Field validation rules
- Conditional field display
- Global theme management
- Per-field visibility control
- Template creation

✅ **Mobile Responsive**
- Perfect on all devices
- Touch-friendly
- Fast loading
- Offline support (PWA)

---

## 9. IMPLEMENTATION PRIORITY

### Phase 1 (MVP):
1. Basic profile fields (bio, avatar, headline)
2. Professional info (experience, certs, specialties)
3. Simple export (PDF)
4. Public profile URL
5. Admin field management (basic)

### Phase 2:
1. Gallery & testimonials
2. Theme customization
3. Advanced sharing (QR, social)
4. Analytics
5. Custom sections

### Phase 3:
1. Custom field builder (Admin)
2. Conditional fields
3. Template system
4. Advanced export formats
5. Video portfolio support

---

This is a **PROFESSIONAL PORTFOLIO SYSTEM** that turns trainers' profiles into marketing assets!

Ready to build? 🚀
