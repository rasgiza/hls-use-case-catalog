#!/usr/bin/env node
import assert from 'node:assert/strict';
import { validateDemoSource } from './demo-validation.mjs';

const valid = `<!doctype html>
<html lang="en"><head><meta name="viewport" content="width=device-width"><title>Demo</title>
<style>button:focus-visible{outline:2px solid}@media(prefers-reduced-motion:reduce){*{animation:none}}</style></head>
<body><main><p>Illustrative synthetic sample data.</p><button type="button" id="run">Run</button></main>
<script>document.querySelector('#run').addEventListener('click', () => {});</script></body></html>`;

assert.deepEqual(validateDemoSource(valid), []);

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