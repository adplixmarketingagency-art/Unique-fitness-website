"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "assets/grind-home.css"), "utf8");
const events = html.match(/<section\b[^>]*id="events"[^>]*>[\s\S]*?<\/section>/)?.[0];

assert.ok(events, "Homepage has an Events section");
assert.match(events, /aria-labelledby="events-title"/);
assert.match(events, /<h2 id="events-title"[^>]*>EVENTS<\/h2>/);
assert.match(html, /<\/section>\s*<section\b[^>]*id="events"[\s\S]*?<\/section>\s*<section\b[^>]*id="certifications-achievements"/,
  "Events sits immediately above Certificates");
assert.ok(html.indexOf('id="founder-story"') < html.indexOf('id="events"'),
  "The mentor story remains before Events");
assert.equal((events.match(/<article\b/g) || []).length, 2, "Both supplied events are included");
assert.match(events, /Pillars of Puducherry/);
assert.match(events, /Rachana Singh, IPS/);
assert.match(events, /Bodybuilding competition/);
assert.match(events, /Royal Enfield Bullet/);
assert.match(events, /overall champion/i, "The prize is specifically for the overall championship");
assert.doesNotMatch(events, /\b(?:2026|upcoming|register now)\b/i, "Attachment dates are not invented event dates");

for (const [name, width, height] of [
  ["pillars-of-puducherry-award.jpg", 1280, 853],
  ["bodybuilding-royal-enfield-poster.jpg", 720, 960],
]) {
  const source = `assets/images/events/${name}`;
  assert.ok(fs.existsSync(path.join(root, source)), `Supplied event image exists: ${name}`);
  const image = events.match(new RegExp(`<img\\b[^>]*src="${source}"[^>]*>`))?.[0];
  assert.ok(image, `Event displays its supplied image: ${name}`);
  assert.match(image, /alt="[^"]+"/, "Event images have meaningful alternative text");
  assert.match(image, new RegExp(`width="${width}" height="${height}"`), "Intrinsic dimensions avoid layout shift");
  assert.match(image, /loading="lazy"/, "Below-the-fold event images are lazy-loaded");
  const link = events.match(new RegExp(`<a\\b[^>]*href="${source}"[^>]*>`))?.[0];
  assert.ok(link, "Full-size event image can be opened without JavaScript");
  assert.match(link, /target="_blank"/);
  assert.match(link, /rel="noopener noreferrer"/);
  assert.match(link, /aria-label="[^"]*new tab[^"]*"/, "Image links announce their new-tab behavior");
}

assert.match(css, /\.event-card__media img\s*\{[^}]*object-fit:\s*contain/,
  "The complete award photo and competition poster remain visible");
assert.match(css, /@media \(max-width: 768px\)[\s\S]*?\.events-grid\s*\{[^}]*grid-template-columns:\s*1fr/,
  "Event cards stack on mobile");
assert.match(html, /data-nav-sections="#founder-story,#events,#certifications-achievements"/,
  "Mentor navigation remains active through Events");
assert.match(html, /href="\/#events">Events<\/a>/, "Footer links directly to Events");

console.log("events tests passed: placement, both supplied images, award/prize copy, mobile layout, accessible full-image links");
