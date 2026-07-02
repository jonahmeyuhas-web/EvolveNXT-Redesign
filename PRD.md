# EvolveNXT — Website Redesign PRD

**Owner:** Jonah (Content Intern)
**Updated:** 2026-07-01
**Direction:** "Distribution OS" (full visual reset; two prior directions retired)

---

## 1. Positioning

EvolveNXT is a premium **operating system for insurance distribution**: enterprise software
that helps carriers manage producer onboarding, contracting, hierarchy, incentive
compensation, producer portals, web enrollment, CRM, lead management, and reporting.

The site must feel sleek, modern, enterprise-grade, technical but not cold, and premium.
Quality bar: closer to Linear / Stripe / Apple / a premium VC site than a B2B SaaS template.

## 2. Hard rules

- **No CSS gradients.** Flat color fields; glow comes from light (box-shadow, canvas luminance).
- **No rounded corners.** `border-radius: 0` across the whole system.
- **No fake anything:** no invented metrics, dollar amounts, testimonials, client logos,
  awards, or placeholder $0 values. Status labels only ("Verified", "Active", "Complete").
- No green. Purple only as a rare accent; the site reads blue.
- No em-dashes in copy or code.
- Every animation has a `prefers-reduced-motion` path.

## 3. System

- **Palette:** deep navy `#05080F`–`#0E1A2E` field, off-white `#F2F5F9` text, slate grays,
  electric blue `#3D8BFD` / action blue `#2160D8`, soft cyan `#7CC7FF`, restrained violet
  `#8B7CF6` (canvas pulses only). Light editorial section on `#F3F5F8`.
- **Type:** Geist (display + body) with tight tracking; Geist Mono for uppercase eyebrow labels.
- **Surfaces:** sharp glass (translucent charcoal-blue + backdrop blur + 1px hairline).

## 4. Homepage (5 sections)

1. **Hero (scroll-driven).** Sticky 240vh stage. Canvas "distribution command center":
   layered network, thin connection lines with traveling light pulses, 7 producer-lifecycle
   nodes that come online as you scroll; panels parallax; subtle mouse drift. Copy:
   "The operating system for insurance distribution." + approved subline; CTAs
   "Request a demo" / "Explore the platform". Three sharp glass panels (Producer file /
   Hierarchy / Compensation) showing statuses only. A Higgsfield loop can layer in later.
2. **Distribution OS Flow (scroll-scrubbed).** Onboard → Contract → Appoint → Place →
   Enroll → Compensate → Report. Rail fills and nodes light with scroll (static reveal on mobile).
3. **Core Platform Modules.** 5 sharp glass cards (Onboarding, Incentive Comp, Portal &
   Notifications, Web Enrollment, CRM & Leads) with abstract animated UI previews on hover.
4. **Built for Insurance Complexity.** Light editorial break: lines of business, complex
   hierarchies, enterprise control, with minimal line diagrams.
5. **Final CTA.** Dark navy, low-opacity network canvas, "Modernize the way insurance
   distribution gets managed." + Request a demo.

Nav: transparent → glass on scroll. Logo / Platform / Products / Solutions / About / Contact / demo CTA.

## 5. Implementation

Self-contained static site: `index.html` + `css/tokens.css` + `css/styles.css` + `js/main.js`.
No frameworks. Canvas is DPR-capped (1.5), pauses offscreen and on hidden tab; scroll handlers
run through one rAF; pins disable under 1001px and under reduced motion.

Repo: github.com/jonahmeyuhas-web/EvolveNXT-Redesign (GitHub Pages ready).
