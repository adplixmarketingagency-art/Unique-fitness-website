"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "assets/grind-home.css"), "utf8");
const motion = fs.readFileSync(path.join(root, "assets/grind-motion.js"), "utf8");

assert.equal((html.match(/<h1\b/g) || []).length, 1, "Homepage has one primary heading");
assert.match(html, /grind-home\.css/, "New styling is isolated to the homepage");
assert.match(html, /assets\/main\.js/, "Existing menu and BMI behavior is preserved");
assert.match(html, /data-hero-bmi/, "Homepage retains the functional BMI calculator");
for (const name of ["height", "weight"]) {
  assert.match(html, new RegExp(`name="${name}"[^>]*type="number"`));
}
assert.match(html, /aria-live="polite"/);
assert.match(html, /data-menu-toggle[^>]*aria-controls="site-nav"/);
assert.match(css, /prefers-reduced-motion:\s*reduce/);
assert.equal((html.match(/<details>/g) || []).length, 5, "Five keyboard-accessible FAQ disclosures");
assert.doesNotMatch(html, /thegrind\.nl|slater\.app|website-files\.com|the-grind\.b-cdn/i, "No production dependencies from the reference site");
assert.doesNotMatch(html, /id="app"|app.store|play.google|download (?:the|our) app/i, "No app/download section");
assert.doesNotMatch(html, /class="about-section|id="about"/, "Repetitive homepage About section is removed");
assert.match(html, /href="#our-story">Story<\/a>/, "Navigation now points to the concise opening story");
assert.match(html, /href="#the-gym">Gym<\/a>/, "Navigation maps directly to the gym section");
assert.match(html, /href="#founder-story" data-nav-sections="#founder-story,#certifications-achievements">Founder<\/a>/, "Founder nav tracks both founder sections");
assert.match(html, /class="start-card" id="bmi"/, "BMI card has an on-page navigation target");
assert.match(html, /class="questions section-wrap" id="faq"/, "FAQ has an on-page navigation target");
assert.doesNotMatch(html, /href="(?:about|services|bmi|contact)\//, "Homepage links must not route to legacy HTML pages");
assert.match(html, /aria-label="Footer navigation"><a href="#our-story">Story<\/a><a href="#the-gym">Gym<\/a>/, "Footer navigation maps to homepage sections");
assert.doesNotMatch(html, /STARTED IN 2025|BUILT TO BE UNIQUE/, "Removed section copy is not left behind");
assert.equal((html.match(/class="founder-story-card"/g) || []).length, 7, "All seven founder story cards are present");
assert.equal((html.match(/class="certificate-image"/g) || []).length, 14, "All fourteen original certificate images are present");
assert.match(html, /id="certifications-achievements"/, "Certificate archive has a direct anchor");
assert.doesNotMatch(css, /filter:\s*grayscale/, "Photography keeps its original colour");
assert.match(css, /--red:\s*#d71920/);
assert.match(css, /body\s*\{[^}]*background:\s*var\(--dark\)/);
assert.match(css, /\.training\.dark-section\s*\{[^}]*background:\s*var\(--red\)/);
assert.doesNotMatch(css, /\.about-(?:layout|portraits|portrait|achievement|arrow|letter|signature)/, "Removed section has no stale styling");
assert.doesNotMatch(motion, /about-(?:portrait|achievement|arrow|letter)|belief-(?:text|word)/, "Removed section has no stale animation hooks");
assert.match(html, /assets\/vendor\/gsap-3\.13\.0\.min\.js/, "Animation library is served locally");
assert.match(motion, /media\.revert\(\)/, "Pause and media changes revert animation state");
assert.match(motion, /visibilitychange/, "Continuous motion pauses in a hidden tab");
assert.match(motion, /conditions\.reduced/, "System reduced-motion preference is respected");
assert.match(motion, /pin: true/, "Desktop photo collage is scroll-driven");
assert.match(html, /data-motion-toggle/, "Motion has an explicit pause control");

// Optional animation dependencies must never prevent navigation/content.
const vm = require("node:vm");
const fallbackBody = { dataset: {} };
vm.runInNewContext(motion, {
  document: {
    readyState: "complete",
    body: fallbackBody,
    querySelectorAll: () => [],
    querySelector: () => null,
  },
  window: {},
});
assert.equal(fallbackBody.dataset.motionStatus, "unavailable", "Missing animation library fails open");

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
assert.equal(ids.length, new Set(ids).size, "No duplicate element IDs");
for (const [, anchor] of html.matchAll(/href="#([^"]+)"/g)) {
  assert.ok(ids.includes(anchor), `Anchor #${anchor} resolves`);
}
console.log("homepage tests passed: red/black palette, original-colour photography, repeated About letter removed, 7 founder cards, 14 certificates, motion/fallback hooks, BMI/menu, FAQ and anchors");
