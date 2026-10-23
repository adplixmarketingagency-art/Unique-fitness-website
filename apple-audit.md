## Design review: Uniquefit (Unique Unisex Fitness and Gym)

### Summary
A premium dark editorial web site for a unisex gym in Pondicherry, India. The design has a clear point of view: obsidian ground, ember (red) and brass (gold) accents, Archivo variable typography, and a hero with a gradient backdrop and cursor-following glow. The site serves its purpose — informing potential members about hours, services, location, and reviews — with a confident, restrained aesthetic. Overall rating: **Good**. The craft is strong and intentional; the main gap is that some Apple platform conventions (system fonts, Dynamic Type, Liquid Glass materials) don't apply to a vanilla web build, which is expected, not a failure.

### Critical
None. No accessibility failures, no broken conventions that confuse users, and no usability blockers.

### Improvements

- **High — Typography scale doesn't respond to user text-size settings.** The site uses `clamp()` for responsive sizing but doesn't implement `font-size-adjust` or `rem`-based scaling tied to user preferences. `typography.md › Supporting Dynamic Type`: "Make sure your app's layout adapts to all font sizes." For a web site, this translates to using `rem` units and respecting `prefers-reduced-motion` (already done) and ideally supporting larger text via `rem` scaling. The current `clamp()` approach is responsive to viewport, not to user accessibility settings.
  - **Fix:** Ensure all spacing and type scale in `rem` (already mostly true) and test at 200% browser zoom; add `font-size: 100%` on `html` so user settings propagate.

- **Medium — No visible keyboard focus indicator on interactive elements.** The site has `button`, `a`, and `input` elements but no `:focus-visible` styles in the CSS. `accessibility.md › Mobility`: "Let people use the keyboard alone to navigate and interact with your app." `layout.md › Guides and safe areas`: keyboard focus should be visible.
  - **Fix:** Add `:focus-visible { outline: 2px solid var(--brass-500); outline-offset: 2px; }` to interactive elements.

- **Medium — The BMI calculator form lacks dynamic validation feedback beyond the submit event.** `entering-data.md`: "Validates dynamically." The form only validates on submit; no inline error messages appear as the user types.
  - **Fix:** Add `input` event listeners that show validation messages in real time (e.g., "Height must be between 100 and 250 cm").

- **Low — The `og:image` and `twitter:image` meta tags reference `/assets/optimized/Outer-look.jpg` without an absolute URL.** This is a content/config issue, not a design issue, but it affects how the site appears when shared.
  - **Fix:** Update meta tags with the full production URL once configured.

### Craft notes

- **Point of view:** The design is unmistakably specific to this gym. The dark editorial palette (obsidian, ember, brass), the Archivo variable font with tight tracking (`-0.035em` on display), and the hero gradient with cursor glow are not generic templates — they are deliberate choices rooted in the gym's identity ("Stronger starts here"). `branding.md`: "Branding defers to content, brand color is saved for primary actions." The ember accent is used sparingly: hero glow, active nav indicator, button hover, and the BMI result value. This is correct.

- **Signature element:** The hero gradient backdrop (`v-hero`) with the cursor-following glow (`--glow-x`, `--glow-y`) is the defining moment. It communicates energy and motion without overwhelming the content. `motion.md`: "Add motion purposefully, supporting the experience without overshadowing it." The glow is subtle (`160px` x-range, `100px` y-range) and disabled when `prefers-reduced-motion` is active or the hero is not visible. This is well-executed.

- **Typography personality:** Archivo is a geometric sans with a wide range (`wdth` 62–125, `wght` 100–900). The site uses it for everything — display, headings, body, and labels — which creates a unified voice. `typography.md`: "Minimize the number of typefaces you use." Only one face is used, which is correct. The tight tracking on large headings (`-0.035em`) gives the display text a premium, editorial feel.

- **Restraint:** The design avoids decoration. There are no unnecessary borders, no decorative icons, no extra logos. The footer logo (`Unique<small>Unisex Fitness &amp; Gym</small>`) is the only brand repetition, and it serves navigation. `branding.md`: "Resist the temptation to display your logo throughout your app." The site respects this.

- **One thing to remove:** Nothing stands out as unnecessary. The design is already lean. The `v-hero__dots` decorative element (`aria-hidden="true"`) is subtle and doesn't compete with content.

### What works

- **Hero choreography.** The scroll-progress variable (`--hero-scroll`) drives the hero's visual state, and the `IntersectionObserver`-based stage crossfade (`initStage`) activates images based on section position. `motion.md`: "Motion is purposeful, brief, cancellable, and rare on frequent interactions." The hero motion is rare (only on scroll) and cancellable (reduced-motion disables it).

- **Nav glide indicator.** The `::before` pseudo-element with `left`/`width` transition (`--glide-left`, `--glide-width`) is a refined interaction detail. It responds to the active link (`aria-current="page"`) and updates on resize. This is craft at the interaction level.

- **Magnetic BMI CTA.** The `data-magnetic` hover effect (`--magnet-x`, `--magnet-y`) with spring easing (`0.18` factor) is playful but restrained. It only activates on fine-pointer devices (`hover: hover` and `pointer: fine`) and is disabled for reduced motion.

- **Accessibility infrastructure.** Skip link (`skip-link`), `aria-label` on the logo, `aria-expanded` on the menu toggle, `aria-controls` linking toggle to panel, `inert` on page content when menu is open, `aria-live="polite"` on BMI result, and `aria-atomic="true"`. This is comprehensive.

- **Content hierarchy.** The site uses progressive disclosure (`faq-item` questions, `board-item` details) and clear grouping (`board-group` for "The floor" and "Guided options"). `layout.md`: "Use progressive disclosure to make layouts cleaner."

### Platform notes

- **Web, not native Apple.** This is a vanilla HTML/CSS/JS site, not a SwiftUI, UIKit, or AppKit app. Apple HIG conventions like tab bars, sidebars, Liquid Glass materials, SF Symbols, and Dynamic Type don't apply directly. The site translates Apple principles (purpose, simplicity, craft, delight) into web patterns: a sticky header instead of a toolbar, a scrollable hero instead of a sheet, and CSS custom properties instead of system colors.

- **No Liquid Glass.** The site uses a solid dark surface (`--neutral-975`) with translucent overlays (`--scrim`, `--overlay`) rather than the translucent `backdrop-filter` glass material Apple recommends. This is appropriate for a dark editorial design; adding glass would dilute the premium feel.

- **No system font.** The site uses Archivo (Google Fonts) instead of SF Pro or New York. `typography.md`: "Consider using the built-in text styles." For a branded web site, a custom font is acceptable and even preferred (`branding.md`: "Consider using a custom font"). The site uses Archivo consistently, which is correct.

- **No Dynamic Type.** The site uses `clamp()` for viewport-responsive sizing, not user-preference-responsive sizing. This is the main accessibility gap noted above. For a web site, the equivalent of Dynamic Type is `rem`-based scaling with `font-size: 100%` on `html`.

- **Cross-platform translation.** `references/cross-platform.md` notes that web frameworks should translate Apple's vocabulary: "toolbar" → sticky header, "tab bar" → primary nav links, "sheet" → modal or overlay, "system font" → web-safe or custom font. The site follows these translations correctly.
