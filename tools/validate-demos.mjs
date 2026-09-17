#!/usr/bin/env node
import { existsSync, readdirSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateDemoFile } from './demo-validation.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const demosRoot = join(root, 'demos');

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return extname(entry.name).toLowerCase() === '.html' ? [path] : [];
  });
}

if (!existsSync(demosRoot)) {
  console.log('Demo validation skipped: demos/ does not exist yet.');
  process.exit(0);
}

const files = htmlFiles(demosRoot);
const errors = files.flatMap(validateDemoFile);

if (errors.length) {
  console.error(`Demo validation failed with ${errors.length} issue(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Validated ${files.length} self-contained demo HTML file(s).`);