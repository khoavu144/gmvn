# Design System Specification: The Performance Dossier

## 1. Overview & Creative North Star
This design system is built to transform fitness data into a high-end, editorial experience. We are moving away from the "generic dashboard" aesthetic toward a **"Performance Dossier"**—a visual language that feels as precise as a professional athlete’s training regimen and as premium as a luxury lifestyle magazine.

The Creative North Star is **"Athletic Sophistication."** We achieve this through:
*   **Intentional Asymmetry:** Breaking the rigid grid by using varying card heights and offset typography to guide the eye.
*   **Tonal Depth:** Replacing harsh structural lines with soft shifts in background color.
*   **High-Contrast Typography:** Utilizing the wide scale of Manrope to create clear, authoritative hierarchies that feel curated, not automated.

---

## 2. Colors: Tonal Architecture
The palette is rooted in deep, authoritative navies and clean, clinical whites. The purple accents serve as a "kinetic energy" color, reserved strictly for progress, achievement, and action.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. Boundaries must be defined solely through background color shifts. 
*   **Example:** A `surface-container-lowest` card sitting on a `surface-container-low` section. The human eye identifies the change in value as a boundary, creating a cleaner, more sophisticated interface.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to create depth:
1.  **Base Layer:** `surface` (#f7f9fb) – The canvas.
2.  **Section Layer:** `surface-container-low` (#f2f4f6) – To grouping large content blocks.
3.  **Component Layer:** `surface-container-lowest` (#ffffff) – For interactive cards and primary modules.

### The "Glass & Gradient" Rule
To elevate the "sporty" aesthetic, use Glassmorphism for floating elements (like sticky headers or profile overlays). Apply `surface-container-highest` with 70% opacity and a 12px backdrop-blur. 
For primary CTAs, utilize a subtle linear gradient from `primary` (#080c1e) to `primary_container` (#1e2235) at a 135-degree angle. This adds a "visual soul" that flat color cannot replicate.

---

## 3. Typography: Editorial Authority
We use **Manrope** exclusively. Its geometric construction bridges the gap between technical precision and human readability.

*   **Display (lg/md):** Reserved for high-impact stats (e.g., "94% Success Rate"). Use tight letter-spacing (-0.02em) to give it a "technical" feel.
*   **Headline (lg/md):** Used for section titles like "Professional Skills." These should feel like magazine headers.
*   **Title (sm/md):** Used for card headings. Ensure high contrast against body text by using a heavier weight (SemiBold/Bold).
*   **Body (md/lg):** The workhorse. Maintain a generous line height (1.5) to ensure readability during active use.
*   **Label (sm/md):** Use for metadata and micro-copy. Always in `on_surface_variant` (#46464c) to keep it secondary in the visual hierarchy.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are often a crutch for poor layout. In this system, depth is achieved primarily through **Tonal Layering.**

### The Layering Principle
*   **Stacking:** A white card (`surface-container-lowest`) placed on a light gray background (`surface-container-low`) creates a natural, soft lift.
*   **Ambient Shadows:** When a floating effect is required (e.g., for a hovered card), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(8, 12, 30, 0.06);`. Note the use of the `primary` color in the shadow tint—never use pure black.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., input fields), use a "Ghost Border": the `outline_variant` token at **15% opacity**. 100% opaque borders are strictly forbidden.

### Glassmorphism & Depth
For the trainer’s profile header or navigation elements, use semi-transparent surfaces to allow background colors to bleed through. This makes the layout feel integrated and modern rather than "pasted on."

---

## 5. Components

### Cards & Lists
*   **Rule:** Forbid divider lines.
*   **Style:** Use `roundedness-xl` (1.5rem) for main cards. Separate list items using vertical white space (Spacing 4 or 6) or a `surface-container-highest` background on hover.

### Progress Bars
*   **Aesthetic:** Modern and Sporty.
*   **Colors:** Background is `surface-container-high`, the fill is `on_tertiary_container` (vibrant purple).
*   **Shape:** Use `roundedness-full` for both the container and the track.

### Buttons
*   **Primary:** Gradient (Primary to Primary-Container), `roundedness-full`, `spacing-10` horizontal padding.
*   **Secondary:** `surface-container-highest` background, no border, `on_surface` text.
*   **States:** On hover, primary buttons should slightly increase their shadow spread (Ambient Shadow); secondary buttons should shift to a slightly darker `surface-dim`.

### Input Fields
*   **Style:** `surface-container-low` background, `roundedness-md`. 
*   **Interactions:** On focus, the background shifts to `surface-container-lowest` with a Ghost Border of the `primary` color.

### Performance Chips
*   **Style:** `primary_fixed` background with `on_primary_fixed` text.
*   **Usage:** High-level tags (e.g., "Master Coach," "Calisthenics"). Use `roundedness-full` for a sleek, pill-shaped look.

---

## 6. Do’s and Don’ts

### Do:
*   **Use breathing room:** If a section feels crowded, increase the spacing from `8` (2rem) to `12` (3rem).
*   **Use semantic weight:** Make the most important number on the screen the largest (Display-lg).
*   **Embrace white space:** High-end design is defined by what you *don't* put on the screen.

### Don't:
*   **Don't use 1px dividers:** Use a 4px `surface-container` gap or a background shift instead.
*   **Don't use harsh corners:** Avoid `none` or `sm` roundedness unless it's for a very specific technical chart. Stick to `lg` and `xl`.
*   **Don't use standard shadows:** If the shadow looks "dirty," it’s too opaque. Keep it under 8% opacity.
*   **Don't mix fonts:** Stay strictly within the Manrope family to maintain the dossier’s clinical focus.

---
*Note: This design system is a living document. Every component should feel like a piece of high-performance equipment: purposeful, durable, and aesthetically superior.*