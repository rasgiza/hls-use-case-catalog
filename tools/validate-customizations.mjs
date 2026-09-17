#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const githubRoot = join(root, '.github');
const errors = [];

function filesUnder(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

function frontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  return Object.fromEntries(match[1].split(/\r?\n/).flatMap((line) => {
    const field = line.match(/^([a-z][a-z-]*):\s*(.+)$/i);
    return field ? [[field[1], field[2].trim().replace(/^['"]|['"]$/g, '')]] : [];
  }));
}

for (const filePath of filesUnder(githubRoot)) {
  const path = relative(root, filePath).replaceAll('\\', '/');
  const source = readFileSync(filePath, 'utf8');
  const needsFrontmatter = /(?:\.agent\.md|\.instructions\.md|\.prompt\.md|\/SKILL\.md)$/.test(path);

  if (needsFrontmatter) {
    const metadata = frontmatter(source);
    if (!metadata) {
      errors.push(`${path}: missing YAML frontmatter`);
    } else {
      if (!metadata.description) errors.push(`${path}: missing description`);
      if (basename(filePath) === 'SKILL.md') {
        const folder = basename(dirname(filePath));
        if (metadata.name !== folder) errors.push(`${path}: skill name must match folder '${folder}'`);
      }
      if (path.endsWith('.instructions.md') && !metadata.applyTo) {
        errors.push(`${path}: missing applyTo`);
      }
    }
  }

  if (extname(filePath) === '.md') {
    for (const match of source.matchAll(/\[[^\]]+\]\((\.\.?\/[^)#]+)(?:#[^)]+)?\)/g)) {
      const target = resolve(dirname(filePath), match[1]);
      if (!existsSync(target)) errors.push(`${path}: broken relative link ${match[1]}`);
    }
  }

  if (path.startsWith('.github/hooks/') && extname(filePath) === '.json') {
    try {
      const config = JSON.parse(source);
      if (!config.hooks || typeof config.hooks !== 'object') errors.push(`${path}: missing hooks object`);
    } catch (error) {
      errors.push(`${path}: invalid JSON (${error.message})`);
    }
  }
}

if (errors.length) {
  console.error(`Customization validation failed with ${errors.length} issue(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Copilot customization structure and relative links are valid.');