"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname, "../assets/founder.js"), "utf8");

function run({ reduced = false, desktop = false, height = 740 } = {}) {
  const body = { dataset: {} };
  const listeners = {};
  const events = {};
  const animations = [];
  const items = [900, 630].map((offsetHeight) => {
    const properties = new Map();
    return {
      offsetHeight,
      style: {
        getPropertyValue: (name) => properties.get(name) || "",
        setProperty: (name, value) => properties.set(name, value),
        removeProperty: (name) => properties.delete(name),
      },
      querySelector: () => ({}),
    };
  });
  const toggle = { setAttribute() {}, addEventListener: (name, fn) => { listeners[name] = fn; } };
  const stack = { addEventListener() {} };
  const nodes = { ".founder-experience": {}, "[data-founder-toggle]": toggle, ".founder-stack": stack };
  let cleanup;
  const ScrollTrigger = {
    addEventListener: (name, fn) => { events[name] = fn; },
    removeEventListener: (name, fn) => { if (events[name] === fn) delete events[name]; },
    refresh() {
      events.refreshInit?.();
      if (!reduced && body.dataset.founderMotion === "running") {
        assert.ok(items.every((item) => item.style.getPropertyValue("position") === "relative"), "Refresh measures unstuck cards");
      }
      events.refresh?.();
    },
  };
  const gsap = {
    registerPlugin() {},
    matchMedia: () => ({
      revert() { if (cleanup) cleanup(); cleanup = null; },
      add(_queries, callback) { cleanup = callback({ conditions: { desktop, reduced, all: true } }); },
    }),
    from() {},
    to(target, options) { animations.push(options); },
    context(callback) { callback(); return { revert() {} }; },
  };
  vm.runInNewContext(source, {
    document: {
      body, readyState: "complete",
      querySelector: (selector) => nodes[selector] || null,
      querySelectorAll: (selector) => selector === ".founder-stack__item" ? items : [],
      addEventListener() {}, removeEventListener() {},
    },
    window: { gsap, ScrollTrigger, innerHeight: height },
  });
  return { body, items, events, animations, refresh: ScrollTrigger.refresh, click: () => listeners.click() };
}

const mobile = run();
assert.equal(mobile.body.dataset.founderMotion, "running");
assert.equal(mobile.animations.length, 1, "Mobile has the same outgoing-card stack animation as desktop");
assert.equal(mobile.items[0].style.getPropertyValue("--stack-top"), "-192px", "Tall cards can be fully read before stacking");
assert.equal(mobile.items[1].style.getPropertyValue("--stack-top"), "29px", "Short cards stack just below the top");
assert.ok(mobile.items.every((item) => !item.style.getPropertyValue("position")), "Refresh restores sticky CSS");
assert.equal(mobile.animations[0].scrollTrigger.end(), "top 29px", "Stack timing follows the next card's measured inset");
mobile.items[1].offsetHeight = 1000;
mobile.refresh();
assert.equal(mobile.items[1].style.getPropertyValue("--stack-top"), "-292px", "Font/orientation changes remeasure tall cards");
mobile.click();
assert.equal(mobile.body.dataset.founderMotion, "paused");
assert.ok(mobile.items.every((item) => !item.style.getPropertyValue("--stack-top")), "Pause cleans up inline positioning");
assert.equal(Object.keys(mobile.events).length, 0, "No leaked refresh handlers when paused");
mobile.click();
assert.equal(mobile.body.dataset.founderMotion, "running");
assert.equal(Object.keys(mobile.events).length, 2, "Resume creates one pair of refresh handlers");
const reduced = run({ reduced: true });
assert.equal(reduced.body.dataset.founderMotion, "paused");
assert.equal(reduced.animations.length, 0);
assert.equal(Object.keys(reduced.events).length, 0);
assert.equal(run({ desktop: true, height: 1000 }).items[1].style.getPropertyValue("--stack-top"), "90px");
console.log("founder motion tests passed: mobile stacking, tall-card reading, refresh measurements, cleanup, reduced motion");
