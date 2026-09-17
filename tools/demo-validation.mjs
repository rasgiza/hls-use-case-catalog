import { readFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';

// Shared visual identity, mirroring assets/styles.css. See
// .github/skills/build-hls-demo/assets/demo-shell.css for the full block.
const IDENTITY_TOKENS = {
  '--ink': '#201f1e',
  '--muted': '#605e5c',
  '--line': '#e1dfdd',
  '--line-soft': '#edebe9',
  '--bg': '#faf9f8',
  '--surface': '#ffffff',
  '--surface-2': '#f3f2f1',
  '--radius': '8px',
};

const SUBVERTICAL_ACCENTS = {
  'health-providers': '#038387',
  'health-payers': '#0b6a0b',
  'pharma-life-sciences': '#8764b8',
  medtech: '#ca5010',
};

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

  // Every demo carries the catalog's identity so the family looks like one product.
  for (const [token, value] of Object.entries(IDENTITY_TOKENS)) {
    const declared = new RegExp(`${token}\\s*:\\s*${value}\\s*;`, 'i').test(source);
    if (!declared) errors.push(`does not declare the shared token ${token}: ${value}`);
  }

  for (const [id, accent] of Object.entries(SUBVERTICAL_ACCENTS)) {
    const bound = new RegExp(`body\\[data-subvertical="${id}"\\][^{]*\\{[^}]*--accent\\s*:\\s*${accent}`, 'i').test(source);
    if (!bound) errors.push(`missing the ${id} accent binding (${accent})`);
  }

  const folder = dirname(fileName).split(/[\\/]/).pop();
  if (SUBVERTICAL_ACCENTS[folder]) {
    const applied = new RegExp(`<body[^>]*data-subvertical="${folder}"`, 'i').test(source);
    if (!applied) errors.push(`body is missing data-subvertical="${folder}" for its folder`);
  }

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