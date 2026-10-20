# Unique Fitness Gym

Production notes for the Unique Fitness Gym static site.

The site is a no-build, multi-page static website for **Unique Unisex Fitness and Gym** in Kumaran Nagar, Mudaliarpet, Pondicherry. It follows the requested fitness-site structure, using the supplied local imagery for the actual gym and clearly marked external references for activity concepts.

The public listing used for the current business facts is [Justdial](https://www.justdial.com/Pondicherry/Unique-Unisex-Fitness-and-Gym-Kumaran-Nagar-Mudaliarpet/0413PX413-X413-250910211420-K1I9_BZDET). Confirm all listing details with the gym before launch.

The supplied Google Maps place and review source is [Unique Unisex Fitness & Gym](https://maps.app.goo.gl/KbJBjfcGLrUxyGn37).

## Run locally

No build step is required. From the project root, start Python's built-in local server:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Open <http://127.0.0.1:8000/> in a browser. Keep the terminal running while testing, and press `Ctrl-C` to stop the server. Use a different port, such as `4173`, if port `8000` is already in use.

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

The current data model includes address, city, postal code, phone number, establishment year, public listing categories, map URL, hours, rating, and review count sourced from the supplied Google Maps place link and Justdial. Email, social profiles, app links, and blog metadata remain placeholders because they were not supplied.

## Form endpoint setup

This is a static site, so it cannot process form submissions by itself. No production form endpoint was supplied with the project.

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

- Images under `assets/optimized/` are the supplied Unique Fitness Gym photos and are used for the facility, equipment, training floor, and owner sections.
- Images under `assets/external/` are openly licensed Wikimedia Commons references for CrossFit, yoga, and meditation concepts. They are not photos of Unique Fitness Gym. Full source and license records are in [`assets/external/credits.json`](assets/external/credits.json).
- [`assets/provided/mudaliarpet-street-view.jpg`](assets/provided/mudaliarpet-street-view.jpg) is a street-view screenshot supplied by the client and used for the Mudaliarpet location sections.

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

No official logo, email, social links, app URLs, confirmed service schedules/prices, or blog metadata were supplied. The phone number, address, rating, and review excerpts were taken from the supplied Google Maps place link; opening hours and listed services were also cross-checked against the public listing above.

The following information was not supplied and must be confirmed before launch:

- Official logo
- Email address
- Social media links
- App URLs
- Confirmed service descriptions, schedules, and prices
- Blog metadata, including any titles, authors, dates, slugs, descriptions, or images

The supplied Google Maps listing provides the phone number `099949 85599`, a `5.0` rating from `20` reviews, and review excerpts used on the About and Services pages. It does not provide an email address. The favicon in this repository is an original temporary U monogram/wordmark-derived mark only. It must not be presented as the official Unique Fitness Gym logo.

## Assumptions recorded

- The repository root is the static publish directory and the homepage is served at `/`.
- The HTML pages, `assets/data.js`, CSS, and JavaScript are the source of truth; the site has no build step.
- There is no server-side form handler; configure the endpoint before launch.
- `https://[YOUR-DOMAIN]/` is a local-friendly canonical placeholder, not a real production domain.
