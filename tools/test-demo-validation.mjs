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
console.log('Demo validator self-test passed.');