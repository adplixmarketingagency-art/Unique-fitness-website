// Render the original founder collection into the standalone About page.
// One content source keeps every photograph and certificate in sync.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { renderIcon } from "./icons.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const content = JSON.parse(readFileSync(join(root, "assets/founder-content.json"), "utf8"));
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]));
const markerStart = "<!-- founder collection:start -->";
const markerEnd = "<!-- founder collection:end -->";

export function renderFounder(prefix = "") {
  const visitHref = "/#visit";
  function photo(image, title, extra = "") {
    return `<a class="founder-photo ${extra}" href="${prefix}${escape(image.src)}" data-founder-photo data-photo-title="${escape(title)}" aria-label="View full image: ${escape(title)}">
      <img data-full-photo src="${prefix}${escape(image.src)}" alt="${escape(image.alt)}" width="${image.width}" height="${image.height}" style="--photo-ratio:${image.width} / ${image.height}" loading="lazy">
      <span class="founder-photo__view" aria-hidden="true">View full image <span>${renderIcon("arrow-up-right")}</span></span>
    </a>`;
  }
  const chapters = content.chapters.map((chapter, index) => `
    <li class="founder-stack__item" id="${escape(chapter.id)}" style="--chapter-index:${index + 1}">
      <article class="founder-story-card" data-photo-shape="${chapter.photo.width > chapter.photo.height ? "landscape" : "portrait"}">
        <figure class="founder-story-card__media">
          ${photo(chapter.photo, chapter.title)}
          <figcaption>${escape(chapter.caption)}</figcaption>
        </figure>
        <div class="founder-story-card__copy">
          <span class="founder-story-card__index">0${index + 1} <span>/ 07</span></span>
          <h3>${escape(chapter.title)}</h3>
          <p class="founder-story-card__meta">${escape(chapter.meta)}</p>
          <p>${escape(chapter.description)}</p>
          <p class="founder-story-card__result">${escape(chapter.result)}</p>
        </div>
      </article>
    </li>`).join("");
  const documents = content.certificates.map((certificate) => `
    <li class="founder-document ${certificate.photos.length > 1 ? "founder-document--pair" : ""}">
      <div class="founder-document__media">
        ${certificate.photos.map((image) => photo(image, `${certificate.title} · ${certificate.year}`)).join("")}
      </div>
      <div class="founder-document__copy">
        <span class="founder-document__year">${escape(certificate.year)}</span>
        <h3>${escape(certificate.title)}</h3>
        <p class="founder-document__meta">${escape(certificate.meta)}</p>
        <p>${escape(certificate.description)}</p>
      </div>
    </li>`).join("");

  return `${markerStart}
    <section class="founder-experience" id="founder" aria-labelledby="founder-title">
      <div class="founder-wrap">
        <header class="founder-heading">
          <h2 id="founder-title" data-founder-heading>THE MAN BEHIND<br><span>THE MOVEMENT.</span></h2>
          <div><p>Meet J. Vinoth, the founder of Unique Fitness. From the competition floor to your training floor, this is the work behind the name.</p><a class="founder-text-link" href="#certifications-achievements">Certificates &amp; achievements <span aria-hidden="true">${renderIcon("arrow-up-right")}</span></a></div>
        </header>
        <div class="founder-intro">
          <figure class="founder-intro__portrait">
            ${photo({ src: "assets/images/founder/body-pose.jpg", alt: "J. Vinoth, founder of Unique Fitness, in a bodybuilding pose", width: 1169, height: 1200 }, "J. Vinoth · Founder of Unique Fitness")}
            <figcaption>J. VINOTH · FOUNDER, UNIQUE FITNESS</figcaption>
          </figure>
          <div class="founder-intro__copy">
            <h3>YEARS OF WORK.<br>ONE UNIQUE STORY.</h3>
            <p>Before the gym opened in 2025, there were years of training, competition, and coming back to the floor. The record starts with a Puducherry certificate in 2009 and continues through Mr. India, Mr. Asia, community recognition, and martial arts.</p>
            <p>That discipline is now part of Unique Fitness. The medals tell the history. The gym is where that history becomes useful to someone else.</p>
            <div class="founder-intro__scrapbook">
              <svg class="founder-sketch" viewBox="0 0 220 150" aria-hidden="true"><path d="M15 120C55 10 187 15 171 73 164 100 92 104 92 59S147 3 203 29M183 9l22 19-28 12" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <figure>
                ${photo({ src: "assets/images/founder/achievement-wall.jpg", alt: "The founder's achievement wall and magazine cover inside Unique Fitness Gym", width: 849, height: 1200 }, "The founder’s achievement wall")}
                <figcaption>THE ORIGINAL ACHIEVEMENT WALL.</figcaption>
              </figure>
            </div>
          </div>
        </div>
        <div class="founder-story-heading" id="founder-story">
          <div><h3>BEFORE THE GYM.<br>THERE WAS THE GRIND.</h3><p>Seven original photographs. Seven chapters. Scroll through the story.</p></div>
          <button class="founder-motion-control" type="button" data-founder-toggle aria-pressed="false" hidden>Pause founder motion</button>
        </div>
        <ol class="founder-stack" aria-label="Founder’s story in seven chapters">${chapters}
        </ol>
        <div class="founder-story-footer"><span>THE WORK NEVER STOPS.</span><a class="founder-text-link" href="#certifications-achievements">The record behind the story <span aria-hidden="true">${renderIcon("arrow-down")}</span></a></div>
      </div>
    </section>
    <section class="founder-archive" id="certifications-achievements" aria-labelledby="achievements-title">
      <div class="founder-wrap">
        <header class="founder-heading">
          <h2 id="achievements-title" data-founder-heading>THE WORK.<br><span>ON THE RECORD.</span></h2>
          <div><p>Every original certificate and credential, from 2009 to 2025. Bodybuilding titles, national and international competition, and the latest karate grades.</p><p class="founder-archive__hint">14 original documents · Select any image to read it in full.</p></div>
        </header>
        <ol class="founder-documents" id="founder-documents" aria-label="Certificates and achievements, 2009 to 2025">${documents}
        </ol>
        <div class="founder-archive__controls">
          <p data-certificates-status aria-live="polite"></p>
          <button class="founder-archive__toggle" type="button" data-certificates-toggle aria-expanded="false" aria-controls="founder-documents" hidden>View all 14 certificates</button>
        </div>
        <div class="founder-archive__end"><h3>YOUR CHAPTER<br>STARTS ON THE FLOOR.</h3><a class="founder-text-link" href="${visitHref}">Come train with us <span aria-hidden="true">${renderIcon("arrow-up-right")}</span></a></div>
      </div>
    </section>
    <dialog class="founder-viewer" aria-labelledby="founder-viewer-title" data-founder-viewer>
      <div class="founder-viewer__bar"><p id="founder-viewer-title"></p><button type="button" data-founder-close autofocus aria-label="Close full image">Close <span aria-hidden="true">×</span></button></div>
      <div class="founder-viewer__image"><img data-full-photo src="${prefix}assets/images/founder/body-pose.jpg" alt="" width="1600" height="1600" data-founder-viewer-image></div>
      <div class="founder-viewer__footer"><button type="button" data-founder-previous aria-label="Previous image">${renderIcon("arrow-left")} Previous</button><span data-founder-count aria-live="polite"></span><button type="button" data-founder-next aria-label="Next image">Next ${renderIcon("arrow-right")}</button></div>
    </dialog>
    ${markerEnd}`;
}

export function syncFounder() {
  for (const [file, prefix] of [["about/index.html", "../"]]) {
    const path = join(root, file);
    let html = readFileSync(path, "utf8");
    const start = html.indexOf(markerStart);
    const end = html.indexOf(markerEnd);
    if (start < 0 || end < 0) throw new Error(`Founder markers missing in ${file}`);
    html = html.slice(0, start) + renderFounder(prefix) + html.slice(end + markerEnd.length);
    writeFileSync(path, html);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) syncFounder();
