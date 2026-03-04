# 🎨 GYMER VIỆT - DEV MINIMAL UTILITY UI SYSTEM

## Design Philosophy

**Not Marketing. Not Branding. Tool-First.**

Internal SaaS tool vibe - Users know exactly what they're doing, no distractions.

---

## 1. COLOR PALETTE

### Primary Colors
```
Background:     #FFFFFF (pure white)
Text Primary:   #000000 (pure black)
Text Secondary: #666666 (medium gray)
Text Tertiary:  #888888 (light gray)
Border:         #E5E5E5 (very light gray - 95% opacity)
Hover State:    #F5F5F5 (nearly white, 97% opacity)
Selected:       #000000 (black accent)
Disabled:       #CCCCCC (disabled gray)
```

### DO NOT USE:
❌ Gradient  
❌ Neon colors  
❌ Brand colors  
❌ Multiple color palette  
❌ Bright accent colors  

### Typography Colors
```
Heading (H1-H6):    #000000
Body Text:          #666666
Helper Text:        #888888
Links:              #000000 (with underline)
Link Hover:         #000000 (underline bold)
Link Visited:       #666666
Error:              #333333 (dark gray, not red)
Success:            #333333 (dark gray, not green)
Warning:            #666666 (medium gray, not yellow)
```

---

## 2. TYPOGRAPHY

### Font Family
```css
/* Single sans-serif stack */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", 
             "Helvetica Neue", sans-serif;

/* Do NOT use: */
❌ Serif fonts
❌ Custom fonts
❌ Display fonts
❌ Script fonts
```

### Font Sizes & Weights

```
H1 (Page Title)
├─ Size: 28px
├─ Weight: 600 (semibold)
├─ Line Height: 1.4 (39.2px)
└─ Margin Bottom: 24px

H2 (Section Title)
├─ Size: 20px
├─ Weight: 600 (semibold)
├─ Line Height: 1.4 (28px)
└─ Margin Bottom: 16px

H3 (Subsection)
├─ Size: 16px
├─ Weight: 600 (semibold)
├─ Line Height: 1.4 (22.4px)
└─ Margin Bottom: 12px

Body Text (Standard)
├─ Size: 14px
├─ Weight: 400 (regular)
├─ Line Height: 1.6 (22.4px)
├─ Color: #666666
└─ Letter Spacing: 0

Small Text (Helper, Labels)
├─ Size: 12px
├─ Weight: 400 (regular)
├─ Line Height: 1.5 (18px)
├─ Color: #888888
└─ Letter Spacing: 0

Caption (Very Small)
├─ Size: 11px
├─ Weight: 400 (regular)
├─ Line Height: 1.4 (15.4px)
├─ Color: #888888
└─ Letter Spacing: 0

Code Block
├─ Font: Monospace (Monaco, "Courier New")
├─ Size: 12px
├─ Weight: 400
├─ Line Height: 1.5
└─ Color: #333333
```

### Font Weight Usage (NO COLOR CONTRAST)

```
❌ DO NOT:
- Use color to create contrast
- Use multiple colors for emphasis
- Use highlights or backgrounds

✅ DO:
- Use font weight (400 vs 600)
- Use size variation (14px vs 12px)
- Use position (spacing above/below)
- Use line-height (more breathing room)

Example - Creating Hierarchy WITHOUT COLOR:
┌─────────────────────────────────────┐
│  My Workouts          (28px 600)    │  ← Bold, larger
│  (Heavy font weight creates visual) │  │ emphasis
│                                     │  └─ No color needed
│  Last Updated: March 4, 2024        │
│  (14px 400 regular)                 │  ← Lighter, smaller
│  (Less important, shown via weight) │
└─────────────────────────────────────┘
```

---

## 3. SPACING SYSTEM

### Spacing Scale (8px base unit)
```
4px    - Micro spacing (rarely used)
8px    - Minimal spacing (form elements)
12px   - Small spacing (between elements)
16px   - Standard spacing (default padding/margin)
24px   - Medium spacing (section spacing)
32px   - Large spacing (major sections)
48px   - Extra large (page sections)
64px   - Maximum (rare, page-level spacing)
```

### Padding Rules
```
Small Containers (Cards, Inputs):  12px or 16px
Medium Containers (Panels):         16px or 24px
Large Containers (Pages):           32px all sides

Form Fields:                         12px horizontal, 10px vertical
Button:                             12px horizontal, 10px vertical
List Items:                         12px vertical, 16px horizontal
Card:                              16px or 24px (consistent)
```

### Margin Rules
```
Between Heading + Paragraph:        16px
Between Paragraphs:                 12px
Between Form Fields:                16px
Between Sections:                   32px to 48px
After Main Heading:                 24px
After Sub-Heading:                  16px
```

### Line Height (Breathing Room)
```
Heading (H1-H3):    1.4  (more breathing room)
Body Text:          1.6  (generous spacing)
Small Text:         1.5  (tighter but readable)
Form Labels:        1.4  (compact)
List Items:         1.5  (slightly loose)

Why 1.6 for body?
- Easier to scan
- No cognitive overload
- Looks less dense
- Reduces stress on eyes
```

---

## 4. COMPONENTS

### BUTTON

```
Styles:
├─ Primary (CTA)
│  ├─ Background: #000000
│  ├─ Text: #FFFFFF
│  ├─ Border: none
│  ├─ Padding: 10px 16px
│  ├─ Font: 14px 500
│  ├─ Border-radius: 2px
│  ├─ Cursor: pointer
│  └─ Hover: #1A1A1A (99% black)
│
├─ Secondary
│  ├─ Background: transparent
│  ├─ Text: #000000
│  ├─ Border: 1px #E5E5E5
│  ├─ Padding: 10px 16px
│  ├─ Font: 14px 500
│  ├─ Border-radius: 2px
│  └─ Hover: Background #F5F5F5
│
├─ Tertiary (Ghost)
│  ├─ Background: transparent
│  ├─ Text: #666666
│  ├─ Border: none
│  ├─ Padding: 10px 16px
│  ├─ Font: 14px 400
│  ├─ Border-radius: 2px
│  └─ Hover: Text #000000
│
├─ Disabled
│  ├─ Background: #F5F5F5
│  ├─ Text: #CCCCCC
│  ├─ Border: 1px #E5E5E5
│  ├─ Opacity: 0.5
│  └─ Cursor: not-allowed
│
└─ Sizes
   ├─ Small:   10px 12px (12px font)
   ├─ Medium:  10px 16px (14px font) [DEFAULT]
   └─ Large:   12px 20px (16px font)

Do NOT:
❌ Add shadows
❌ Add gradients
❌ Rounded corners > 2px
❌ Animations on hover
❌ Multiple background colors
```

### INPUT FIELDS

```
Base Style:
├─ Background: #FFFFFF
├─ Border: 1px #E5E5E5
├─ Border-radius: 2px
├─ Padding: 10px 12px
├─ Font: 14px 400 #666666
├─ Line-height: 1.5
├─ Min-height: 36px
└─ Width: 100% (in container)

States:
├─ Focus
│  ├─ Border: 1px #000000 (black)
│  ├─ Background: #FFFFFF
│  ├─ Outline: none
│  └─ Box-shadow: none
│
├─ Filled
│  ├─ Border: 1px #E5E5E5
│  ├─ Background: #FFFFFF
│  └─ Text: #000000 (black)
│
├─ Disabled
│  ├─ Border: 1px #E5E5E5
│  ├─ Background: #F5F5F5
│  ├─ Text: #CCCCCC
│  └─ Cursor: not-allowed
│
├─ Error
│  ├─ Border: 1px #333333 (dark gray)
│  ├─ Background: #FFFBFB (very slightly pink-tinted white)
│  └─ Helper text: #666666
│
└─ Success
   ├─ Border: 1px #333333 (dark gray)
   ├─ Background: #FFFFFF
   └─ Helper text: #666666

Label:
├─ Font: 12px 500 #000000
├─ Margin-bottom: 6px
├─ Line-height: 1.4
└─ Display: block

Helper Text:
├─ Font: 11px 400 #888888
├─ Margin-top: 4px
└─ Line-height: 1.4

Placeholder:
├─ Color: #AAAAAA
├─ Font-weight: 400
└─ Opacity: 1 (not reduced)

Do NOT:
❌ Add shadows
❌ Rounded corners > 2px
❌ Background color tints
❌ Colored borders (except black on focus)
❌ Icons inside (keep clean)
```

### DROPDOWN / SELECT

```
Closed State:
├─ Background: #FFFFFF
├─ Border: 1px #E5E5E5
├─ Padding: 10px 12px
├─ Font: 14px 400 #666666
├─ Border-radius: 2px
├─ Chevron: #999999 (right side)
└─ Min-height: 36px

Open State:
├─ Border: 1px #000000
├─ Background: #FFFFFF
└─ Menu Z-index: 100

Menu Items:
├─ Padding: 10px 12px
├─ Font: 14px 400
├─ Line-height: 1.5
├─ Border-bottom: 1px #E5E5E5
│
├─ Hover State
│  ├─ Background: #F5F5F5
│  └─ Text: #000000
│
├─ Selected State
│  ├─ Background: #FFFFFF
│  ├─ Text: #000000
│  ├─ Font-weight: 500
│  └─ Left border: 2px #000000
│
└─ Disabled Item
   ├─ Background: #F5F5F5
   ├─ Text: #CCCCCC
   └─ Cursor: not-allowed

Do NOT:
❌ Checkmarks on selected items
❌ Colored backgrounds
❌ Shadows
❌ Rounded corners > 2px
```

### CARD / PANEL

```
Base Style:
├─ Background: #FFFFFF
├─ Border: 1px #E5E5E5
├─ Border-radius: 2px
├─ Padding: 16px or 24px (consistent)
└─ Margin-bottom: 16px to 24px

Hover (if clickable):
├─ Background: #FFFFFF
├─ Border: 1px #CCCCCC
├─ Cursor: pointer
└─ No shadow

Sections Inside Card:
├─ Header Section
│  ├─ Border-bottom: 1px #E5E5E5
│  ├─ Padding-bottom: 12px
│  └─ H3 Font: 16px 600 #000000
│
├─ Body Section
│  ├─ Padding-top: 12px
│  └─ Font: 14px 400 #666666
│
└─ Footer Section
   ├─ Border-top: 1px #E5E5E5
   ├─ Padding-top: 12px
   └─ Font: 12px 400 #888888

Do NOT:
❌ Add shadow on card
❌ Gradient backgrounds
❌ Colored separators
❌ Rounded corners > 2px
```

### NAVIGATION (TOP BAR)

```
Height: 56px (or 48px on mobile)

Base Style:
├─ Background: #FFFFFF
├─ Border-bottom: 1px #E5E5E5
├─ Display: flex
├─ Align-items: center
├─ Padding: 0 24px
└─ Z-index: 50 (NOT sticky, light touch)

Left Section (Logo/App Name):
├─ Font: 16px 600 #000000
├─ Flex: 1
└─ Margin-right: auto

Center Section (Optional):
├─ Font: 14px 400 #666666
├─ Display: flex
├─ Gap: 24px
└─ Links: #000000 (underline on hover)

Right Section (Auth):
├─ Display: flex
├─ Gap: 12px
├─ Align-items: center
│
├─ User Menu (if logged in)
│  ├─ Button: Secondary style
│  ├─ Text: "Account" or user initials
│  └─ Font: 14px 400
│
└─ Login Button
   ├─ Button: Primary (black background)
   ├─ Text: "Sign In"
   ├─ Font: 14px 500
   └─ No icon, text only

Responsive (Mobile):
├─ Height: 48px
├─ Padding: 0 16px
├─ Font sizes: -2px all
└─ Center section: hidden (show in menu)

Do NOT:
❌ Sticky navigation (light touch)
❌ Shadows
❌ Rounded corners
❌ Animations on scroll
❌ Color changes on scroll
❌ Multiple colors
```

### SIDEBAR / NAVIGATION MENU

```
Width: 240px (or collapsible)
Height: 100vh - 56px (below top nav)

Base Style:
├─ Background: #FFFFFF
├─ Border-right: 1px #E5E5E5
├─ Overflow-y: auto
└─ Z-index: 40

Menu Items:
├─ Padding: 12px 16px
├─ Font: 14px 400 #666666
├─ Border-left: 2px transparent
├─ Margin-bottom: 2px
│
├─ Hover State
│  ├─ Background: #F5F5F5
│  ├─ Text: #000000
│  └─ Cursor: pointer
│
├─ Active State
│  ├─ Background: #FFFFFF
│  ├─ Border-left: 2px #000000
│  ├─ Text: #000000
│  ├─ Font-weight: 500
│  └─ Padding-left: 14px (accounts for border)
│
└─ Disabled State
   ├─ Text: #CCCCCC
   └─ Cursor: not-allowed

Section Headers:
├─ Font: 11px 600 #888888 (uppercase optional)
├─ Padding: 16px 16px 8px 16px
├─ Margin-top: 12px
└─ Margin-bottom: 4px

Sub-items (nested):
├─ Padding-left: 32px
├─ Font: 13px 400 #888888
└─ Smaller than main items

Do NOT:
❌ Icons (text only, minimal)
❌ Colored items
❌ Badges with color
❌ Shadows
❌ Gradients
❌ Animations
```

### TABLE

```
Base Style:
├─ Width: 100%
├─ Border-collapse: collapse
└─ Background: #FFFFFF

Table Header (thead):
├─ Background: #F5F5F5
├─ Border-bottom: 1px #E5E5E5
│
├─ th (cell)
│  ├─ Font: 12px 600 #000000
│  ├─ Padding: 12px 16px
│  ├─ Text-align: left
│  ├─ Line-height: 1.4
│  └─ Vertical-align: middle
│
└─ th[sort] (sortable header)
   ├─ Cursor: pointer
   ├─ User-select: none
   └─ Chevron: #999999 (optional)

Table Body (tbody):
├─ tr (row)
│  ├─ Border-bottom: 1px #E5E5E5
│  └─ Hover
│     └─ Background: #F5F5F5
│
└─ td (cell)
   ├─ Font: 14px 400 #666666
   ├─ Padding: 12px 16px
   ├─ Line-height: 1.5
   └─ Vertical-align: middle

Striped Rows (optional):
├─ Even rows: #FFFFFF
└─ Odd rows: #FAFAFA

Highlighted Row (selected):
├─ Background: #F5F5F5
├─ Border-left: 2px #000000
└─ Padding-left: 14px

Do NOT:
❌ Colored rows
❌ Shadows on rows
❌ Gradients
❌ Borders around cells
❌ Multiple colors
```

### TABS

```
Tab Container:
├─ Display: flex
├─ Border-bottom: 1px #E5E5E5
└─ Gap: 0

Tab Button:
├─ Background: transparent
├─ Border: none
├─ Border-bottom: 2px transparent
├─ Padding: 12px 16px
├─ Font: 14px 400 #666666
├─ Cursor: pointer
├─ Margin: 0
│
├─ Hover State
│  ├─ Background: #F5F5F5
│  ├─ Text: #000000
│  └─ Border-bottom: 2px #CCCCCC
│
└─ Active State
   ├─ Background: transparent
   ├─ Border-bottom: 2px #000000
   ├─ Text: #000000
   ├─ Font-weight: 500
   └─ No background color

Tab Content:
├─ Display: none (when inactive)
├─ Display: block (when active)
├─ Padding: 16px
└─ Font: 14px 400 #666666

Do NOT:
❌ Rounded corners on tabs
❌ Background colors on inactive tabs
❌ Shadows
❌ Colors other than black/gray
```

### MODAL / DIALOG

```
Overlay:
├─ Background: rgba(0, 0, 0, 0.3) (30% black)
├─ Position: fixed
├─ Z-index: 1000
├─ Inset: 0
└─ Display: flex

Modal Content:
├─ Background: #FFFFFF
├─ Border: 1px #E5E5E5
├─ Border-radius: 2px
├─ Padding: 24px
├─ Max-width: 500px
├─ Min-width: 300px
└─ Z-index: 1001

Header:
├─ Font: 18px 600 #000000
├─ Margin-bottom: 16px
└─ Padding-bottom: 12px
└─ Border-bottom: 1px #E5E5E5

Body:
├─ Font: 14px 400 #666666
├─ Margin: 16px 0
├─ Line-height: 1.6
└─ Max-height: 60vh (scrollable)

Footer:
├─ Display: flex
├─ Gap: 12px
├─ Justify-content: flex-end
├─ Margin-top: 24px
├─ Padding-top: 12px
└─ Border-top: 1px #E5E5E5

Close Button (X):
├─ Position: absolute
├─ Top-right: 16px
├─ Font: 18px #666666
├─ Cursor: pointer
├─ Hover: #000000

Do NOT:
❌ Animations on appear
❌ Shadows (very subtle if needed)
❌ Colored overlays
❌ Rounded corners > 2px
```

---

## 5. FORM LAYOUT

### Basic Form

```
┌────────────────────────────────────┐
│ Form Title                  (H2)    │ ← 20px 600 #000000
│                                    │
│ [Label]                            │ ← 12px 500 #000000
│ [Input field]                      │ ← 14px 400 #666666, 36px height
│ Helper text                        │ ← 11px 400 #888888
│                                    │ ← 16px spacing
│ [Label]                            │
│ [Textarea]                         │ ← Taller version of input
│ Helper text (optional)             │
│                                    │ ← 24px spacing
│ [Label]                            │
│ [Dropdown]                         │
│                                    │ ← 16px spacing
│ ☐ Checkbox Label                   │ ← 14px 400 #666666
│ ☐ Checkbox Label                   │
│                                    │ ← 24px spacing
│ [Primary Button] [Secondary Button]│ ← Right-aligned buttons
│                                    │
└────────────────────────────────────┘
```

### Multi-Column Form

```
┌──────────────────────────────────────────┐
│ Form Title                               │
│                                          │
│ [Label]              [Label]             │ ← Two columns
│ [Input]              [Input]             │ ← Gap: 16px
│                                          │
│ [Label]                                  │ ← Full width (below 2-col)
│ [Textarea - full width]                  │
│                                          │
│ [Primary Button]  [Secondary Button]     │
│                                          │
└──────────────────────────────────────────┘
```

### Form Validation

```
Error State:
├─ Border: 1px #333333 (dark gray, not red)
├─ Background: #FFFBFB (nearly white, subtle)
├─ Helper text: #666666 (standard gray, not red)
└─ Message: "This field is required"

Success State:
├─ Border: 1px #333333 (dark gray, not green)
├─ Background: #FFFFFF (standard white)
├─ Helper text: #666666 (standard gray, not green)
└─ Message: "Looks good!"

Warning State:
├─ Border: 1px #E5E5E5 (standard border)
├─ Background: #FFFFFF (standard white)
├─ Helper text: #888888 (light gray)
└─ Message: "Please note..."

Do NOT:
❌ Red borders for errors
❌ Green borders for success
❌ Colored backgrounds for states
❌ Emoji or icons
❌ Animations
```

---

## 6. PAGE LAYOUTS

### Trainer Profile Page

```
┌────────────────────────────────────────────────────────────┐
│ [Top Nav - Light, minimalist]                             │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ [Profile Header]                                            │
│ ├─ Avatar (100x100)                                        │
│ ├─ Name (28px 600 #000000)                                │
│ ├─ Headline (16px 500 #666666)                            │
│ ├─ Stats (14px 400 #888888)                               │
│ └─ CTA Button (Primary)                                    │
│                                                             │
│ ─────────────────────────────────────────────── (divider)  │
│                                                             │
│ [About Section]                                            │
│ ├─ Section Title (H2 20px 600)                            │
│ ├─ Bio text (14px 400 #666666, 1.6 line-height)          │
│ └─ Empty space (32px)                                      │
│                                                             │
│ [Experience Section]                                       │
│ ├─ Section Title (H2 20px 600)                            │
│ ├─ Experience Item (repeating)                            │
│ │  ├─ Title (16px 600 #000000)                           │
│ │  ├─ Company (14px 500 #666666)                         │
│ │  ├─ Description (14px 400 #888888)                     │
│ │  └─ Divider below                                       │
│ └─ Empty space (32px)                                      │
│                                                             │
│ [Specialties Section]                                      │
│ ├─ Section Title (H2 20px 600)                            │
│ ├─ Specialty Pills/Cards (repeating)                       │
│ │  ├─ Name (14px 600 #000000)                            │
│ │  └─ Badge border (1px #E5E5E5)                         │
│ └─ Empty space (32px)                                      │
│                                                             │
│ [Testimonials Section]                                     │
│ ├─ Section Title (H2 20px 600)                            │
│ ├─ Testimonial Cards (repeating, 1 column, mobile 2 cols) │
│ │  ├─ Rating (14px 600 #000000)                          │
│ │  ├─ Quote (14px 400 #666666)                           │
│ │  ├─ Author (12px 500 #000000)                          │
│ │  └─ Card border (1px #E5E5E5)                          │
│ └─ Empty space (32px)                                      │
│                                                             │
│ [Gallery Section]                                          │
│ ├─ Section Title (H2 20px 600)                            │
│ ├─ Images Grid (3 columns desktop, 2 mobile, 1 tiny)      │
│ │  └─ Border (1px #E5E5E5)                               │
│ └─ Empty space (32px)                                      │
│                                                             │
│ [Pricing Section]                                          │
│ ├─ Section Title (H2 20px 600)                            │
│ ├─ Program Cards (repeating, 1 column, mobile 1)          │
│ │  ├─ Name (16px 600 #000000)                            │
│ │  ├─ Price (18px 600 #000000)                           │
│ │  ├─ Description (14px 400 #888888)                     │
│ │  ├─ Features list (12px 400 #666666)                   │
│ │  ├─ CTA Button (Primary)                               │
│ │  └─ Card border (1px #E5E5E5)                          │
│ └─ Empty space (32px)                                      │
│                                                             │
│ [Footer]                                                   │
│ ├─ Contact info (12px 400 #888888)                        │
│ ├─ Social links (14px 400 #000000, underline)            │
│ └─ Copyright (11px 400 #AAAAAA)                           │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Dashboard Page

```
┌────────────────────────────────────────────────────────────┐
│ [Top Nav]                                                  │
├───────────────────┬────────────────────────────────────────┤
│                   │                                        │
│ [Sidebar Menu]    │ [Main Content Area]                   │
│                   │                                        │
│ My Workouts       │ [Page Header]                         │
│ My Progress       │ └─ H1 (28px 600 #000000)             │
│ Messages          │                                        │
│ Settings          │ [Stats Cards - Grid 2-4 columns]      │
│                   │ ├─ Stat Card                          │
│ [Logout Button]   │ │  ├─ Label (12px 500 #888888)       │
│                   │ │  ├─ Value (24px 600 #000000)        │
│                   │ │  └─ Card border (1px #E5E5E5)       │
│                   │                                        │
│                   │ [Content Sections]                     │
│                   │ ├─ H2 (20px 600) + divider            │
│                   │ ├─ Table or List or Cards             │
│                   │ ├─ H2 (20px 600) + divider            │
│                   │ └─ Form or Cards                      │
│                   │                                        │
└───────────────────┴────────────────────────────────────────┘
```

---

## 7. RESPONSIVE DESIGN

### Breakpoints
```
Mobile:    0px - 640px
Tablet:    641px - 1024px
Desktop:   1025px+
```

### Changes by Breakpoint

```
MOBILE (0 - 640px):
├─ Font sizes: -2px all (except H1: -4px)
├─ Padding: 12px → 8px
├─ Margin: -4px all (slightly tighter)
├─ Sidebar: Hidden, toggle menu
├─ Form: Single column (always)
├─ Table: Becomes stacked card list
├─ Grid: 1 column (always)
└─ Top nav height: 48px

TABLET (641px - 1024px):
├─ Font sizes: -1px for body
├─ Form: 2 columns for small forms
├─ Grid: 2 columns
├─ Sidebar: Visible or collapsible
├─ Top nav height: 56px
└─ Spacing: Full (no reduction)

DESKTOP (1025px+):
├─ All spacing at 100%
├─ Sidebar: Always visible (or toggle)
├─ Form: Full 2-4 column layouts
├─ Grid: 3-4 columns
├─ Table: Full horizontal scroll
└─ Top nav height: 56px
```

### Mobile-First CSS Pattern

```css
/* Default (Mobile) */
.button {
  font-size: 12px;
  padding: 8px 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

/* Tablet & Up */
@media (min-width: 641px) {
  .button {
    font-size: 14px;
    padding: 10px 16px;
  }
  
  .form-grid {
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
}

/* Desktop & Up */
@media (min-width: 1025px) {
  .form-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
}
```

---

## 8. DARK MODE (OPTIONAL - FUTURE)

If implementing dark mode:

```
Dark Background:    #1A1A1A
Dark Surface:       #2D2D2D
Dark Border:        #3D3D3D
Dark Text Primary:  #E5E5E5
Dark Text Secondary:#999999
Dark Text Tertiary: #666666
```

But for MVP: **White background only**, no dark mode.

---

## 9. ACCESSIBILITY

### WCAG AA Compliant

```
Color Contrast:
├─ Text on Background: 7:1 ratio (Black #000 on White #FFF)
├─ Secondary Text: 4.5:1 ratio (#666666 on White)
├─ Borders: 3:1 ratio (#E5E5E5 on White)
└─ All text meets AA standard

Keyboard Navigation:
├─ All buttons: focusable
├─ All links: focusable
├─ Tab order: logical
├─ Focus visible: black border (2px)
└─ No keyboard traps

Screen Reader:
├─ Semantic HTML (button, nav, main, section, article)
├─ Proper heading hierarchy (H1, H2, H3 only)
├─ alt text on images
├─ aria-label on icon buttons
└─ aria-expanded on dropdowns

Typography:
├─ Min font size: 11px (caption)
├─ Line-height: 1.4+ (minimum)
├─ Letter spacing: normal
└─ No text-only content
```

---

## 10. COMPONENT CHECKLIST

### Required Components

```
✅ Button (Primary, Secondary, Tertiary, Disabled)
✅ Input (Text, Email, Password, Number)
✅ Textarea
✅ Dropdown / Select
✅ Checkbox
✅ Radio Button
✅ Card / Panel
✅ Table
✅ Modal / Dialog
✅ Tab
✅ Alert / Toast
✅ Spinner / Loading
✅ Badge
✅ Pagination
✅ Breadcrumb
✅ Top Navigation
✅ Sidebar
✅ Avatar
✅ Image with border
✅ Divider / Separator
```

### Optional Components

```
⭕ Tooltip (if needed, gray background)
⭕ Popover (same styling as modal)
⭕ Datepicker (simple, minimal)
⭕ Slider (minimal styling)
⭕ Tag (pill-style, gray border)
⭕ Chip (small tag/pill)
```

---

## 11. DO's AND DON'Ts SUMMARY

### DO ✅

```
✅ Use font weight for hierarchy
✅ Use size variation (14px vs 12px)
✅ Use spacing for grouping
✅ Use line-height for breathing room
✅ Use black borders on focus
✅ Use very light gray for borders (#E5E5E5)
✅ Use grayscale only (#000, #333, #666, #888, #CCC, #FFF)
✅ Keep corners minimal (2px max)
✅ Keep padding/margin consistent
✅ Use semantic HTML
✅ Make text scannable
✅ Reduce cognitive load
✅ Tool-first mentality
✅ Clarity over everything
```

### DON'T ❌

```
❌ Use color contrast (no color hierarchy)
❌ Use gradients
❌ Use shadows (ever)
❌ Use rounded corners > 2px
❌ Use neon colors
❌ Use brand colors
❌ Use multiple color palettes
❌ Use animations on hover
❌ Use emojis
❌ Use icons everywhere
❌ Use serif fonts
❌ Use script fonts
❌ Use condensed fonts
❌ Use line-height < 1.4
❌ Use sticky navigation
❌ Use background color for emphasis
❌ Use multiple fonts
❌ Use hover animations
❌ Use transitions > 200ms (if any)
```

---

## 12. FIGMA SETUP GUIDE

### File Structure

```
GYMER-VIET-UI /
├─ 🎨 Design System
│  ├─ Colors
│  ├─ Typography
│  ├─ Spacing
│  ├─ Icons (if any)
│  └─ Components (library)
│
├─ 📱 Pages
│  ├─ Authentication
│  │  ├─ Sign Up
│  │  └─ Sign In
│  ├─ Trainer Discovery
│  │  ├─ Browse
│  │  └─ Profile
│  ├─ Trainer Dashboard
│  │  ├─ Overview
│  │  └─ Profile Edit
│  ├─ Athlete Dashboard
│  │  ├─ My Workouts
│  │  └─ Progress
│  └─ Admin
│     └─ Field Manager
│
└─ 🔧 Wireframes (if needed)
```

### Components Library

```
Button/
├─ Primary
├─ Secondary
├─ Tertiary
├─ Disabled
└─ Sizes

Input/
├─ Text
├─ Email
├─ Password
├─ Focused
├─ Error
└─ Disabled

Card/
├─ Default
├─ With Header
└─ With Footer

And so on...
```

---

## 13. IMPLEMENTATION NOTES

### CSS Architecture

```
Use utility-first approach (Tailwind-compatible):

.text-primary    { color: #000000; font-weight: 600; }
.text-secondary  { color: #666666; font-weight: 400; }
.text-tertiary   { color: #888888; font-weight: 400; }
.text-small      { font-size: 12px; }
.text-tiny       { font-size: 11px; }

.bg-primary      { background: #FFFFFF; }
.bg-light        { background: #F5F5F5; }

.border-light    { border: 1px #E5E5E5; }
.border-dark     { border: 1px #000000; }

.p-xs            { padding: 8px; }
.p-sm            { padding: 12px; }
.p-md            { padding: 16px; }
.p-lg            { padding: 24px; }

.gap-xs          { gap: 8px; }
.gap-sm          { gap: 12px; }
.gap-md          { gap: 16px; }
.gap-lg          { gap: 24px; }

.rounded-none    { border-radius: 0; }
.rounded-xs      { border-radius: 2px; }
.rounded-sm      { border-radius: 4px; } /* don't use */
```

### React Component Pattern

```typescript
// Button component example
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  disabled,
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={`
        btn-${variant}
        btn-${size}
        ${disabled ? 'btn-disabled' : ''}
      `}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

---

## 14. DESIGN TOKENS (JSON)

```json
{
  "colors": {
    "white": "#FFFFFF",
    "black": "#000000",
    "gray-light": "#F5F5F5",
    "gray-border": "#E5E5E5",
    "gray-primary": "#666666",
    "gray-secondary": "#888888",
    "gray-disabled": "#CCCCCC",
    "gray-placeholder": "#AAAAAA"
  },
  "typography": {
    "family": "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    "sizes": {
      "h1": { "size": "28px", "weight": 600, "lineHeight": 1.4 },
      "h2": { "size": "20px", "weight": 600, "lineHeight": 1.4 },
      "h3": { "size": "16px", "weight": 600, "lineHeight": 1.4 },
      "body": { "size": "14px", "weight": 400, "lineHeight": 1.6 },
      "small": { "size": "12px", "weight": 400, "lineHeight": 1.5 },
      "tiny": { "size": "11px", "weight": 400, "lineHeight": 1.4 }
    }
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "12px",
    "lg": "16px",
    "xl": "24px",
    "2xl": "32px",
    "3xl": "48px",
    "4xl": "64px"
  },
  "border": {
    "radius": "2px",
    "width": "1px",
    "color": "#E5E5E5"
  },
  "transitions": {
    "fast": "150ms",
    "normal": "200ms",
    "slow": "300ms"
  }
}
```

---

## FINAL CHECKLIST

- [ ] No gradients anywhere
- [ ] No shadows anywhere
- [ ] No rounded corners > 2px
- [ ] No neon colors
- [ ] No brand colors
- [ ] Grayscale only
- [ ] Font weight for hierarchy
- [ ] 1.6 line-height for body
- [ ] Consistent spacing (8px grid)
- [ ] Black on focus, gray borders
- [ ] Tool-first mentality
- [ ] Scannable text
- [ ] No cognitive overload
- [ ] Responsive design
- [ ] Accessibility (AA standard)
- [ ] Semantic HTML
- [ ] Clear hierarchy
- [ ] Consistent components

---

**This is minimal, clean, dev-friendly UI.**
**No distractions. Users know what they're doing.**
**It's a tool, not marketing.** 🎯
