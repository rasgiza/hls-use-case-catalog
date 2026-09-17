import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

const REQUIRED_PATTERNS = [
  ['HTML5 doctype', /<!doctype html>/i],
  ['document language', /<html[^>]+lang=["'][^"']+["']/i],
  ['responsive viewport', /<meta[^>]+name=["']viewport["']/i],
  ['page title', /<title>[^<]+<\/title>/i],
  ['main landmark', /<main(?:\s|>)/i],
  ['synthetic-data disclosure', /illustrative|synthetic|fictional|sample data/i],
  ['keyboard focus style', /:focus-visible/i],
];

const FORBIDDEN_PATTERNS = [
  ['live network request', /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/],
  ['embedded secret', /(?:api[_-]?key|client[_-]?secret|access[_-]?token)\s*[:=]\s*["'][^"']{8,}/i],
  ['inline event handler', /\son(?:click|change|input|submit|keydown|load)\s*=/i],
  ['placeholder copy', /\b(?:lorem ipsum|todo:|coming soon)\b/i],
];

export function validateDemoSource(source, fileName = 'demo.html') {
  const errors = [];

  for (const [label, pattern] of REQUIRED_PATTERNS) {
    if (!pattern.test(source)) errors.push(`missing ${label}`);
  }

  for (const [label, pattern] of FORBIDDEN_PATTERNS) {
    if (pattern.test(source)) errors.push(`contains ${label}`);
  }

  if (!/<script(?:\s|>)/i.test(source) || !/addEventListener\s*\(/.test(source)) {
    errors.push('missing scripted interaction with addEventListener');
  }

  const hasMotion = /\b(?:animation|transition)\s*:|requestAnimationFrame\s*\(|\.animate\s*\(/i.test(source);
  if (hasMotion && !/prefers-reduced-motion/i.test(source)) {
    errors.push('uses motion without reduced-motion support');
  }

  // Author `display` rules outrank the UA [hidden] rule, so toggling `hidden` silently does nothing.
  if (/<[^>]+\shidden(?:\s|>|=)/i.test(source) && !/\[hidden\]\s*\{[^}]*display\s*:\s*none/i.test(source)) {
    errors.push('uses the hidden attribute without a `[hidden] { display: none !important; }` reset');
  }

  // A table whose rows become grid/flex at a breakpoint still sizes to max-content unless it is un-tabled too.
  for (const media of source.matchAll(/@media[^{]*\{([\s\S]*?)\n  \}/g)) {
    const block = media[1];
    const restyled = [...block.matchAll(/\.([\w-]+)\s+tbody\s+tr\s*\{[^}]*display\s*:\s*(?:grid|flex)/g)].map((m) => m[1]);
    for (const cls of restyled) {
      const untabled = new RegExp(`\\.${cls}(?:\\s*,|\\s+tbody)[^{]*\\{[^}]*display\\s*:\\s*block`).test(block);
      if (!untabled) errors.push(`.${cls} rows switch to grid/flex without setting the table and tbody to display:block`);
    }
  }

  const externalLocalAssets = [...source.matchAll(/(?:src|href)=["'](?!https?:|data:|#|mailto:|tel:)([^"']+)["']/gi)]
    .map((match) => match[1])
    .filter((value) => !/^javascript:/i.test(value));
  if (externalLocalAssets.length) {
    errors.push(`is not self-contained; local assets: ${externalLocalAssets.join(', ')}`);
  }

  const buttonsWithoutType = [...source.matchAll(/<button\b([^>]*)>/gi)]
    .filter((match) => !/\btype\s*=/.test(match[1])).length;
  if (buttonsWithoutType) errors.push(`${buttonsWithoutType} button(s) missing type`);

  return errors.map((message) => `${basename(fileName)}: ${message}`);
}

export function validateDemoFile(filePath) {
  return validateDemoSource(readFileSync(filePath, 'utf8'), filePath);
}