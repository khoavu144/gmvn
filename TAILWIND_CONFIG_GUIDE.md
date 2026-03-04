# 🎨 TAILWIND CONFIG - GYMER VIỆT DEV MINIMAL UI

```javascript
// tailwind.config.js

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    extend: {
      // COLOR PALETTE - GRAYSCALE ONLY
      colors: {
        // Grayscale - Primary
        white: "#FFFFFF",
        black: "#000000",
        
        // Grayscale - Grays
        gray: {
          50: "#F9F9F9",
          100: "#F5F5F5",  // light background, hover
          200: "#E5E5E5",  // borders
          300: "#D3D3D3",  // disabled items
          400: "#CCCCCC",  // disabled text
          500: "#999999",  // placeholder, icons
          600: "#888888",  // helper text, secondary
          700: "#666666",  // body text (primary gray)
          800: "#333333",  // error state (dark gray)
          900: "#1A1A1A",  // very dark (rare)
        },
      },
      
      // TYPOGRAPHY
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          '"Helvetica Neue"',
          "sans-serif",
        ],
        mono: [
          '"Monaco"',
          '"Courier New"',
          "monospace",
        ],
      },
      
      fontSize: {
        // Page Title
        h1: ["28px", { lineHeight: "1.4", fontWeight: "600" }],
        
        // Section Title
        h2: ["20px", { lineHeight: "1.4", fontWeight: "600" }],
        
        // Subsection
        h3: ["16px", { lineHeight: "1.4", fontWeight: "600" }],
        
        // Body text (default)
        base: ["14px", { lineHeight: "1.6" }],
        
        // Small text
        sm: ["12px", { lineHeight: "1.5" }],
        
        // Caption
        xs: ["11px", { lineHeight: "1.4" }],
        
        // Code
        code: ["12px", { lineHeight: "1.5", fontFamily: "monospace" }],
      },
      
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      
      // SPACING (8px base unit)
      spacing: {
        0: "0",
        1: "4px",    // xs
        2: "8px",    // sm
        3: "12px",   // md
        4: "16px",   // lg
        6: "24px",   // xl
        8: "32px",   // 2xl
        12: "48px",  // 3xl
        16: "64px",  // 4xl
      },
      
      // BORDERS
      borderRadius: {
        none: "0",
        xs: "2px",   // default
        sm: "4px",   // DON'T use > 2px in general
      },
      
      borderWidth: {
        DEFAULT: "1px",
        0: "0",
        1: "1px",
        2: "2px",    // focus state
      },
      
      // SHADOWS - NONE (we don't use shadows)
      boxShadow: {
        none: "none",
      },
      
      // LINE HEIGHT - for breathing room
      lineHeight: {
        tight: "1.2",
        normal: "1.4",     // headings
        relaxed: "1.5",    // small text
        loose: "1.6",      // body text
      },
      
      // TRANSITIONS - minimal, fast
      transitionDuration: {
        DEFAULT: "200ms",
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
      },
      
      // OPACITY - for subtle effects
      opacity: {
        0: "0",
        10: "0.1",
        20: "0.2",
        30: "0.3",
        40: "0.4",
        50: "0.5",
        60: "0.6",
        70: "0.7",
        80: "0.8",
        90: "0.9",
        100: "1",
      },
      
      // Z-INDEX - for layering
      zIndex: {
        auto: "auto",
        0: "0",
        10: "10",
        20: "20",
        30: "30",
        40: "40",    // sidebar
        50: "50",    // top nav
        100: "100",  // dropdown
        1000: "1000",  // modal overlay
        1001: "1001",  // modal content
      },
    },
  },
  
  plugins: [],
  
  // Safelist for dynamic classes (if using variants)
  safelist: [
    {
      pattern: /^(bg|text|border)-(white|black|gray-\d{1,3})$/,
    },
    {
      pattern: /^(p|m|gap)-(0|1|2|3|4|6|8|12|16)$/,
    },
  ],
}
```

---

## UTILITY CLASSES TO USE

```css
/* Text Colors */
.text-black        /* Pure black #000 */
.text-gray-700     /* Primary body #666 */
.text-gray-600     /* Secondary #888 */
.text-gray-500     /* Placeholder #999 */

/* Background Colors */
.bg-white          /* #FFFFFF */
.bg-gray-100       /* #F5F5F5 - hover, light bg */

/* Borders */
.border-gray-200   /* #E5E5E5 - light borders */
.border-black      /* #000000 - focus state */

/* Spacing */
.p-4               /* 16px padding */
.m-4               /* 16px margin */
.gap-4             /* 16px gap */

/* Typography */
.text-h1           /* 28px 600 1.4 */
.text-h2           /* 20px 600 1.4 */
.text-base         /* 14px 400 1.6 */
.text-sm           /* 12px 400 1.5 */

/* Font Weight */
.font-normal       /* 400 */
.font-semibold     /* 600 */

/* Border Radius */
.rounded-none      /* 0 */
.rounded-xs        /* 2px */

/* No Shadows */
.shadow-none       /* never use shadow-* classes */

/* Opacity */
.opacity-30        /* for very subtle effects */

/* Transitions */
.transition        /* default 200ms */
.duration-fast     /* 150ms */
```

---

## COMPONENT UTILITIES

### Button

```html
<!-- Primary Button -->
<button class="
  px-4 py-2.5
  bg-black text-white
  border border-black
  rounded-xs
  font-medium text-base
  transition duration-normal
  hover:bg-gray-900
  focus:outline-none focus:ring-2 focus:ring-black
  disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
">
  Button Text
</button>

<!-- Secondary Button -->
<button class="
  px-4 py-2.5
  bg-white text-black
  border border-gray-200
  rounded-xs
  font-medium text-base
  transition duration-normal
  hover:bg-gray-100
  focus:outline-none focus:ring-2 focus:ring-black
  disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
">
  Button Text
</button>

<!-- Tertiary Button -->
<button class="
  px-4 py-2.5
  bg-transparent text-gray-700
  border-none
  rounded-xs
  font-normal text-base
  transition duration-normal
  hover:text-black hover:bg-gray-100
  focus:outline-none focus:ring-2 focus:ring-black
  disabled:text-gray-400 disabled:cursor-not-allowed
">
  Button Text
</button>
```

### Input Field

```html
<div class="flex flex-col gap-2">
  <!-- Label -->
  <label class="text-sm font-medium text-black">
    Field Label
  </label>
  
  <!-- Input -->
  <input
    type="text"
    placeholder="Placeholder text"
    class="
      w-full
      px-3 py-2.5
      bg-white
      border border-gray-200
      rounded-xs
      text-base text-black
      placeholder:text-gray-500
      font-normal
      transition duration-normal
      focus:outline-none focus:border-black focus:ring-1 focus:ring-black
      disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200
      disabled:cursor-not-allowed
    "
  />
  
  <!-- Helper Text -->
  <p class="text-xs text-gray-600">
    Helper text or error message
  </p>
</div>
```

### Card

```html
<div class="
  bg-white
  border border-gray-200
  rounded-xs
  p-4 md:p-6
  hover:border-gray-300
  transition duration-normal
">
  <!-- Header -->
  <h3 class="text-base font-semibold text-black mb-4 pb-3 border-b border-gray-200">
    Card Title
  </h3>
  
  <!-- Body -->
  <p class="text-base text-gray-700 leading-relaxed mb-4">
    Card content goes here
  </p>
  
  <!-- Footer -->
  <div class="pt-3 border-t border-gray-200">
    <button class="text-sm font-medium text-black hover:text-gray-700">
      Action
    </button>
  </div>
</div>
```

### Table

```html
<div class="overflow-x-auto">
  <table class="w-full">
    <!-- Head -->
    <thead>
      <tr class="bg-gray-100 border-b border-gray-200">
        <th class="
          px-4 py-3
          text-left text-sm font-semibold text-black
          border-b border-gray-200
        ">
          Column Header
        </th>
        <th class="
          px-4 py-3
          text-left text-sm font-semibold text-black
          border-b border-gray-200
        ">
          Column Header
        </th>
      </tr>
    </thead>
    
    <!-- Body -->
    <tbody>
      <tr class="
        border-b border-gray-200
        hover:bg-gray-100
        transition duration-normal
      ">
        <td class="px-4 py-3 text-base text-gray-700">
          Cell content
        </td>
        <td class="px-4 py-3 text-base text-gray-700">
          Cell content
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Navigation Item (Active/Inactive)

```html
<!-- Inactive -->
<a href="#" class="
  block
  px-4 py-3
  text-base text-gray-700
  border-l-2 border-l-transparent
  hover:bg-gray-100 hover:text-black
  transition duration-normal
">
  Menu Item
</a>

<!-- Active -->
<a href="#" class="
  block
  px-4 py-3
  text-base text-black font-medium
  border-l-2 border-l-black
  bg-white
">
  Menu Item
</a>
```

---

## RESPONSIVE PREFIXES

```html
<!-- Mobile First - adjust upward -->

<!-- Font sizes smaller on mobile -->
<h1 class="text-2xl md:text-3xl lg:text-4xl">
  Responsive Title
</h1>

<!-- Padding tighter on mobile -->
<div class="p-2 md:p-4 lg:p-6">
  Responsive spacing
</div>

<!-- Grid changes -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  Grid items
</div>

<!-- Sidebar visible on desktop -->
<div class="flex flex-col lg:flex-row">
  <aside class="hidden lg:block w-64 bg-white border-r border-gray-200">
    Sidebar
  </aside>
  <main class="flex-1">
    Content
  </main>
</div>
```

---

## CUSTOM CSS (if needed)

```css
/* globals.css */

@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Custom utilities that Tailwind doesn't have */

@layer components {
  /* Text utility classes */
  .text-h1 {
    @apply text-2xl md:text-3xl font-semibold leading-snug text-black;
  }
  
  .text-h2 {
    @apply text-xl md:text-2xl font-semibold leading-snug text-black;
  }
  
  .text-h3 {
    @apply text-lg font-semibold leading-snug text-black;
  }
  
  .text-body {
    @apply text-base font-normal leading-relaxed text-gray-700;
  }
  
  .text-muted {
    @apply text-sm font-normal text-gray-600;
  }
  
  /* Button base styles */
  .btn-base {
    @apply inline-flex items-center justify-center
           px-4 py-2.5
           rounded-xs
           font-medium
           transition duration-normal
           focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-black
           disabled:opacity-50 disabled:cursor-not-allowed;
  }
  
  .btn-primary {
    @apply btn-base
           bg-black text-white
           border border-black
           hover:bg-gray-900;
  }
  
  .btn-secondary {
    @apply btn-base
           bg-white text-black
           border border-gray-200
           hover:bg-gray-100;
  }
  
  .btn-tertiary {
    @apply btn-base
           bg-transparent text-black
           border-none
           hover:bg-gray-100;
  }
  
  /* Form utilities */
  .form-input {
    @apply w-full
           px-3 py-2.5
           bg-white
           border border-gray-200
           rounded-xs
           text-base text-black
           font-normal
           placeholder:text-gray-500
           transition duration-normal
           focus:outline-none focus:border-black focus:ring-1 focus:ring-black
           disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed;
  }
  
  .form-label {
    @apply block text-sm font-medium text-black mb-2;
  }
  
  .form-helper {
    @apply text-xs text-gray-600 mt-1;
  }
  
  /* Card utilities */
  .card {
    @apply bg-white
           border border-gray-200
           rounded-xs
           p-4 md:p-6
           hover:border-gray-300
           transition duration-normal;
  }
  
  .card-header {
    @apply text-base font-semibold text-black
           mb-4 pb-3
           border-b border-gray-200;
  }
  
  .card-body {
    @apply text-base text-gray-700 leading-relaxed;
  }
  
  .card-footer {
    @apply pt-3 mt-4
           border-t border-gray-200;
  }
}

/* Animations - minimal */
@layer utilities {
  /* Fade in (used sparingly) */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  .animate-fade-in {
    animation: fadeIn 200ms ease-in-out;
  }
  
  /* Slide down (for dropdowns) */
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-slide-down {
    animation: slideDown 150ms ease-out;
  }
}
```

---

## USAGE EXAMPLES

### Page with Navigation

```jsx
export default function Page() {
  return (
    <div class="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav class="border-b border-gray-200 sticky top-0 z-50 bg-white">
        <div class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div class="flex items-center justify-between h-14">
            <h1 class="text-base font-semibold text-black">GYMERVIET</h1>
            <button class="px-4 py-2.5 bg-black text-white rounded-xs text-sm font-medium">
              Sign In
            </button>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main class="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <h1 class="text-3xl md:text-4xl font-semibold text-black mb-6">
          Page Title
        </h1>
        
        <p class="text-base text-gray-700 leading-relaxed mb-8 max-w-2xl">
          Page description goes here.
        </p>
        
        {/* Cards Grid */}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map(i => (
            <div class="card">
              <h3 class="card-header">Card {i}</h3>
              <p class="card-body">Card content</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
```

---

**This Tailwind config creates a minimal, dev-friendly design system.**
**No custom colors needed. Just utility classes.**
**Clear, scannable, tool-first.** 🎯
