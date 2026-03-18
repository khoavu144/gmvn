# Frontend UI/UX 10-10 Plan for Coach Athlete Gym Detail Flows

## 1. Objective
Deliver a fully coherent, high-trust, conversion-oriented detail experience for coach, athlete, and gym surfaces by unifying route architecture, information hierarchy, CTA logic, interaction states, and responsive behavior.

## 2. Scope
- In scope: frontend detail and discovery-to-detail flows.
- In scope pages and routing surfaces:
  - `frontend/src/App.tsx`
  - `frontend/src/pages/Coaches.tsx`
  - `frontend/src/pages/CoachDetailPage.tsx`
  - `frontend/src/pages/ProfilePublic.tsx`
  - `frontend/src/pages/ProfileCV.tsx`
  - `frontend/src/pages/Gyms.tsx`
  - `frontend/src/pages/GymDetailPage.tsx`
- In scope shared UI and infra:
  - `frontend/src/components/Header.tsx`
  - `frontend/src/components/ErrorBoundary.tsx`
  - `frontend/src/services/api.ts`
  - `frontend/src/services/trainerService.ts`
  - `frontend/src/services/gymService.ts`
- Out of scope: backend schema redesign, payment domain redesign.

## 3. Definition of 10-10 for this scope
A release is 10-10 only when all criteria below are met.

### A. Route and IA coherence
- One canonical public route strategy for each entity type.
- Legacy routes redirect cleanly to canonical URLs.
- No duplicated page purpose where two pages present conflicting primary narratives for the same entity.

### B. Conversion logic coherence
- Primary and secondary CTAs are consistent by entity and user intent.
- CTA labels, order, and enabled states are deterministic across entry points.
- Message, subscription, and consultation actions never disappear silently; they degrade with explicit rationale.

### C. State-system quality
- Every detail page has standardized loading, empty, error, and retry behavior.
- Discovery pages and detail pages follow the same state semantics.
- No hard context loss on transient failures.

### D. Responsive and accessibility integrity
- Sticky and fixed elements do not obscure critical content or controls.
- Keyboard traversal is complete across nav chips, branch selectors, CTAs, and dialogs.
- Focus visibility and semantic heading hierarchy are consistent.

### E. UX consistency and trust
- Information hierarchy is stable across coach, athlete, and gym detail patterns.
- Similar sections use shared visual and interaction primitives.
- Canonical metadata matches displayed identity.

## 4. Current core tensions
1. Coach detail is split across multiple non-equivalent surfaces, creating trust and orientation friction.
2. CTA hierarchy differs by page variant, reducing conversion predictability.
3. Athlete detail is conceptually requested but not explicitly modeled as a first-class frontend detail paradigm.
4. Gym detail has rich depth but wayfinding can become ambiguous after branch switching and deep scrolling.

## 5. Delivery waves

## Wave 1: Canonical route architecture and page-role unification
### Goals
- Define single canonical routes for coach, athlete, and gym detail.
- Preserve backward compatibility via redirects.
- Assign clear page purpose per route.

### Actions
- Audit all `Link` targets from discovery pages and similar-card modules.
- Choose canonical route per entity and implement redirect map in router.
- Consolidate overlapping coach detail responsibilities between `CoachDetailPage`, `ProfilePublic`, and `ProfileCV`.
- Implement dedicated athlete public detail template as a first-class route surface in Wave 1.
- Define athlete-specific page purpose, section structure, and canonical route mapping.
- Add redirect rules so any legacy athlete detail entry resolves to the new canonical athlete template.

### Exit criteria
- Every coach card resolves to canonical route strategy.
- Route fallback and redirects are deterministic.
- Product documentation records page-role ownership.

## Wave 2: CTA framework normalization
### Goals
- Standardize action hierarchy and logic across all detail surfaces.

### Actions
- Define CTA matrix by page type and user state:
  - Not authenticated
  - Authenticated viewer
  - Owner/self profile
  - Role-constrained states
- Normalize CTA labels and order across coach-related pages.
- Make CTA states explicit: enabled, disabled with explanation, hidden by policy.
- Align mobile fixed CTA bars with desktop primary action hierarchy.

### Exit criteria
- CTA order and meaning are invariant for the same intent.
- No contradictory action paths across coach profile variants.

## Wave 3: Unified loading empty error retry system
### Goals
- Remove uneven state behavior between discovery and detail pages.

### Actions
- Define reusable state primitives for detail sections.
- Apply consistent skeleton structure and retry affordances.
- Ensure branch-switch, slug-fallback, and related-content fetches never degrade to silent gaps.
- Align error copy and actions with recovery pathways.

### Exit criteria
- All in-scope pages satisfy state consistency checklist.
- Recovery actions always preserve user context where possible.

## Wave 4: Responsive and accessibility hardening
### Goals
- Guarantee robust interaction under sticky/fixed navigation and deep content stacks.

### Actions
- Validate sticky headers, sticky sidebars, and fixed bottom CTAs across breakpoints.
- Ensure branch selector and in-page section nav are keyboard operable.
- Add visible focus treatment parity for links, chips, and CTA buttons.
- Validate semantic landmarks and heading progression.

### Exit criteria
- No viewport-specific blocking interactions.
- Keyboard-only pass for all critical flows.

## Wave 5: Design-system normalization and component extraction
### Goals
- Reduce UI drift and duplicated logic across profile detail variants.

### Actions
- Extract reusable section components:
  - Hero identity block
  - Trust metrics block
  - Pricing and package block
  - Similar profile block
  - FAQ block
- Normalize spacing, section rhythm, and typography hierarchy through shared tokens/utilities.
- Remove repeated one-off section implementations where behavior should be common.

### Exit criteria
- Shared sections are composed from reusable components.
- Visual and interaction consistency improves across coach and gym details.

## Wave 6: Validation matrix and release gates for 10-10
### Goals
- Enforce UX quality with explicit acceptance checks.

### Actions
- Create regression matrix covering:
  - Discovery to detail navigation
  - Deep-link entry
  - CTA click-through logic
  - Mobile fixed action behavior
  - Branch switching context retention
- Add route and CTA consistency checks to PR checklist.
- Capture canonical screenshots for visual regression references.

### Exit criteria
- All matrix scenarios pass.
- All 10-10 criteria in section 3 are verified and signed off.

## 6. Detailed implementation backlog mapped to files

## A. Routing and navigation
- `frontend/src/App.tsx`
  - Implement canonicalization redirects and fallback behavior.
- `frontend/src/pages/Coaches.tsx`
  - Normalize detail target links to canonical strategy.
- `frontend/src/pages/Gyms.tsx`
  - Ensure gym detail links preserve context and canonical shape.
- `frontend/src/components/Header.tsx`
  - Align top-level discovery entry points with canonical IA.

## B. Coach detail surfaces
- `frontend/src/pages/CoachDetailPage.tsx`
  - Keep or reduce to role-specific wrapper per page-role decision.
- `frontend/src/pages/ProfilePublic.tsx`
  - Consolidate public-summary responsibilities.
- `frontend/src/pages/ProfileCV.tsx`
  - Consolidate premium-longform responsibilities.

## C. Gym detail surface
- `frontend/src/pages/GymDetailPage.tsx`
  - Branch-aware wayfinding, CTA contextualization, and section-nav resilience.

## D. Shared state and interaction quality
- `frontend/src/components/ErrorBoundary.tsx`
  - Ensure safe retry semantics for detail route failures.
- `frontend/src/services/api.ts`
  - Preserve context on recoverable request failures.
- `frontend/src/services/trainerService.ts`
- `frontend/src/services/gymService.ts`
  - Normalize payload handling and null-safe data contract usage.

## 7. Acceptance checklist
- [ ] Canonical route map approved and implemented.
- [ ] No conflicting page purposes across coach detail surfaces.
- [ ] CTA matrix implemented and validated for all user states.
- [ ] Loading empty error retry patterns consistent in all in-scope pages.
- [ ] Mobile sticky and fixed controls do not block content or actions.
- [ ] Keyboard navigation and focus visibility validated for critical flows.
- [ ] Reusable detail section components extracted and adopted.
- [ ] Regression matrix passes for discovery to detail and deep links.
- [ ] PR checklist updated with route and CTA consistency gates.
- [ ] UX signoff confirms all section 3 criteria achieved.

## 8. Handoff notes for Code mode
- Implement wave by wave, merging only when each wave exit criteria is met.
- Prefer additive refactors with route redirects before removing legacy paths.
- Keep each pull request scoped to one wave objective to preserve review clarity.