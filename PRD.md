# EvolveNXT — Website Redesign PRD

**Owner:** Jonah (Content Intern)
**Updated:** 2026-07-02
**Direction:** "Daybreak" (fourth full reset — light editorial)

---

## 1. Positioning

EvolveNXT is the **operating system for insurance distribution**: enterprise software for
carriers covering producer onboarding, contracting, hierarchy, incentive compensation,
producer portals, notifications, web enrollment, CRM, lead management, and reporting.

Quality bar: a design-forward premium brand site (Daybreak-level restraint), not a SaaS
template, dashboard theme, or AI-startup look.

## 2. Art direction

- **Light editorial site.** Warm off-white field `#F3EFE7`, charcoal type, generous
  whitespace, composition over components.
- **Dark used deliberately, three times:** the dawn hero, the product showcase surface,
  and the dusk CTA bookend.
- **The story device:** the homepage plays as one continuous day. The hero opens as a
  night sky; scrolling raises the light through blue hour and sunrise until the canvas
  resolves to the exact page cream and the site continues in daylight; it closes at dusk.
- **Type:** Instrument Serif display (with italic accents in navy), Geist body/UI.
  Editorial serif-italic labels instead of all-caps mono eyebrows.
- **No cards, no boxes, no dashboards, no line-art/diagrams, no icons, no fake data
  (status words only), no CSS gradients, no rounded corners, no green, no purple-heavy
  anything, no em-dashes.** Slim sharp buttons; quiet text links.

## 3. Homepage (six movements)

1. **Dawn hero (pinned, 300vh).** Canvas sky: stars, drifting atmosphere, rising sun,
   palette keyframed night → blue hour → sunrise → cream. Serif headline lifts and fades
   as the light rises. Nav is light-on-dark, resolving to cream glass in daylight.
2. **Statement.** Large serif editorial claim with per-line mask reveal.
3. **Lifecycle in daylight (pinned, 340vh).** Left: stage index, serif stage title,
   verbatim copy, thin progress rule. Right: unboxed hairline rows whose state transforms
   per stage (workflow, agreements, LOB, hierarchy indentation, enrollment, comp rules,
   reporting). Stacked list on mobile/reduced motion.
4. **Platform.** Numbered serif product list left; right, a deep-navy showcase surface
   bleeding off the viewport edge whose rows change with the selected product
   (hover/click/arrows). The one deliberate dark moment mid-page.
5. **Enterprise complexity.** Editorial split: sticky serif headline, three hairline
   text blocks.
6. **Dusk CTA.** Navy bookend, serif headline, one light button. Light editorial footer.

## 4. Implementation

Self-contained static site: `index.html`, `css/tokens.css`, `css/styles.css`,
`js/main.js` (assets versioned `?v=N` for cache busting). Dawn canvas is DPR-capped,
paints its first frame synchronously, eases scroll progress for fluid scrubbing, and
pauses offscreen/hidden. Pins disable under 1001px and reduced motion.
Repo: github.com/jonahmeyuhas-web/EvolveNXT-Redesign.
