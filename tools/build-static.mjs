#!/usr/bin/env node
// Stage the static site into ./dist for Azure Static Web Apps deployment via azd.
// No external dependencies — uses Node fs.cpSync.

import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

const entries = [
  'index.html',
  'providers.html',
  'payers.html',
  'pharma.html',
  'medtech.html',
  'assets',
  'data',
  'demos',
  'staticwebapp.config.json',
];

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

let copied = 0;
for (const name of entries) {
  const src = join(root, name);
  if (!existsSync(src)) continue;
  cpSync(src, join(dist, name), { recursive: true });
  copied++;
}

console.log(`Staged ${copied} top-level entries into ${dist}`);
