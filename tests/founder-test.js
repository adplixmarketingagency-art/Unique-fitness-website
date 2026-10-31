"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const content = JSON.parse(read("assets/founder-content.json"));
const css = read("assets/founder.css");
const js = read("assets/founder.js");
require("./founder-motion-test.js");
const originals = [
  ...content.chapters.map((chapter) => chapter.photo.src),
  ...content.certificates.flatMap((certificate) => certificate.photos.map((photo) => photo.src)),
];

for (const index of [0, 4]) {
  const chapter = content.chapters[index];
  assert.equal(chapter.photo.width, 941, `Card ${index + 1} uses the replacement photo width`);
  assert.equal(chapter.photo.height, 1672, `Card ${index + 1} uses the replacement photo height`);
  for (const page of ["index.html", "about/index.html"]) {
    const card = read(page).split(`id="${chapter.id}"`)[1]?.split("</li>")[0];
    assert.ok(card, `${page} includes replacement card ${index + 1}`);
    assert.ok(card.includes(`href="${page === "about/index.html" ? "../" : ""}${chapter.photo.src}"`), `${page} opens the replacement photo`);
    assert.ok(card.includes(`src="${page === "about/index.html" ? "../" : ""}${chapter.photo.src}"`), `${page} displays the replacement photo`);
    assert.ok(card.includes(`alt="${chapter.photo.alt}"`), `${page} describes the replacement photo`);
    assert.match(card, /width="941" height="1672"/, `${page} preserves the replacement photo dimensions`);
  }
}

const legacyPhoto = content.chapters.find((chapter) => chapter.id === "founder-chapter-2019-legacy").photo;
assert.equal(legacyPhoto.width, 1014, "Legacy portrait width excludes its baked-in white frame");
assert.equal(legacyPhoto.height, 1494, "Legacy portrait height excludes its baked-in white frame");
for (const page of ["index.html", "about/index.html"]) {
  const card = read(page).split('id="founder-chapter-2019-legacy"')[1]?.split("</li>")[0];
  assert.match(card, /width="1014" height="1494"/, `${page} reserves the borderless photo's actual dimensions`);
}

const brownGradeTwo = content.certificates.find((certificate) => certificate.title === "Brown rank, grade two").photos[0];
assert.equal(brownGradeTwo.width, 1414);
assert.equal(brownGradeTwo.height, 1112);
for (const page of ["index.html", "about/index.html"]) {
  const html = read(page);
  const source = `${page === "about/index.html" ? "../" : ""}${brownGradeTwo.src}`;
  assert.ok(html.includes(`href="${source}"`), `${page} opens the replacement Brown Grade II certificate`);
  const image = [...html.matchAll(/<img\b[^>]+>/g)].find(([tag]) => tag.includes(`src="${source}"`))?.[0];
  assert.ok(image, `${page} displays the replacement Brown Grade II certificate`);
  assert.match(image, /width="1414" height="1112"/);
}

assert.equal(content.chapters.length, 7);
assert.equal(content.certificates.length, 15);
assert.equal(originals.length, 22);
assert.equal(new Set(originals).size, 22, "Collection has 22 unique files, including the new black belt certificate");
assert.deepEqual(content.certificates.slice(0, 3).map((certificate) => certificate.photos.map((photo) => path.basename(photo.src))), [
  ["10-mr-asia-2019-merit.png"],
  ["09-senior-national-mr-india-2017.png"],
  ["14-karate-black-belt-2025.webp"],
], "Featured certificates are Mr. Asia, Mr. India, and karate black belt, with one image per card");
for (const directory of ["assets/images/founder/timeline", "assets/images/certificates"]) {
  for (const file of fs.readdirSync(path.join(root, directory)).filter((file) => /\.(?:jpe?g|png|webp)$/i.test(file))) {
    assert.ok(originals.includes(`${directory}/${file}`), `Archive must not omit ${file}`);
  }
}
for (const page of ["about/index.html"]) {
  const html = read(page);
  assert.match(html, /assets\/founder\.css/);
  assert.match(html, /assets\/founder\.js/);
  assert.match(html, /id="founder"/);
  assert.match(html, /id="founder-story"/);
  assert.match(html, /id="certifications-achievements"/);
  assert.match(html, /data-certificates-toggle[^>]*aria-expanded="false"[^>]*aria-controls="founder-documents"/);
  assert.match(html, /data-certificates-status aria-live="polite"/);
  assert.equal((html.match(/data-founder-photo\b/g) || []).length, 24, "Full collection plus two founder introduction photographs");
  const certificateSection = html.split('<ol class="founder-documents"')[1].split("</ol>")[0];
  const documentImages = [...certificateSection.matchAll(/<img[^>]*src="\.\.\/([^"]+)"/g)].map(([, source]) => source);
  assert.deepEqual(documentImages, content.certificates.flatMap((certificate) => certificate.photos.map((photo) => photo.src)), "About archive preserves the content source's featured order");
  assert.match(html, /15 documents · Select any image/);
  assert.match(html, /View all 15 certificates/);
  for (const source of originals) {
    assert.ok(html.includes(source), `${page} includes original ${source}`);
  }
  for (const photo of html.matchAll(/<img\b[^>]+src="[^"]*(?:founder-timeline|Gym-owner|personal-training)[^"]*"[^>]*>/g)) {
    assert.match(photo[0], /data-full-photo/, `${page} person photo preserves its full frame`);
  }
  assert.doesNotMatch(html, /achievement-scroller__track|data-achievement-track/, "No duplicated or unreadable automatic certificate marquee");
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size, `${page} has unique IDs`);
}
assert.match(css, /object-fit: contain/);
assert.doesNotMatch(css, /object-fit:\s*cover/);
assert.match(css, /position: sticky/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /max-width: 680px/);
assert.match(js, /media\.revert\(\)/);
assert.match(js, /unique:motion-change/);
assert.match(js, /dialog\.showModal\(\)/);
assert.match(js, /ArrowRight/);
assert.match(js, /preventScroll: true/);
const body = { dataset: {} };
vm.runInNewContext(js, {
  document: { readyState: "complete", body, querySelector: () => null },
  window: {},
});
assert.equal(body.dataset.founderMotion, "unavailable", "Missing dependencies fail open");

// Exercise the preview/reveal control even without the optional animation library.
const previewCards = Array.from({ length: 15 }, () => ({ hidden: false }));
const previewStatus = { textContent: "" };
const toggleAttributes = {};
let onPreviewClick;
let scrollRestored = false;
const previewToggle = {
  hidden: true,
  setAttribute: (name, value) => { toggleAttributes[name] = value; },
  addEventListener: (name, callback) => { if (name === "click") onPreviewClick = callback; },
  getBoundingClientRect: () => ({ top: -100, bottom: -50 }),
  scrollIntoView: () => { scrollRestored = true; },
};
const previewList = { querySelectorAll: (selector) => selector === "img" ? Array(15) : previewCards };
const previewNodes = {
  "#founder-documents": previewList,
  "[data-certificates-toggle]": previewToggle,
  "[data-certificates-status]": previewStatus,
};
vm.runInNewContext(js, {
  document: {
    readyState: "complete",
    body: { dataset: {} },
    querySelector: (selector) => previewNodes[selector] || null,
    dispatchEvent: () => {},
  },
  window: { innerHeight: 720 },
  CustomEvent: class { constructor(type) { this.type = type; } },
});
assert.equal(previewCards.filter((card) => !card.hidden).length, 3, "Initially show only three certificates");
assert.equal(previewToggle.hidden, false);
assert.equal(toggleAttributes["aria-expanded"], "false");
assert.equal(previewToggle.textContent, "View all 15 certificates");
onPreviewClick();
assert.equal(previewCards.filter((card) => !card.hidden).length, 15, "Show all 15 entries containing 15 images");
assert.equal(toggleAttributes["aria-expanded"], "true");
assert.equal(previewStatus.textContent, "Showing all 15 certificates");
onPreviewClick();
assert.equal(previewCards.filter((card) => !card.hidden).length, 3, "Collapse restores three certificates");
assert.equal(toggleAttributes["aria-expanded"], "false");
assert.ok(scrollRestored, "Collapse keeps the control in view");
console.log("founder tests passed: 22 collection images, 24 full-frame photos per page, ordered certificate previews, stacking, responsive/reduced-motion and accessible viewer");
