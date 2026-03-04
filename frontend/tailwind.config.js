/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
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
                // Remove all other shadows completely
                sm: "none",
                md: "none",
                lg: "none",
                xl: "none",
                "2xl": "none",
                inner: "none",
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
