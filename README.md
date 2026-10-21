# Unique Fitness Gym

Production notes for the Unique Fitness Gym static site.

The site is a no-build, multi-page static website for **Unique Unisex Fitness and Gym** in Kumaran Nagar, Mudaliarpet, Pondicherry. It uses the supplied local imagery for the actual gym and clearly marked external references for activity concepts. Four pages ship today: home (`index.html`), About, BMI calculator (`bmi/`), and Contact. The former Notes/blog section and the former Services page were removed at the client's request; the six listing services are documented on the home listing board, and the Services slot in the navigation now opens the BMI calculator.

The public listing used for the current business facts is [Justdial](https://www.justdial.com/Pondicherry/Unique-Unisex-Fitness-and-Gym-Kumaran-Nagar-Mudaliarpet/0413PX413-X413-250910211420-K1I9_BZDET). Justdial blocks scripted fetching (HTTP 403), so its details were transcribed manually. Confirm all listing details with the gym before launch.

The supplied Google Maps place and review source is [Unique Unisex Fitness & Gym](https://maps.app.goo.gl/KbJBjfcGLrUxyGn37).

## Design system

### Colour

All colour is authored in **OKLCH** in `assets/styles.css` and exposed as CSS custom properties on `:root`. The original hue family is preserved — obsidian ground, crimson/ember accent, brass secondary — and each has been refined into a full tonal scale with a fixed hue and a lightness-anchored chroma curve.

Raw ramps (each step 50 to 950 unless noted):

| Ramp | Hue | Role | Steps |
| --- | --- | --- | --- |
| `--neutral-*` | 245 | Ink and surface greys | 50–800, plus 850, 900, 950, 975 |
| `--ember-*` | 29.22 | Primary accent (crimson) | 50–950 |
| `--brass-*` | 89.80 | Secondary accent (brass) | 50–950 |
| `--jade-*` | 158.58 | Success | 300–900 |
| `--amber-*` | 63.18 | Warning | 300–900 |
| `--crimson-*` | 18.74 | Danger | 300–900 |

Semantic tokens sit on top of the ramps and are the only names components should use:

- Ground and surfaces: `--color-bg`, `--color-bg-deep`, `--color-surface`, `--color-surface-elevated`, `--color-surface-raised`, `--color-surface-sunken`.
- Lines: `--color-border`, `--color-border-strong`, `--color-border-soft`.
- Text: `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`, `--color-text-faint`, `--color-text-inverse`.
- Accent: `--color-accent`, `--color-accent-hover`, `--color-accent-active`, `--color-accent-quiet`, `--color-accent-text`, `--color-accent-strong`, `--color-accent-line`; secondary `--color-secondary`, `--color-secondary-text`. `--color-accent-strong` is the deepest red that still clears 4.5:1 as small text, and is what accent-coloured labels under 18px use.
- Status: `--color-success`, `--color-warning`, `--color-danger`.
- Overlays: `--color-scrim`, `--color-overlay`.

Every foreground and background pair in the shipped pages was checked against WCAG AA (4.5:1 for body text, 3:1 for large text) against its composited background.

### Type

- **Archivo** variable (Google Fonts, width 62..125, weight 100..900). Bold wide display; regular-width text. No other family is loaded.
- A modular scale drives the type ramp through `--step-display`, `--step-head`, `--step-subhead`, `--step-quote`, `--step-lead`, `--step-body`, `--step-small`, `--step-micro`, each a `clamp()` between a floor and a ceiling.
- Tracking, leading, and measure are tokenised as `--tracking-display|head|body|label`, `--leading-display|head|body`, `--measure`, `--measure-tight`.

### Space, radius, elevation, motion

- A 4px base spacing scale runs `--space-1` (0.25rem) through `--space-24` (6rem).
- Radii run `--r-xs` through `--r-2xl`, with `--r-media: 1rem` for photographs and `--r-pill` for capsule controls.
- Elevation is `--shadow-sm|md|lg|accent` plus `--ring-accent` for the focused accent state.
- Easings are `--ease-out`, `--ease-expo`, `--ease-in-out`, `--ease-soft`; durations are `--t-press`, `--t-hover`, `--t-ui`, `--t-reveal`, with `--stagger-line` and `--stagger-item` for staged entrances.

### Layout

- Layout frame and gutter are `--frame` and `--gutter`; breakpoints are 25rem, 30rem, 34rem, 48rem, 60rem, and 64rem, mobile-first.
- The home hero (`v-hero`) is a typographic split: `v-hero__copy` on the left with the display wordmark, slogan, lead, and calls to action; `v-hero__aside` on the right with an inline BMI card and a `Check your calorie goal` pill that links to the calorie calculator. The two blocks stack below 64rem, and in that stacked layout the BMI card fills the column so the inputs stay thumb-sized instead of hugging their content.
- Below 25rem the header lockup stacks, with `UNIQUE` over its tagline, so the tagline never wraps mid-phrase on a narrow phone.
- Section heads use `sec-head`; `sec-head--split` puts the note in a right-hand column from 48rem and stacks it below the heading on narrow screens. `sec-split` sets a narrow sticky heading column beside the content from 48rem.
- Bounded photo grids (`figs`) are bento layouts; `figs__lead` and `figs__tall` are the large and portrait variants. Review-wall cards (`rwall`) and one framed CTA panel per page complete the pattern set.
- **BMI calculator** (`bmi/`): height/weight inputs in cm·kg or ft+in·lb, computed fully client-side (no data sent or stored). Result shows the BMI value, the WHO band it lands in, a highlighted band-bar marker, and the healthy weight range for the entered height. The bands and their footnote are rendered with the shared board pattern. On wide screens the calculator form is sticky and the band list scrolls beside it.
- **Photography treatment**: every bounded photograph uses one soft radius token (`--r-media: 1rem`) and visible grid gaps; full-bleed usage is limited to the viewport-edge media panels (home hero and closing CTA).

### Motion

- Load and scroll reveals and clip-path image opens are driven by `IntersectionObserver` in `assets/main.js`. The JavaScript owns the contract: it adds `.is-in` to reveal targets, splits headings into `span.line > span` with a `--i` stagger index, and writes `--d`, `--magnet-x`, and `--magnet-y` custom properties. CSS reacts to those; it does not set them.
- Runtime state classes carry the JavaScript-to-CSS contract: `.is-in` (a target has been revealed), `.is-open` and `.is-closed` (disclosure panels), `.is-scrolled` (the header after the first scroll), `.is-ready` and `.is-on` (the staged media sequence), `.touched` and `.is-error` (form fields), and `.is-here` (the active BMI band segment). The scripts own these class names; the stylesheet only reacts to them.
- Every animation is gated behind `prefers-reduced-motion`, and cross-document navigation uses `@view-transition { navigation: auto }`.

### Copy rules

Hour ranges use en dashes (`05:00–22:00`), titles use middle dots (`·`), and no em dashes appear in page copy.

## Do not link

The Google Business Profile social handle `@unique.fitness.gym_` belongs to a **different business in Kerala** with a near-identical name. No Instagram or other social profiles were verified for this gym, so the site carries no social links. Email and social links must come from the gym itself.

## Run locally

No build step is required. From the project root, start the Node development server:

```bash
npm run dev
```

Open <http://127.0.0.1:3000/> in a browser. Keep the terminal running while testing, and press `Ctrl-C` to stop the server. Set `PORT=4173 npm run dev` if port `3000` is already in use.

Serve the site over HTTP rather than opening the HTML file directly so that relative asset paths and browser form behavior match a real deployment.

## Test

The offline test command checks every HTML page, local link and asset path, image dimensions and alt text, JSON-LD validity, the pinned runtime, the lockfile, and the Docker scaffolding:

```bash
make test
```

No network is needed for this command.

## Docker

Build and run the static site with the pinned container setup:

```bash
docker build -t unique-fitness-gym .
docker run --rm -p 8080:8080 unique-fitness-gym
```

Open <http://127.0.0.1:8080/>.

## Edit content in `assets/data.js`

The page content is intended to be maintained in [`assets/data.js`](assets/data.js):

1. Open `assets/data.js` in an editor.
2. Change the existing text, links, arrays, or other values in the data structure consumed by the page.
3. Keep the file valid JavaScript and preserve the existing property names, array shapes, and value types expected by the page scripts.
4. Do not add credentials, API keys, or other secrets to this client-side file.
5. Refresh the local page after saving. Use a hard refresh if the browser is still showing cached content.

The current data model includes brand names, navigation, contact details (no email), hours, map URL, rating, review count, and six service entries sourced from the supplied Google Maps place link and Justdial. Email and social profiles remain placeholders because they were not supplied.

## Form endpoint setup

This is a static site, so it cannot process form submissions by itself. No production form endpoint was supplied with the project; the contact form keeps its placeholder endpoint and shows a "cannot send yet" status message instead.

Before launch:

1. Choose a form service or a serverless/API endpoint that accepts browser `POST` requests.
2. Put the provider's HTTPS submission URL in the form's `action` attribute without changing the form field names expected by the endpoint.
3. Keep the form method as `POST` and confirm that required fields, validation, success redirects, and error responses are configured at the provider.
4. Configure spam protection, notification recipients, data retention, and privacy messaging in the chosen service.
5. Test a successful submission and a validation failure through the local server, then repeat the test on the deployed HTTPS domain.

Do not expose private API keys in HTML or JavaScript. If the endpoint requires a secret, put that secret behind a server-side or serverless function and configure CORS and allowed origins there.

## Asset optimization notes

- Keep the original supplied images as source material and generate appropriately sized delivery variants rather than shipping oversized originals to every viewport.
- Prefer AVIF or WebP for photographic assets when the deployment target supports them, with a fallback where needed. Pick a quality setting that preserves readable details and check the actual file size after export.
- Provide intrinsic `width` and `height` values for content images to reduce layout shift, and lazy-load below-the-fold images where the page behavior allows it.
- Use responsive image sizes for large hero or gallery images instead of downloading the largest file on small screens.
- Keep decorative images out of the accessibility tree and give meaningful content images concise, descriptive alternative text.
- The hand-authored [`assets/img/favicon.svg`](assets/img/favicon.svg) is a small original placeholder mark. It is not an approved official logo and should be replaced if a real logo is supplied.

## Image provenance

- Images under `assets/optimized/` are the supplied Unique Fitness Gym photos and are used for the facility, equipment, training floor, and owner sections. The owner photographs are kept as supplied; they show the founder mid-pose and the achievement-wall magazine cover, so the achievement wall leads wherever both appear.
- Images under `assets/external/` are openly licensed Wikimedia Commons references for the gym access, CrossFit, yoga, and meditation concepts. They are not photos of Unique Fitness Gym and are always captioned as concept references. Full source and license records are in [`assets/external/credits.json`](assets/external/credits.json).
- [`assets/provided/personal-training.jpg`](assets/provided/personal-training.jpg) and [`assets/provided/Gym_founder_4k.png`](assets/provided/Gym_founder_4k.png) are client-supplied photographs (a personal-training session reference and the founder posing). Web deliveries are the optimized derivatives under `assets/optimized/`.
- [`assets/provided/mudaliarpet-street-view.jpg`](assets/provided/mudaliarpet-street-view.jpg) is a street-view screenshot supplied by the client. It is currently unused on the pages but kept in the provided set.

## Deploy notes

1. Use any static host that publishes the repository root, such as a static hosting service, object storage with website hosting, or a CDN-backed static deployment.
2. Confirm that the deployed root contains the site entry HTML, `assets/data.js`, the referenced assets, `robots.txt`, and `sitemap.xml`.
3. Before the site is public, replace the `[YOUR-DOMAIN]` placeholder in `robots.txt` and `sitemap.xml` with the final HTTPS origin, including the trailing slash in the canonical URL.
4. Configure the custom domain and HTTPS certificate at the host. Use one canonical origin and redirect alternate HTTP or hostname variants to it when the host supports redirects.
5. Verify the homepage, favicon, image paths, form submission, and the deployed `robots.txt` and `sitemap.xml` at the final domain after deployment.

The placeholder host is deliberately retained in the delivery files until a real domain is known. Do not submit the placeholder sitemap to search engines.

## Current sourced business facts

- Public listing name: Unique Unisex Fitness and Gym
- Address: No. 1, Kumaran Nagar, 100 Feet Road, Mudaliarpet, Pondicherry – 605004
- Establishment year: 2025
- Listed hours: 05:00–22:00 daily
- Google Maps phone: 099949 85599
- Google Maps rating: 5.0 from 20 reviews
- Listed fitness options: Gym, CrossFit, Yoga
- Listed service: Get Your Own Trainer
- Listed business type: Unisex
- Public source: [Justdial listing](https://www.justdial.com/Pondicherry/Unique-Unisex-Fitness-and-Gym-Kumaran-Nagar-Mudaliarpet/0413PX413-X413-250910211420-K1I9_BZDET)
- Reviews and place details: [Google Maps place](https://maps.app.goo.gl/KbJBjfcGLrUxyGn37)

## Missing real brand information

No official logo, email, social links, app URLs, or confirmed service schedules/prices were supplied. The phone number, address, rating, and review excerpts were taken from the supplied Google Maps place link; opening hours and listed services were also cross-checked against the public listing above.

The following information was not supplied and must be confirmed before launch:

- Official logo
- Email address
- Social media links
- App URLs
- Confirmed service descriptions, schedules, and prices

The supplied Google Maps listing provides the phone number `099949 85599`, a `5.0` rating from `20` reviews, and review excerpts used on the About page. It does not provide an email address. The favicon in this repository is an original temporary U monogram/wordmark-derived mark only. It must not be presented as the official Unique Fitness Gym logo.

## Assumptions recorded

- The repository root is the static publish directory and the homepage is served at `/`.
- The HTML pages, `assets/data.js`, CSS, and JavaScript are the source of truth; the site has no build step.
- There is no server-side form handler; configure the endpoint before launch.
- `https://[YOUR-DOMAIN]/` is a local-friendly canonical placeholder, not a real production domain.
- Membership rates and class schedules stay unlisted everywhere because no source publishes them; every related section ends at the phone number instead.
