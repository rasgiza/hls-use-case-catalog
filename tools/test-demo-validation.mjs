#!/usr/bin/env node
import assert from 'node:assert/strict';
import { validateDemoSource } from './demo-validation.mjs';

const IDENTITY = `:root{--ink:#201f1e;--muted:#605e5c;--line:#e1dfdd;--line-soft:#edebe9;--bg:#faf9f8;--surface:#ffffff;--surface-2:#f3f2f1;--radius:8px;}
body[data-subvertical="health-providers"]{--accent:#038387;}
body[data-subvertical="health-payers"]{--accent:#0b6a0b;}
body[data-subvertical="pharma-life-sciences"]{--accent:#8764b8;}
body[data-subvertical="medtech"]{--accent:#ca5010;}`;

const valid = `<!doctype html>
<html lang="en"><head><meta name="viewport" content="width=device-width"><title>Demo</title>
<style>${IDENTITY} button:focus-visible{outline:2px solid}@media(prefers-reduced-motion:reduce){*{animation:none}}</style></head>
<body data-subvertical="medtech"><main><p>Illustrative synthetic sample data.</p><button type="button" id="run">Run</button></main>
<script>document.querySelector('#run').addEventListener('click', () => {});</script></body></html>`;

assert.deepEqual(validateDemoSource(valid, 'demos/medtech/x.html'), []);

const invalid = valid
  .replace('Illustrative synthetic sample data.', 'Production customer record')
  .replace(' type="button"', '')
  .replace('</script>', 'fetch("/api");</script>');
const errors = validateDemoSource(invalid);

assert.ok(errors.some((error) => error.includes('synthetic-data disclosure')));
assert.ok(errors.some((error) => error.includes('button(s) missing type')));
assert.ok(errors.some((error) => error.includes('live network request')));

// A hidden attribute is inert unless the UA rule is restored, because author display rules outrank it.
const hiddenNoReset = valid.replace('<main>', '<main><p class="banner" hidden>x</p>')
  .replace('button:focus-visible{outline:2px solid}', 'button:focus-visible{outline:2px solid}.banner{display:flex}');
assert.ok(validateDemoSource(hiddenNoReset).some((e) => e.includes('hidden attribute without')));
assert.deepEqual(
  validateDemoSource(hiddenNoReset.replace('.banner{display:flex}', '.banner{display:flex}[hidden]{display:none !important}')),
  [],
);

// A table whose rows become grid at a breakpoint overflows unless the table itself stops being a table.
const tableOverflow = valid.replace('<button type="button" id="run">Run</button>',
  '<table class="checks"><tbody><tr><td>a</td></tr></tbody></table><button type="button" id="run">Run</button>')
  .replace('</style>', '@media (max-width: 760px) {\n    .checks tbody tr { display: grid; }\n  }\n</style>');
assert.ok(validateDemoSource(tableOverflow).some((e) => e.includes('display:block')));
assert.deepEqual(
  validateDemoSource(tableOverflow.replace('.checks tbody tr { display: grid; }', '.checks, .checks tbody { display: block; }\n    .checks tbody tr { display: grid; }')),
  [],
);

console.log('Demo validator self-test passed.');