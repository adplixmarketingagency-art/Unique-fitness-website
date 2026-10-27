"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../assets/grind-motion.js"), "utf8");

// Model GSAP's media-query OR gate: no matching query means no callback.
// This reproduces the touch-phone regression, not just a narrow desktop viewport.
function run({ width = 390, fine = false, reduced = false, hash = "", scrollY = 0 } = {}) {
  const calls = [];
  const listeners = {};
  const body = { dataset: {} };
  const label = { textContent: "" };
  const toggle = {
    hidden: true,
    querySelector: () => label,
    setAttribute: () => {},
    addEventListener: (name, callback) => { listeners[name] = callback; },
  };
  const matches = (query) => query.includes("reduced-motion") ? reduced
    : query.includes("pointer") ? fine
      : width >= Number(query.match(/min-width:\s*(\d+)/)?.[1] || 0);
  const animation = {};
  for (const method of ["set", "from", "fromTo", "to", "paused"]) {
    animation[method] = (...args) => { calls.push({ method, args }); return animation; };
  }
  const gsap = {
    registerPlugin() {},
    matchMedia: () => ({
      revert() {},
      add(queries, callback) {
        const conditions = Object.fromEntries(Object.entries(queries).map(([key, value]) => [key, matches(value)]));
        if (Object.values(conditions).some(Boolean)) callback({ conditions });
      },
    }),
    timeline: (options) => { calls.push({ method: "timeline", args: [options] }); return animation; },
    set: animation.set,
    from: animation.from,
    to: animation.to,
    fromTo: animation.fromTo,
  };
  vm.runInNewContext(source, {
    document: {
      readyState: "complete", body, hidden: false,
      querySelectorAll: () => [],
      querySelector: (selector) => selector === "[data-motion-toggle]" ? toggle : null,
      addEventListener() {}, removeEventListener() {}, dispatchEvent() {},
    },
    window: {
      gsap, scrollY, location: { hash },
      ScrollTrigger: { create() {}, refresh() {} },
      matchMedia: (query) => ({ matches: matches(query), addEventListener() {} }),
    },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } },
  });
  return { body, toggle, label, calls, click: () => listeners.click() };
}
const hasIntro = ({ calls }) => calls.some(({ method, args }) => method === "set" && args[0] === ".hero-intro-brand");
const hasPin = ({ calls }) => calls.some(({ method, args }) => method === "timeline" && args[0]?.scrollTrigger?.pin);

const mobile = run();
assert.equal(mobile.body.dataset.motionStatus, "running");
assert.equal(mobile.toggle.hidden, false);
assert.equal(hasIntro(mobile), true, "Fresh touch-phone loads animate the wordmark");
assert.equal(hasPin(mobile), true, "Phones get the pinned pull-back/fan-out, not a plain fade");
assert.ok(mobile.calls.some(({ method, args }) => method === "from" && args[0] === ".collage-tile--founder img" && args[1].scale >= 1.8), "Mobile founder starts large and pulls back into the mosaic");
assert.ok(mobile.calls.some(({ method, args }) => method === "set" && args[0] === ".seal-ring" && args[1].svgOrigin === "100 100"), "Emblem rotates around the viewBox center, not font-dependent bounds");
mobile.click();
assert.equal(mobile.body.dataset.motionStatus, "paused");
const countBeforeResume = mobile.calls.filter(({ args }) => args[0] === ".hero-intro-brand").length;
mobile.click();
assert.equal(mobile.body.dataset.motionStatus, "running");
assert.equal(mobile.calls.filter(({ args }) => args[0] === ".hero-intro-brand").length, countBeforeResume, "Resume never replays the opening cover");

assert.equal(hasPin(run({ width: 1280, fine: true })), true, "Desktop collage remains pinned");
assert.equal(hasIntro(run({ hash: "#certifications-achievements" })), false, "Deep links skip intro");
assert.equal(hasIntro(run({ scrollY: 500 })), false, "Restored scroll positions skip intro");
const reduced = run({ reduced: true });
assert.equal(reduced.body.dataset.motionStatus, "paused");
assert.equal(reduced.toggle.disabled, true);
assert.equal(reduced.calls.length, 0, "System reduced motion bypasses all motion, including the cover");
console.log("motion tests passed: touch-only mobile, intro, scroll reveals, pause/resume, desktop, deep links, reduced motion");
