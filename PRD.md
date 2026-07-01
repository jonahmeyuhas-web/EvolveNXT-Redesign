# EvolveNXT — Website Redesign PRD

**Owner:** Jonah (Content Intern)
**Date:** 2026-07-01
**Status:** Approved for build
**Scope of this phase:** New, fully-animated homepage (self-contained static site). Inner pages follow the same system in a later phase.

---

## 1. Goal & Success Criteria

Rebrand and redesign evolvenxt.com to feel **sleeker, more modern, and premium** — on par with or better than newer competitors (e.g. Chestnut / chestnutfi.com) in the insurance distribution management space.

**Success =**
- A homepage that looks like a 2026-era top-tier B2B SaaS site, not a legacy vendor.
- Bold, smooth, tasteful animation that reinforces trust rather than distracting from it.
- 100% faithful to Brand Direction 05 ("Assurance System") tokens.
- Self-contained: opens in any browser, hosts anywhere (Netlify/Vercel/S3), hands cleanly to devs.
- Accessible (WCAG AA contrast, keyboard nav, `prefers-reduced-motion` support) and responsive (mobile → desktop).

**Explicit non-goals / constraints:**
- ❌ Do NOT reuse product names or copy from the brand-kit mockup (it's AI-generated placeholder).
- ❌ Do NOT imitate the brand-kit's UI example screens — target quality is *well above* that.
- Product/solution names and messaging come from the **real live evolvenxt.com** (see §4).

---

## 2. Tech Approach

- **Stack:** Hand-authored static site — `index.html` + modular CSS + vanilla JS. No framework, no build step.
- **Fonts:** Google Fonts — Noto Serif Display (headlines), Inter (body/UI), IBM Plex Mono (data/labels). Neue Haas Grotesk from the kit is paid; Inter is the kit's own web/UI face, so no visual loss.
- **Animation:** Hand-built (Canvas/WebGL + CSS + IntersectionObserver), dependency-free.
- **Generated assets (Higgsfield MCP):** Looping abstract hero background video (navy/blue/purple data-flow) + a small set of on-brand supporting images. Layered under/with code animation.
- **Preview/QA:** Live browser preview to verify motion, layout, and responsiveness.

```
evolvenxt-redesign/
├── index.html
├── PRD.md
├── css/
│   ├── tokens.css      # colors, type, spacing, radius, shadow, motion vars
│   └── styles.css      # layout + components
├── js/
│   ├── hero-canvas.js  # WebGL/Canvas hero animation
│   ├── animations.js   # scroll reveal, magnetic buttons, nav, marquee
│   └── counters.js     # animated metric count-ups
└── assets/
    ├── logo-white.svg / logo-navy.svg
    ├── hero-loop.mp4   # Higgsfield-generated
    └── ...icons, illustrations
```

---

## 3. Design System (Brand Direction 05 — "Assurance System")

### Color tokens
| Token | Hex | Role |
|---|---|---|
| Deep Navy | `#020838` | Primary dark bg, text |
| Midnight Blue | `#06133A` | Secondary dark surface |
| Royal Blue | `#1B4CC1` | Primary action, links, key UI |
| Slate Blue | `#50678F` | Secondary UI, icons, states |
| Light Gray | `#E6E8EE` | Borders, subtle surfaces |
| Soft Gray | `#F2F3F6` | Page background |
| Charcoal | `#1A1D23` | Text primary alt |
| Accent Purple | `#6C2BD9` | Highlights & CTAs **only, sparingly (~3%)** |

**Usage ratio:** ~50% neutrals · 20% navy · 20% royal · 7% slate · 3% purple.

### Type scale
- H1 64/64, H2 40/48, H3 24/32, H4 18/28, H5 14/22 — Noto Serif Display Bold
- Body 1 16/24, Body 2 14/20, Small 12/16 — Inter
- Data/Label 12/16 — IBM Plex Mono
- Spacing: 8pt base (4/8/16/24/32/64/96/128). Grid: 12 columns.

### Voice
Clear · Trusted · Modern · Knowledgeable · Confident. Lead with clarity, focus on impact, be concise, human & authentic.

---

## 4. Real Content (from live evolvenxt.com)

**Company:** Founded 2011. Builds modern, enterprise-grade technology platforms for insurance carriers across Health, Life, and Property & Casualty.

**Products / modules (real names):**
1. **Incentive Compensation Management (ICM)** — purpose-built for insurance, highly configurable across Health, Life, and P&C.
2. **Producer Onboarding** — comprehensive API-driven onboarding & contracting, incl. NIPR integration and appointment processing.
3. **Producer Portal & Notifications** — centralized portal delivering a unified experience from onboarding through ongoing management.
4. **Web Enrollment** — paperless plan quoting and enrollment.
5. **CRM / Lead Management** — processing, managing, and distributing leads with detailed analytics.

**Solutions by audience:** Health Insurance · Life / Annuity · Property & Casualty · Agencies.

**Positioning today:** "Next Generation Insurance Distribution Management." (We will elevate the hero line in the new brand voice — candidates below, to be approved.)

> Note: No real public stats, client logos, or testimonials were available on the live site. Metrics/logos in the design will be clearly marked placeholders until EvolveNXT supplies approved figures. **We will not invent specific client names or fake numbers as if real.**

---

## 5. Homepage Structure

1. **Sticky nav** — glassmorphic; shrinks + blurs on scroll. White logo. Links: Products · Solutions · Industries · Resources · Company + purple **Request a Demo** CTA.
2. **Hero** — new brand-voice headline + subhead, dual CTA (Explore Solutions / Talk to an Expert), over Higgsfield hero video + code animation. Trusted-by marquee (placeholder logos).
3. **Value pillars** — 3 confidence-led pillars (reliable systems / compliance built-in / human expertise), drawn from the real positioning.
4. **Product suite** — the 5 real modules as premium interactive cards with original, high-quality UI vignettes (NOT the brand-kit example).
5. **Proof / metrics** — animated count-ups (placeholder values, clearly flagged).
6. **Solutions by audience** — Health · Life/Annuity · P&C · Agencies.
7. **How we deliver** — an animated journey (onboard → manage → pay → grow) mapped to real capabilities.
8. **Dark CTA strip** — "Ready to move forward with confidence?" on Deep Navy.
9. **Footer** — full nav, logo, legal.

---

## 6. Animation Spec (bold, but on-brand)

- **Hero:** Higgsfield abstract loop + a live Canvas/WebGL node-network / data-flow field (navy→royal→purple) with mouse parallax; headline blur-and-rise word reveal.
- **Self-drawing SVG line art** for section accents (stroke-dashoffset).
- **Scroll reveals:** staggered fade/slide via IntersectionObserver; slim scroll-progress bar.
- **Micro-interactions:** magnetic buttons, gradient-glow hovers, tilt-on-hover product cards.
- **Metric count-ups** trigger on scroll into view.
- **Logo marquee** infinite scroll.
- **Accessibility:** full `prefers-reduced-motion` path — motion replaced by simple fades/instant states.

---

## 7. Build Order

1. Design tokens (`tokens.css`) + base layout + fonts.
2. Nav + hero shell + Canvas animation.
3. Kick off Higgsfield hero video + imagery generation (async) in parallel.
4. Remaining sections with real content.
5. Scroll animations, counters, micro-interactions + reduced-motion.
6. Integrate generated assets; responsive polish; live-browser QA.

---

## 8. Open Items for EvolveNXT

- Approve final hero headline/subhead (candidates to be proposed).
- Provide real metrics, client logos, and testimonials to replace placeholders.
- Confirm nav information architecture (top-level menu labels).
