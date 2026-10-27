# Unique homepage — The Grind adaptation

Scope: homepage only. Existing About, services, BMI, contact, and blog routes,
business data, form behavior, metadata, and deployment configuration are retained.
There is deliberately **no app/download section**.

## Source/content and hierarchy

- The long homepage About letter was removed because it repeated the shorter opening
  story and founder timeline. The navigation now points to `#our-story`, while the
  complete story remains available on the existing About route.
- All seven founder-story cards and all fourteen original certificate images are
  present on the homepage, restored from the existing About-page archive.
- Facts and achievements are preserved from the existing repository; this redesign
  is not an independent verification of those claims.
- All gym/founder photography comes from the existing Unique project. No The Grind
  logos, videos, customer identities, tracking code, Slater scripts or Webflow runtime
  are used.

## Colour direction

- The homepage now uses a dominant black and red palette with white reserved for
  readable text, controls and high-contrast details.
- The training section is the main red field; surrounding sections stay black.
- Photography keeps its original colour. Red and black come from the page surfaces,
  borders, typography and overlays rather than image desaturation.

## Motion reference and implementation

The captured The Grind Slater `global.js` demonstrates:
`initGridAnimation` (scroll-pinned image assembly), hero timeline (clip-path photo
entrances and SVG stroke drawing), `initSplitTextAnimations`, `initHighlightText`,
marquee motion, and parallax. `assets/grind-motion.js` implements these patterns
against Unique's markup, not against copied production DOM or services.

- Opening photo montage and expanding hero photograph.
- Line-masked heading entrances; staggered content and image reveals.
- Original U/arrow seal, drawn underline and hand-drawn About arrow.
- Rotating seal and continuous typographic ribbon.
- Desktop scroll-pinned gym-photo collage; ordinary stacked reveal on mobile.
- Magnetic mouse-hover buttons; no pointer interception on touch.
- Seven-card founder timeline followed by the complete fourteen-document archive.
- All motion can be paused; system reduced motion disables animation and pinning.
- Continuous effects pause outside their section and while the tab is hidden.
- Content is visible without JavaScript or if animation dependencies fail.

GSAP 3.13.0 and ScrollTrigger 3.13.0 are vendored with their original license
headers intact. See https://gsap.com/standard-license. No build/install is required.

The existing `assets/main.js` still owns navigation, BMI validation/calculation,
and shared behavior. `assets/grind-home.css` is homepage-only, so subpage designs
are not changed by this work.
