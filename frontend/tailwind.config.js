/** @type {import('tailwindcss').Config} */
// GYMERVIET tailwind.config.js v2.1
// Design: Black/White thuần · Roboto font family · 8px radius · Dark mode media

export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

    // ─── DARK MODE: disabled (flat white UI) ───────────────────────────
    darkMode: 'class', // requires .dark class on <html> — not used = always light

    theme: {
        extend: {

            // ─── COLORS ───────────────────────────────────────────────────────
            // Black/White thuần (Q1) — không accent color
            colors: {
                black: '#0A0A0A',   // Softer than pure #000
                white: '#FAFAFA',   // Softer than pure #FFF

                gray: {
                    50: '#F9F9F9',
                    100: '#F4F4F4',
                    200: '#E5E5E5',
                    300: '#CACACA',
                    400: '#AAAAAA',
                    500: '#888888',
                    600: '#666666',
                    700: '#444444',
                    800: '#2A2A2A',
                    900: '#141414',
                    950: '#0A0A0A',
                },

                // Semantic — minimal palette
                success: { DEFAULT: '#16A34A', light: '#DCFCE7', dark: '#15803D' },
                warning: { DEFAULT: '#D97706', light: '#FEF3C7', dark: '#B45309' },
                error: { DEFAULT: '#DC2626', light: '#FEE2E2', dark: '#B91C1C' },
                info: { DEFAULT: '#2563EB', light: '#DBEAFE', dark: '#1D4ED8' },
            },

            // ─── TYPOGRAPHY — Roboto family ───────────────────────────────────
            fontFamily: {
                sans: [
                    'Roboto',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    '"Segoe UI"',
                    'sans-serif',
                ],
                condensed: [
                    '"Roboto Condensed"',
                    'Roboto',
                    'sans-serif',
                ],
                mono: ['"Courier New"', 'Courier', 'monospace'],
            },

            fontSize: {
                // Display
                'display': ['48px', { lineHeight: '1.05', fontWeight: '800', letterSpacing: '-0.025em' }],
                'display-sm': ['36px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],

                // Headings
                'h1': ['28px', { lineHeight: '1.3', fontWeight: '700', letterSpacing: '-0.015em' }],
                'h2': ['20px', { lineHeight: '1.35', fontWeight: '600', letterSpacing: '-0.01em' }],
                'h3': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
                'h4': ['14px', { lineHeight: '1.4', fontWeight: '600' }],

                // Body
                'body-lg': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
                'body': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
                'body-sm': ['13px', { lineHeight: '1.5', fontWeight: '400' }],

                // Utility
                'caption': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
                'overline': ['11px', { lineHeight: '1.4', fontWeight: '700', letterSpacing: '0.08em' }],
            },

            // ─── BORDER RADIUS — 8px (Q6) ────────────────────────────────────
            borderRadius: {
                'none': '0',
                'sm': '4px',
                DEFAULT: '8px',   // rounded — default cho inputs, badges
                'md': '8px',    // rounded-md — default cho cards
                'lg': '8px',   // rounded-lg — standardized to 8px
                'xl': '16px',
                '2xl': '20px',
                'full': '9999px', // pills, avatars
            },

            // ─── SPACING (8px base unit) ─────────────────────────────────────
            spacing: {
                '0': '0', '0.5': '2px', '1': '4px', '1.5': '6px',
                '2': '8px', '2.5': '10px', '3': '12px', '3.5': '14px',
                '4': '16px', '5': '20px', '6': '24px', '7': '28px',
                '8': '32px', '9': '36px', '10': '40px', '11': '44px',
                '12': '48px', '14': '56px', '16': '64px', '18': '72px',
                '20': '80px', '24': '96px', '28': '112px', '32': '128px',
                '36': '144px', '40': '160px', '48': '192px', '56': '224px',
                '64': '256px', '72': '288px', '80': '320px', '96': '384px',
            },

            // ─── SHADOWS (subtle — không dùng flat hoàn toàn) ────────────────
            boxShadow: {
                'none': 'none',
                'sm': '0 1px 2px rgba(0,0,0,0.05)',
                'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                DEFAULT: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
                'md': '0 4px 12px rgba(0,0,0,0.08)',
                'lg': '0 8px 24px rgba(0,0,0,0.10)',
                'xl': '0 16px 48px rgba(0,0,0,0.12)',
                'modal': '0 20px 60px rgba(0,0,0,0.14)',
                // Focus ring — black
                'focus': '0 0 0 3px rgba(10,10,10,0.15)',
                'focus-dark': '0 0 0 3px rgba(240,240,240,0.25)',
            },

            // ─── NO ANIMATION (Q9) ───────────────────────────────────────────
            // Chỉ transition-colors và transition-opacity — không keyframe
            animation: {
                // Skeleton shimmer là exception duy nhất
                'shimmer': 'shimmer 1.5s infinite',
            },
            keyframes: {
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
            // Tất cả transitions: duration 150ms, no bounce
            transitionDuration: {
                DEFAULT: '150ms',
                '75': '75ms',
                '100': '100ms',
                '150': '150ms',
                '200': '200ms',
            },
            transitionTimingFunction: {
                DEFAULT: 'ease',
                linear: 'linear',
                in: 'ease-in',
                out: 'ease-out',
                'in-out': 'ease-in-out',
                // KHÔNG có cubic-bezier bounce hay spring
            },

            // ─── Z-INDEX ─────────────────────────────────────────────────────
            zIndex: {
                'auto': 'auto', '0': '0', '10': '10', '20': '20', '30': '30',
                '40': '40', '50': '50',
                'dropdown': '100',
                'header': '300',
                'modal': '400',
                'toast': '500',
            },

            // ─── SCREENS ─────────────────────────────────────────────────────
            screens: {
                'xs': '375px',
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
                'xl': '1280px',
                '2xl': '1536px',
            },

            // ─── MAX WIDTH ────────────────────────────────────────────────────
            maxWidth: {
                'xs': '320px',
                'sm': '480px',
                'md': '640px',
                'lg': '768px',
                'xl': '1024px',
                '2xl': '1280px',
                '3xl': '1440px',
                'content': '680px',  // Article/form
                'page': '1280px', // Standard page
            },

            // ─── HEIGHT UTILITIES ─────────────────────────────────────────────
            height: {
                'header': '56px',  // Header height
                'bottom-nav': '64px',  // Mobile bottom nav
                'touch': '44px',  // Min tap target
            },

            // ─── BACKDROP ─────────────────────────────────────────────────────
            backdropBlur: {
                'xs': '4px',
                'sm': '8px',
                'md': '12px',  // Header backdrop
                'lg': '16px',
            },
        },
    },

    plugins: [],

    // Safelist dynamic classes
    safelist: [
        { pattern: /^(bg|text|border|ring)-(gray)-(50|100|200|300|400|500|600|700|800|900|950)$/ },
        { pattern: /^(bg|text|border)-(success|warning|error|info)(-light|-dark)?$/ },
    ],
}