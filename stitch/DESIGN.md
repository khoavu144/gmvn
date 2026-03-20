# Design System Strategy: The Kinetic Minimalist

## 1. Overview & Creative North Star
The "Kinetic Minimalist" is our creative north star. In the high-performance fitness world, clutter is the enemy of focus. This design system moves away from the "neon-and-dark-mode" fitness clichés, opting instead for a high-end editorial feel—think premium athletic journals and boutique performance labs. 

We break the "template" look by utilizing wide, breathable margins and intentional asymmetry. Components are not merely "placed"; they are choreographed. We prioritize white space as a functional element, using it to drive the eye toward key performance metrics and calls to action. The result is a UI that feels light, fast, and authoritative.

---

## 2. Colors & Surface Philosophy
The palette is built on a foundation of "Optical Whites" and "Deep Neutrals," allowing the user’s progress and photography to provide the energy.

### Tonal Hierarchy
- **Page Background (`background`):** `#F9F9F9`. Use this as the canvas for the entire experience.
- **Surface (`surface_container_lowest`):** `#FFFFFF`. Reserved for primary interactive cards and content blocks.
- **Muted Surface (`surface_container_low`):** `#F4F4F4`. Used for structural grouping or "sunken" secondary content.

### The "No-Line" Rule
To maintain an editorial aesthetic, **1px solid borders for sectioning are strictly prohibited.** Boundaries must be defined through color shifts. A `#FFFFFF` card should sit on a `#F9F9F9` background. If secondary depth is needed, use the `#F4F4F4` muted tone to nest elements.

### Signature Textures & Glassmorphism
- **Floating Elements:** For mobile navigation or sticky headers, use a backdrop-blur (12px–20px) with a semi-transparent `#FFFFFFCC`.
- **Primary CTAs:** To add "soul," use a subtle linear gradient on primary buttons: `linear-gradient(180deg, #5F5E5E 0%, #403F3F 100%)`. This creates a tactile, pressed-steel feel rather than a flat digital block.

---

## 3. Typography: The Lexend Scale
Lexend was designed to reduce visual noise. We use it with varying weights to create a "Display-First" hierarchy.

- **Display (Display-LG/MD):** 3.5rem to 2.75rem. Use `font-weight: 600`. Tighten letter-spacing to `-0.02em` for a bold, athletic headline feel.
- **Headlines (Headline-SM):** 1.5rem. The "workhorse" for section titles. Always `#0A0A0A`.
- **Body (Body-MD):** 0.875rem. Use `#666666` for long-form text to reduce eye strain.
- **Labels (Label-MD/SM):** 0.75rem to 0.68rem. Use `font-weight: 500` and uppercase for category tags to provide a technical, data-driven look.

---

## 4. Elevation & Depth
We eschew traditional drop shadows in favor of **Tonal Layering** and **Ambient Light.**

- **The Layering Principle:** Depth is achieved by stacking. A `#FFFFFF` card on a `#F9F9F9` background provides enough contrast for the human eye without artificial shadows.
- **Ambient Shadows (`shadow-card`):** When true elevation is needed (e.g., a floating Action Button), use: `0 1px 3px rgba(0,0,0,0.06)`. The shadow must feel like a natural consequence of light, not a glow.
- **The "Ghost Border":** If accessibility requires a container edge (e.g., in high-glare outdoor environments), use the `outline_variant` (#ADB3B4) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons & Interaction
- **Primary:** High-contrast (`on_primary` text on `primary` background). Radius: `8px (default)`.
- **Secondary:** Use `surface_container_low` (#F4F4F4) with `primary` text. This avoids the "heavy" feeling of multiple dark buttons.
- **Pills/Badges:** Use `xl` (16px) or `full` (9999px) radius. For status badges, use the semantic colors (Success, Warning, Error) at 10% opacity for the background, with 100% opacity for the text.

### Data & Stat Values
- **The "Hero Metric":** Stat values (e.g., "120+ bpm") should use `Headline-LG` or `Display-SM` in `primary` (#0A0A0A).
- **Sub-label:** Use `Label-MD` in `muted` (#999999). Keep them vertically stacked with a `spacing-1` (0.25rem) gap.

### Cards & Lists
- **The "No Divider" Rule:** Never use `<hr>` tags or border-bottoms to separate list items. Use `spacing-4` (1rem) or `spacing-5` (1.25rem) of vertical white space.
- **Padding:** Internal card padding should never be less than `spacing-5` (1.25rem) to maintain the premium, breathable feel.

### Bottom Navigation (Mobile)
- **Style:** A floating frosted-glass bar (`#FFFFFFCC` with backdrop-blur).
- **Icons:** 24px stroke-based icons. The active state should use a subtle dot indicator below the icon rather than a heavy background fill.

---

## 6. Do's and Don'ts

### Do
- **Do** use `Lexend Light` for secondary body text to enhance the "luxury fitness" aesthetic.
- **Do** leverage the `Radius-LG` (12px) for large content blocks to soften the "industrial" feel of fitness data.
- **Do** use "Optical Alignment." Sometimes a button needs to be 1px higher to *look* centered with Lexend's unique geometry.

### Don't
- **Don't** use 100% black (#000000). Use the Primary Text (#0A0A0A) to keep the UI feeling "inked" rather than "digital."
- **Don't** use shadows on top of shadows. If a card has a shadow, the elements inside it must be flat, relying on tonal shifts.
- **Don't** crowd the stats. Fitness is about clarity; give every number room to breathe.