---
name: build-hls-demo
description: 'Plan and build one realistic self-contained HTML mock demo for an HLS Use Case Catalog record. Use whenever asked to prototype, mock, implement, deepen, or create a clickable demo for a provider, payer, pharma, life-sciences, or MedTech catalog use case, even when "single HTML" is not stated. Do not use for changing the catalog shell or implementing multiple demos in one pass.'
argument-hint: 'Use-case title, ID, or #uc route'
---

# Build HLS Demo

Create one credible operational demo, not a generic dashboard and not a production healthcare system.

## Procedure

1. Resolve one exact record from `data/catalog.js`. If the request matches several records, ask the user to choose.
2. Inspect the matching scenario in `data/demo-scenarios.js`, canonical workload names in `data/enrichment.js`, and the current renderer in `assets/demos.js`.
3. Fill [the demo brief](./assets/demo-brief.template.md). Keep facts, assumptions, and synthetic fixture decisions visibly separate.
4. Read [trust and safety](./references/hls-trust-and-safety.md). For AI, clinical, payment, coverage, safety, or compliance workflows, make review and escalation part of the interaction rather than footer copy.
5. Read [interaction design](./references/interaction-design.md), choose one decisive interaction, and model the happy path plus one credible exception.
6. Consult [the technology radar](./references/technology-radar.md) only after the experience is defined. Native HTML/CSS/JS is the default, not a limitation.
7. Create `demos/<subvertical-id>/<use-case-id>.html`. Keep fixture data, CSS, and JavaScript in the file; no live requests or secrets.
8. Run `npm run check:demos` after the first meaningful edit. Repair contract failures before polishing.
9. Execute [the quality gates](./references/quality-gates.md), including browser screenshots and interaction checks. Repeat only the failing gate after repairs.
10. Report the artifact path, implemented flows, validation evidence, catalog-sourced claims, assumptions, and any remaining risk.

## Non-negotiable outcome

The first viewport identifies the user, operational context, primary object, and next action. The demo must produce a meaningful state change within three interactions and allow reset or replay.

Do not modify catalog records, add a backend, install a framework, or make multiple demos unless the user explicitly expands scope.