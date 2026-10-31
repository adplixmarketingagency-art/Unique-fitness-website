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
const heroImage = html.match(/<img class="grind-hero__image"[^>]*>/)?.[0];
assert.match(heroImage, /src="assets\/images\/gym\/hero-training-floor\.webp"/, "Hero uses the newly supplied gym photo");
assert.match(heroImage, /width="1448" height="1086"/, "Hero preserves the supplied photo dimensions");
assert.match(heroImage, /fetchpriority="high"/, "Hero image remains high-priority rather than lazy-loaded");
const header = html.match(/<header class="site-header">[\s\S]*?<\/header>/)?.[0];
assert.match(header, /<a class="site-brand"[^>]*aria-label="Unique Fitness Gym home">[\s\S]*?<img class="site-brand__logo"[^>]*src="assets\/images\/brand\/nav-logo\.webp"[^>]*alt=""[\s\S]*?<span class="wordmark">UNIQUE/, "Header has the supplied logo to the left of the wordmark within one accessible home link");
assert.match(css, /\.site-brand__logo\s*\{[^}]*border-radius:\s*50%/, "Navigation logo is circular");
assert.match(css, /\.site-brand__logo\s*\{[^}]*border:\s*2px solid #fff;/, "Navigation logo has the requested white outer ring");
assert.match(css, /\.site-brand__logo\s*\{[^}]*width:\s*78px;[^}]*height:\s*78px/, "Desktop logo is large enough to make the emblem visible");
assert.match(css, /@media \(max-width: 380px\)\s*\{[^@]*\.site-brand__logo,\s*\.site-header\.is-scrolled \.site-brand__logo\s*\{[^}]*width:\s*56px/, "Logo remains at least 56px even on the smallest supported phone after scrolling");
assert.match(html, /collage-tile--three"><img src="assets\/images\/gym\/treadmill-area\.webp"[^>]*width="900" height="1200"/, "Lower-left collage photo is the correctly oriented supplied treadmill photo");
assert.match(html, /collage-tile--four"><img src="assets\/images\/gym\/cardio-floor\.webp"[^>]*width="1158" height="1200"/, "Lower-right collage photo is the supplied cardio-floor photo");
const trainingCards = [...html.matchAll(/<article class="training-card">[\s\S]*?<\/article>/g)];
assert.equal(trainingCards.length, 3, "Training section retains all three options");
assert.match(trainingCards[1][0], /src="assets\/images\/services\/personal-training-session\.webp"[^>]*width="1206" height="2127"/, "Personal training card uses the supplied coaching photo with its actual dimensions");
assert.match(trainingCards[1][0], /alt="A trainer guiding a client through a seated cable exercise at Unique Fitness Gym"/, "Personal training alt text describes the new photo");
assert.match(trainingCards[2][0], /src="assets\/images\/gym\/cardio-machines\.webp"[^>]*width="1448" height="1086"/, "Cardio training card uses the new wide photo of the cardio machines");
assert.match(trainingCards[2][0], /Cardio &amp; conditioning/, "Photo replacement preserves the cardio card content");
const founderHeading = html.match(/<h2 id="founder-title"[^>]*>[\s\S]*?<\/h2>/)?.[0];
assert.match(founderHeading, /PONDICHERRY’S FIRST\.[\s\S]*MR\. ASIA MEDALLIST\./, "Historical milestone is prominent in the founder section heading");
assert.match(founderHeading, /MR\. INDIA CHAMPION\./, "Founder heading also highlights Mr. India");
assert.match(css, /#founder-title\s*\{[^}]*letter-spacing:\s*0;[^}]*word-spacing:\s*\.14em;[^}]*line-height:\s*1\.08;/, "Founder heading has visible word spacing rather than compressed tracking");
assert.match(html, /Mr\. India 2017 champion in the 60 kg category/, "Founder introduction keeps the national title category accurate");
const asiaChapter = html.split('id="founder-chapter-2019-asia"')[1]?.split("</li>")[0];
assert.match(asiaChapter, /first man from Pondicherry to earn a Mr\. Asia medal/, "Mr. Asia story highlights the Pondicherry-first milestone");
assert.match(asiaChapter, /bronze medal — third place in the 60 kg category/, "Milestone copy preserves the documented result rather than claiming an overall title");
assert.match(html, /data-hero-bmi/, "Homepage retains the functional BMI calculator");
const bmiHeading = html.match(/<h2 id="bmi-title">([\s\S]*?)<\/h2>/)?.[1];
assert.equal(bmiHeading.replace(/<br>/g, "").trim(), "KNOW YOUR STARTING POINT.", "BMI heading retains spaces when its line break is hidden on mobile");
assert.match(css, /\.start-card h2\s*\{[^}]*letter-spacing:\s*0;[^}]*word-spacing:\s*\.14em;[^}]*line-height:\s*1\.1;/, "BMI heading has clear word and line spacing without compressed tracking");
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
assert.match(html, /href="\/#our-story">Story<\/a>/, "Navigation now points to the concise opening story");
assert.match(html, /href="\/#the-gym">Gym<\/a>/, "Navigation maps directly to the gym section");
assert.match(html, /href="\/#founder-story" data-nav-sections="#founder-story,#events,#certifications-achievements">Mentor<\/a>/, "Mentor nav tracks the story, events and certificates");
assert.match(html, /class="start-card" id="bmi"/, "BMI card has an on-page navigation target");
assert.match(html, /class="questions section-wrap" id="faq"/, "FAQ has an on-page navigation target");
assert.doesNotMatch(html, /href="(?:about|services|bmi|contact)\//, "Homepage links must not route to legacy HTML pages");
assert.match(html, /aria-label="Footer navigation"><a href="\/#our-story">Story<\/a><a href="\/#the-gym">Gym<\/a>/, "Footer navigation maps to homepage sections");
assert.doesNotMatch(html, /STARTED IN 2025|BUILT TO BE UNIQUE/, "Removed section copy is not left behind");
assert.equal((html.match(/class="founder-story-card"/g) || []).length, 7, "All seven founder story cards are present");
const certificateCards = [...html.matchAll(/<li class="certificate-card(?: [^"]*)?">[\s\S]*?<\/li>/g)].map(([card]) => card);
const featuredCertificates = [
  "10-mr-asia-2019-merit.png",
  "09-senior-national-mr-india-2017.png",
  "14-karate-black-belt-2025.webp",
];
assert.equal(certificateCards.length, 15, "Every certificate and credential has its own card");
assert.equal((html.match(/class="certificate-image"/g) || []).length, 15, "All fifteen certificate images are present");
featuredCertificates.forEach((file, index) => {
  const card = certificateCards[index];
  assert.equal((card.match(/class="certificate-image"/g) || []).length, 1, "Each preview card shows exactly one image");
  assert.ok(card.includes(`src="assets/images/certificates/${file}"`), `Preview ${index + 1} displays ${file}`);
  assert.ok(card.includes(`href="assets/images/certificates/${file}"`), `Preview ${index + 1} opens the full certificate`);
});
assert.match(certificateCards[2], /Karate black belt, 1st Dan/);
assert.match(certificateCards[2], /World Bamboo–Aikido Federation/);
assert.match(certificateCards[2], /1 August 2025/);
assert.match(certificateCards[2], /Sho-Dan/);
assert.match(html, /All 15 certificates and credentials/);
assert.match(html, /View all 15 certificates/);
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
assert.match(motion, /pin: true/, "Photo collage is scroll-driven at every viewport");
assert.match(css, /@media \(max-width: 768px\)[\s\S]*?\.floor-collage\s*\{\s*grid-template-columns:\s*24% 1fr 24%/, "Mobile preserves the desktop side-photo composition");
assert.match(css, /\.floor-collage::before[\s\S]*?radial-gradient/, "Mentor glow blends across the full collage instead of a rectangular tile");
assert.match(css, /@media \(min-width: 769px\)[\s\S]*?\.collage-tile--founder img\s*\{[^}]*transform:\s*scale\(1\.35\)/, "Desktop mentor portrait retains its existing final size");
assert.match(css, /@media \(max-width: 768px\)\s*\{[^@]*\.collage-tile--founder img\s*\{[^}]*transform:\s*scale\(1\.4\)/, "Mobile mentor settles 40% larger after scrolling, including the reduced-motion fallback");
assert.match(motion, /compact:\s*"\(max-width: 768px\)"/, "Motion resets at the mobile portrait breakpoint");
assert.match(css, /\.collage-tile--founder\s*\{[^}]*background:\s*transparent/, "Founder tile does not expose a mismatched background panel");
assert.match(motion, /return i % 2 === 0 \? -distance : distance/, "Left photos enter from the left and right photos from the right");
assert.match(motion, /y:\s*0/, "Collage side photos animate horizontally only");
assert.match(html, /assets\/icons\.css/, "Homepage loads the shared drawn-icon styles");
assert.doesNotMatch(html, /[↗→↓↑]/, "Homepage arrows use SVG instead of platform-dependent emoji glyphs");
assert.doesNotMatch(motion, /[↗→↓↑]/, "Dynamic controls do not inject platform-dependent emoji glyphs");
assert.ok((html.match(/class="ui-icon"/g) || []).length >= 12, "Homepage CTAs use consistent drawn SVG arrows");
assert.doesNotMatch(html, /data-motion-toggle|Pause motion/, "Obsolete motion pause control is removed");
assert.doesNotMatch(css, /\.motion-toggle/, "Obsolete motion pause control styles are removed");
assert.doesNotMatch(html, /class="review-score"><span class="stars"/, "The reviews heading no longer carries a detached star row");
assert.equal((html.match(/class="review__source"/g) || []).length, 3, "Every review card has its own source and rating row");
assert.equal((html.match(/class="google-g"/g) || []).length, 3, "Every review card shows the Google G logo");
assert.equal((html.match(/class="review__stars"/g) || []).length, 3, "Every review card shows its five-star rating");

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

// Preview controls remain functional without the optional animation library.
const previewCards = certificateCards.map(() => ({ hidden: false }));
const previewLabel = { textContent: "" };
const previewStatus = { textContent: "" };
const previewAttributes = {};
let onPreviewClick;
let previewScrollRestored = false;
const previewToggle = {
  hidden: true,
  setAttribute: (name, value) => { previewAttributes[name] = value; },
  addEventListener: (name, callback) => { if (name === "click") onPreviewClick = callback; },
  getBoundingClientRect: () => ({ top: -100, bottom: -50 }),
  scrollIntoView: () => { previewScrollRestored = true; },
};
const previewNodes = {
  ".certificate-grid": { querySelectorAll: () => previewCards },
  "[data-certificates-toggle]": previewToggle,
  "[data-certificates-label]": previewLabel,
  "[data-certificates-status]": previewStatus,
};
vm.runInNewContext(motion, {
  document: {
    readyState: "complete", body: { dataset: {} },
    querySelectorAll: () => [],
    querySelector: (selector) => previewNodes[selector] || null,
  },
  window: { innerHeight: 844 },
});
assert.equal(previewCards.filter((card) => !card.hidden).length, 3);
assert.equal(previewToggle.hidden, false);
assert.equal(previewAttributes["aria-expanded"], "false");
assert.equal(previewLabel.textContent, "View all 15 certificates");
assert.equal(previewStatus.textContent, "Showing 3 of 15 certificates");
onPreviewClick();
assert.equal(previewCards.filter((card) => !card.hidden).length, 15);
assert.equal(previewAttributes["aria-expanded"], "true");
assert.equal(previewStatus.textContent, "Showing all 15 certificates");
onPreviewClick();
assert.equal(previewCards.filter((card) => !card.hidden).length, 3);
assert.equal(previewAttributes["aria-expanded"], "false");
assert.ok(previewScrollRestored, "Collapse keeps the control in view");

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
assert.equal(ids.length, new Set(ids).size, "No duplicate element IDs");
for (const [, anchor] of html.matchAll(/href="#([^"]+)"/g)) {
  assert.ok(ids.includes(anchor), `Anchor #${anchor} resolves`);
}
console.log("homepage tests passed: red/black palette, original-colour photography, 7 founder cards, 15 certificates with Mr. Asia/Mr. India/black belt previews, motion/fallback hooks, BMI/menu, FAQ and anchors");
