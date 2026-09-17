---
name: audit-hls-demo
description: 'Audit one HLS catalog standalone demo before presentation or merge. Use for demo QA, preflight, review, accessibility checks, responsive checks, synthetic-data review, interaction testing, or "is this demo ready?" requests. Do not use to build a new demo or silently fix findings.'
argument-hint: 'Path to one demo HTML file'
---

# Audit HLS Demo

Review independently and do not edit unless the user separately asks for fixes.

1. Resolve the demo's matching record in `data/catalog.js`; failure to identify exactly one record is blocking.
2. Run `npm run check:demos` and `npm run build`.
3. Read the creation skill's [trust rules](../build-hls-demo/references/hls-trust-and-safety.md) and [quality gates](../build-hls-demo/references/quality-gates.md).
4. Open the artifact from `file://` when possible and capture console output. If browser security prevents testing, use a temporary static server and report that deviation.
5. Exercise the primary flow, exception flow, keyboard flow, and reset. Inspect 375x812, 768x1024, 1280x800, and 1920x1080 screenshots.
6. Compare visible claims, workloads, buyer language, and workflow purpose with the catalog record.
7. Report findings first by severity with reproduction evidence. Then provide a matrix for catalog fidelity, behavior, responsive layout, accessibility, trust/safety, offline behavior, and console.

Use `PASS`, `PASS WITH NOTES`, or `FAIL`. Any broken primary flow, console exception, severe overlap, keyboard blocker, missing synthetic-data disclosure, live data transmission, unsupported outcome claim, or consequential action without human review is `FAIL`.