# EvolveNXT — Website Redesign PRD

**Owner:** Jonah (Content Intern)
**Updated:** 2026-07-02
**Direction:** "Interface Surfaces" (third full reset; boxes and line-art both retired)

---

## 1. Positioning

EvolveNXT is a premium **operating system for insurance distribution**: enterprise software
for carriers covering producer onboarding, contracting, hierarchy, incentive compensation,
producer portals, notifications, web enrollment, CRM, lead management, and reporting.

Quality bar: cinematic product-interface design, closer to a high-end product film /
premium VC site than any SaaS template.

## 2. Hard rules (accumulated across four rounds of client feedback)

- **No boxes:** no feature cards, stat cards, dashboards-as-widgets, glass-panel spam, icon grids.
- **No line-art:** no network webs, node maps, curves, timelines, polygon/diamond diagrams,
  or decorative SVG. Lines exist only as dividers, table rules, and tiny interface details.
- **No fake anything:** no invented metrics, dollar values, percentages, names, carriers,
  logos, testimonials, or $0 placeholders. Status words ("Signed", "In review") are allowed.
- No CSS gradients, no rounded corners, no green, no loud purple, no em-dashes.
- Every animation has a reduced-motion path; mobile is calm and un-pinned.

## 3. Visual system

- **Primitives:** layered operating-system "sheets" (hairline-bordered dark surfaces) built
  from typography: mono headers/tabs, thin table rows (`.irow`), status labels, group labels,
  nested indentation. Editorial columns, thin dividers, negative space everywhere else.
- **Palette:** near-black navy `#04070D` field, off-white `#F1F4F9`, slate inks, steel
  `#5E7CA8` rules, electric blue `#2160D8/#3D8BFD` actions, cyan `#7CC7FF` live labels.
- **Type:** Geist (tight-tracked display + body), Geist Mono (labels, tabs, statuses).

## 4. Homepage (four movements)

1. **Hero.** Copy left; a layered OS surface right: angled in perspective, cropped off the
   right viewport edge, three stacked sheets (reporting / onboarding workflow / portal
   activity trail). Motion: camera drift, a soft scanning light bar, rows gently activating,
   and a scroll pin where the headline lifts away while the surface settles.
2. **Lifecycle as a product story.** Pinned. Left: stage title + verbatim copy (Onboard →
   Contract → Appoint → Place → Enroll → Compensate → Report). Right: one "Distribution
   record" sheet whose interface state transforms per stage (workflow rows, agreements,
   LOB status rows, hierarchy indentation, enrollment activity, comp rule groups, reporting).
3. **Product console.** Left: vertical product list (5 real modules, verbatim copy).
   Right: one console sheet whose state changes on hover/click/arrow keys.
4. **Enterprise complexity + CTA.** Editorial split (sticky headline, three hairline text
   blocks), then a clean type-only CTA.

## 5. Implementation

Self-contained static site: `index.html`, `css/tokens.css`, `css/styles.css`, `js/main.js`.
No frameworks, no canvas, no decorative SVG. Pins disable under 1001px and reduced motion
(stacked lifecycle variant). Repo: github.com/jonahmeyuhas-web/EvolveNXT-Redesign.
