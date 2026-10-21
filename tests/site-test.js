"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const htmlFiles = [
  "index.html",
  "about/index.html",
  "bmi/index.html",
  "contact/index.html",
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function localPathFromUrl(value, source) {
  if (!value || value.includes("[") || value.startsWith("#") || /^(?:https?:|mailto:|tel:|javascript:|data:)/i.test(value)) {
    return null;
  }

  const cleanValue = value.split("#")[0].split("?")[0];
  if (!cleanValue) {
    return null;
  }

  const base = path.dirname(path.join(root, source));
  return value.startsWith("/")
    ? path.join(root, cleanValue.slice(1))
    : path.resolve(base, cleanValue);
}

function checkHtml(relativePath) {
  const html = read(relativePath);
  assert.match(html, /<!doctype html>/i, `${relativePath} needs a doctype`);
  assert.match(html, /<main\b[^>]*id=["']main-content["']/i, `${relativePath} needs a main landmark`);
  assert.match(html, /<h1\b/i, `${relativePath} needs an h1`);
  assert.match(html, /rel=["']icon["']/i, `${relativePath} needs a favicon`);
  assert.match(html, /rel=["']canonical["']/i, `${relativePath} needs a canonical link`);
  assert.doesNotMatch(html, /assets\/optimized\/[^"']+\.webp/i, `${relativePath} still points to an unoptimized webp`);

  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)) {
    const target = localPathFromUrl(match[1], relativePath);
    if (target) {
      assert.ok(fs.existsSync(target), `${relativePath} references missing ${match[1]}`);
    }
  }

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    assert.match(match[1], /\balt=["'][^"']*["']/i, `${relativePath} has an image without alt text`);
    assert.match(match[1], /\b(?:width|height)=["'][^"']+["']/i, `${relativePath} has an image without intrinsic dimensions`);
  }

  const jsonLd = html.match(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i);
  assert.ok(jsonLd, `${relativePath} needs LocalBusiness JSON-LD`);
  assert.doesNotThrow(() => JSON.parse(jsonLd[1]), `${relativePath} has invalid JSON-LD`);
}

for (const file of htmlFiles) {
  checkHtml(file);
}

const data = read("assets/data.js");
assert.match(data, /Unique Unisex Fitness and Gym/, "data model should use the public listing name");
assert.match(data, /Kumaran Nagar/, "data model should include the supplied address");
assert.match(data, /05:00–22:00/, "data model should include the supplied opening hours");
assert.equal((data.match(/id: "/g) || []).length, 6, "data model should contain six homepage services");

assert.ok(fs.existsSync(path.join(root, ".nvmrc")), "runtime version must be pinned");
assert.ok(fs.existsSync(path.join(root, "package-lock.json")), "lockfile must exist");
assert.ok(fs.existsSync(path.join(root, "Dockerfile")), "Dockerfile must exist");
assert.ok(fs.existsSync(path.join(root, "README.md")), "README must exist");

console.log(`site tests passed: ${htmlFiles.length} HTML pages, local links/assets, JSON-LD, runtime, lockfile, and Docker checks`);
