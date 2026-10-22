"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Run the site's real entrypoint with controlled browser events and frame time.
function setup({ reduced = false, fine = true } = {}) {
  const hero = new EventTarget();
  const values = new Map();
  const classes = new Set();
  hero.style = {
    setProperty: (key, value) => values.set(key, value),
    removeProperty: (key) => values.delete(key),
  };
  hero.classList = { toggle: (key, enabled) => enabled ? classes.add(key) : classes.delete(key) };
  hero.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1000, height: 800 });
  const document = new EventTarget();
  document.hidden = false;
  document.readyState = "complete";
  document.querySelector = (selector) => selector === ".v-hero" ? hero : null;
  document.querySelectorAll = () => [];
  const motion = new EventTarget();
  motion.matches = reduced;
  const pointer = new EventTarget();
  pointer.matches = fine;
  const frames = new Map();
  let id = 0;
  let time = 0;
  let intersect;
  const window = new EventTarget();
  Object.assign(window, {
    matchMedia: (query) => query.includes("reduced-motion") ? motion : pointer,
    requestAnimationFrame: (callback) => { frames.set(++id, callback); return id; },
    cancelAnimationFrame: (frame) => frames.delete(frame),
    IntersectionObserver: class { constructor(callback) { intersect = callback; } observe() {} },
  });
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../assets/main.js"), "utf8"), {
    window, document, IntersectionObserver: window.IntersectionObserver, performance: { now: () => time },
  });
  const event = (type, fields = {}) => hero.dispatchEvent(Object.assign(new Event(type), fields));
  const tick = (count = 1) => {
    for (let i = 0; i < count; i += 1) {
      time += 16;
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach((callback) => callback(time));
    }
  };
  return {
    event, tick, frames, classes, document, motion,
    x: () => parseFloat(values.get("--glow-x")) || 0,
    intersect: (visible) => intersect?.([{ isIntersecting: visible }]),
  };
}

const scene = setup();
scene.intersect(true);
scene.event("pointermove", { pointerType: "mouse", clientX: 1000, clientY: 800 });
assert.equal(scene.x(), 0, "pointer input must not jump the blobs immediately");
scene.tick();
assert.ok(scene.x() > 0 && scene.x() < 20, "blobs must ease toward the cursor");
scene.tick(150);
assert.ok(scene.x() > 60 && scene.x() <= 100, "cursor movement must remain bounded");
assert.equal(scene.frames.size, 0, "the cursor loop must stop once settled");
scene.event("pointerleave");
scene.tick(150);
assert.equal(scene.x(), 0, "blobs must glide back to centre after pointer leave");
scene.event("pointermove", { pointerType: "touch", clientX: 1000, clientY: 800 });
assert.equal(scene.frames.size, 0, "touch input must not hijack scrolling");
scene.event("pointermove", { pointerType: "mouse", clientX: 1000, clientY: 800 });
scene.tick();
scene.intersect(false);
assert.equal(scene.frames.size, 0, "offscreen motion must stop");
assert.ok(!scene.classes.has("is-glow-active"), "offscreen ambient drift must pause");
scene.intersect(true);
scene.document.hidden = true;
scene.document.dispatchEvent(new Event("visibilitychange"));
assert.equal(scene.frames.size, 0, "hidden tab motion must stop");
scene.document.hidden = false;
scene.document.dispatchEvent(new Event("visibilitychange"));
scene.tick();
scene.motion.matches = true;
scene.motion.dispatchEvent(new Event("change"));
assert.equal(scene.x(), 0, "enabling reduced motion must remove the cursor offset");
assert.equal(scene.frames.size, 0, "enabling reduced motion must cancel pending frames");
assert.ok(!scene.classes.has("is-glow-active"));
const reduced = setup({ reduced: true });
reduced.intersect(true);
reduced.event("pointermove", { pointerType: "mouse", clientX: 1000, clientY: 800 });
assert.equal(reduced.frames.size, 0, "reduced-motion startup must stay static");
const coarse = setup({ fine: false });
coarse.intersect(true);
coarse.event("pointermove", { pointerType: "mouse", clientX: 1000, clientY: 800 });
assert.equal(coarse.frames.size, 0, "coarse pointers must keep the ambient-only fallback");
console.log("hero glow tests passed: smooth cursor tracking, return, lifecycle, touch, reduced motion");
