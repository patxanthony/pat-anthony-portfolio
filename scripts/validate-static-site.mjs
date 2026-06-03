import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pages = ["index.html", "pat_anthony_portfolio.html"];
const requiredAssets = [
  "blue-flames-logo-transparent.png",
  "brand-owner.jpg",
  "brand-cesar.webp",
  "brand-gundry.jpg",
  "brand-activatedyou.png",
  "brand-calm.png",
  "brand-skillz.jpeg",
  "brand-savage.webp"
];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const page of pages) {
  assert(fs.existsSync(path.join(root, page)), `Missing page: ${page}`);
  const html = read(page);
  assert(html.includes('id="p-home"'), `${page} is missing Home page section`);
  assert(html.includes('id="p-videos"'), `${page} is missing Portfolio / Featured Work page section`);
  assert(html.includes('id="p-about"'), `${page} is missing About Pat page section`);
  assert(html.includes('id="p-contact"'), `${page} is missing Contact page section`);
  assert(html.includes("Pat Anthony"), `${page} is missing Pat Anthony branding`);

  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1]);
  for (const script of scripts) {
    new Function(script);
  }
}

for (const asset of requiredAssets) {
  assert(fs.existsSync(path.join(root, asset)), `Missing asset: ${asset}`);
}

const html = read("index.html");
const localRefs = [...html.matchAll(/(?:src=|href=)[\"']([^\"']+)[\"']|url\([\"']?([^\"')]+)[\"']?\)/g)]
  .map((match) => match[1] || match[2])
  .filter(Boolean)
  .filter((ref) => !ref.startsWith("#"))
  .filter((ref) => !ref.startsWith("http"))
  .filter((ref) => !ref.startsWith("mailto:"))
  .filter((ref) => !ref.startsWith("data:"))
  .filter((ref) => !ref.includes("&quot;"))
  .map((ref) => ref.split("?")[0]);

const missing = [...new Set(localRefs)].filter((ref) => !fs.existsSync(path.join(root, ref)));
assert(missing.length === 0, `Missing local referenced files: ${missing.join(", ")}`);

console.log("Static site validation passed.");
