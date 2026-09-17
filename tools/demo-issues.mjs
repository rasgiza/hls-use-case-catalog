#!/usr/bin/env node
// Generates one demo-implementation tracking issue per catalog use case.
// Preview by default; pass --create to write to GitHub via the gh CLI.
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const valueOf = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i === -1 ? fallback : args[i + 1];
};

const create = has('--create');
const limit = Number(valueOf('--limit', '0')) || 0;
const repo = valueOf('--repo', 'samueltauil/hls-use-case-catalog');

const SUBVERTICAL_COLORS = {
  'health-providers': '1d76db',
  'health-payers': '0e8a16',
  'pharma-life-sciences': '5319e7',
  medtech: 'b60205',
};

function loadCatalog() {
  const src = readFileSync(join(root, 'data', 'catalog.js'), 'utf8');
  const window = {};
  new Function('window', src)(window);
  return window.CATALOG;
}

function flattenUseCases(catalog) {
  const rows = [];
  for (const sub of catalog.subverticals) {
    for (const stage of sub.stages) {
      for (const uc of stage.useCases) rows.push({ uc, sub, stage });
    }
  }
  return rows;
}

function title({ uc }) {
  return `Demo: ${uc.title} [${uc.subverticalId}]`;
}

function artifactPath({ uc }) {
  return `demos/${uc.subverticalId}/${uc.id}.html`;
}

function alreadyBuilt(row) {
  return existsSync(join(root, artifactPath(row)));
}

function bullets(items) {
  return items && items.length ? items.map((i) => `- ${i}`).join('\n') : '- _None recorded in the catalog._';
}

function body(row) {
  const { uc, sub, stage } = row;
  const artifact = artifactPath(row);
  const risks = (uc.risks || []).map((r) => `- **${r.objection}** — ${r.mitigation}`).join('\n');

  return `Build the realistic, self-contained mock demo for this catalog use case.

## Catalog record

The catalog is the source of truth. Do not edit \`data/catalog.js\` to make a demo easier.

| Field | Value |
| --- | --- |
| Use case ID | \`${uc.id}\` |
| Subvertical | ${sub.name} (\`${uc.subverticalId}\`) |
| Buyer journey stage | ${stage.name} |
| Solution pattern | ${uc.solutionCategory} |
| Primary buyer | ${uc.buyerPrimary} |
| Other stakeholders | ${(uc.buyerStakeholders || []).join(', ') || '—'} |
| Starting motion | ${uc.startingMotion || '—'} |
| Grounding | ${uc.grounding || '—'} |
| Catalog route | \`#uc/${uc.subverticalId}/${uc.id}\` |
| Target artifact | \`${artifact}\` |

### Problem

${uc.problem}

### Business value

> ${uc.businessValue}

Figures in that sentence are the **only** numbers quotable as outcomes in the demo. Every other value must read as fictional operational data.

### Solution pattern

${uc.solutionPatternText}

### Azure workloads

${bullets(uc.azureWorkloads)}

### Discovery questions

Useful for shaping the workflow and the decisive moment.

${bullets(uc.discoveryQuestions)}

### Objections and mitigations

These usually indicate which trust affordances the interface has to show.

${risks || '- _None recorded in the catalog._'}

## Acceptance criteria

- [ ] One self-contained file at \`${artifact}\` that opens from \`file://\`
- [ ] The operational screen the named user actually works in, not a landing page or KPI dashboard
- [ ] First viewport shows user, context, primary object, and next action
- [ ] Happy path reaches a meaningful state change within three interactions
- [ ] One credible exception, low-confidence, empty, or error path
- [ ] Consequential decisions keep a human accountable, with review, rationale, and escalation visible
- [ ] Synthetic fictional data only, with a persistent "Illustrative demo - synthetic data" disclosure
- [ ] Keyboard operable with visible focus; reduced motion respected
- [ ] No network requests, secrets, sensitive input, or real customer impersonation
- [ ] \`npm run check:demos\` and \`npm run build\` pass
- [ ] Reviewed at 375 / 768 / 1280 / 1920 px with no browser console errors

## How to pick this up

1. **Claim it first** — assign yourself and comment, so parallel contributors do not duplicate work.
2. If \`${artifact}\` already exists, run \`/audit-hls-demo\` against it instead of rebuilding.
3. Start the build with this issue as the reference:

   \`\`\`text
   /build-hls-demo #<this issue number>
   \`\`\`

   Brief only, without implementation: \`/plan-hls-demo #<this issue number>\`
4. Post the audit verdict on this issue before closing it.

Contract details live in \`.github/skills/build-hls-demo/\` and \`.github/instructions/self-contained-demo.instructions.md\`.
`;
}

function gh(argv, input) {
  return execFileSync('gh', argv, { input, encoding: 'utf8', maxBuffer: 1024 * 1024 * 32 });
}

// GitHub applies a secondary rate limit to rapid issue creation, so pace the writes.
function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function ensureLabels() {
  const specs = [
    ['demo', '0366d6', 'Realistic self-contained mock demo for a catalog use case'],
    ...Object.entries(SUBVERTICAL_COLORS).map(([id, color]) => [id, color, `Use case in the ${id} subvertical`]),
  ];
  for (const [name, color, description] of specs) {
    gh(['label', 'create', name, '--repo', repo, '--color', color, '--description', description, '--force']);
  }
  console.log(`Ensured ${specs.length} labels on ${repo}.`);
}

function existingTitles() {
  const raw = gh(['issue', 'list', '--repo', repo, '--state', 'all', '--limit', '1000', '--json', 'title']);
  return new Set(JSON.parse(raw).map((i) => i.title));
}

const catalog = loadCatalog();
let rows = flattenUseCases(catalog);

const titles = rows.map(title);
const duplicates = titles.filter((t, i) => titles.indexOf(t) !== i);
if (duplicates.length) {
  console.error('Refusing to run: duplicate issue titles would be created.');
  [...new Set(duplicates)].forEach((d) => console.error(`- ${d}`));
  process.exit(1);
}

const built = rows.filter(alreadyBuilt);
rows = rows.filter((row) => !alreadyBuilt(row));
if (built.length) {
  console.log(`Skipping ${built.length} use case(s) that already have a demo artifact:`);
  built.forEach((row) => console.log(`- ${artifactPath(row)}`));
  console.log('');
}

if (limit) rows = rows.slice(0, limit);

if (!create) {
  const sample = rows[0];
  console.log(`Catalog: ${catalog.subverticals.length} subverticals, ${flattenUseCases(catalog).length} use cases.`);
  console.log(`Would create ${rows.length} issue(s) on ${repo}.\n`);
  console.log('--- sample title ---');
  console.log(title(sample));
  console.log('\n--- sample body ---');
  console.log(body(sample));
  console.log('--- end sample ---');
  console.log('\nRe-run with --create to write these issues.');
  process.exit(0);
}

ensureLabels();
const seen = existingTitles();
let created = 0;
let skipped = 0;
const failed = [];

for (const row of rows) {
  const issueTitle = title(row);
  if (seen.has(issueTitle)) {
    skipped++;
    continue;
  }
  const argv = ['issue', 'create', '--repo', repo, '--title', issueTitle,
    '--label', 'demo', '--label', row.uc.subverticalId, '--body-file', '-'];
  let url;
  try {
    url = gh(argv, body(row)).trim();
  } catch {
    sleep(10000);
    try {
      url = gh(argv, body(row)).trim();
    } catch (error) {
      failed.push({ title: issueTitle, reason: String(error.stderr || error.message).trim().split('\n')[0] });
      continue;
    }
  }
  created++;
  console.log(`${String(created).padStart(3)} ${url}`);
  sleep(1200);
}

console.log(`\nCreated ${created} issue(s); skipped ${skipped} already present.`);
if (failed.length) {
  console.error(`\n${failed.length} issue(s) failed. Re-run this command to retry only these:`);
  failed.forEach((f) => console.error(`- ${f.title} :: ${f.reason}`));
  process.exit(1);
}
