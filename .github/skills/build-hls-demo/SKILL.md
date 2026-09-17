---
name: build-hls-demo
description: 'Plan and build one realistic self-contained HTML mock demo for an HLS Use Case Catalog record, usually from its GitHub tracking issue. Use whenever asked to prototype, mock, implement, deepen, or create a clickable demo for a provider, payer, pharma, life-sciences, or MedTech catalog use case, or when handed a demo tracking issue number, even when "single HTML" is not stated. Do not use for changing the catalog shell or implementing multiple demos in one pass.'
argument-hint: 'Issue number (#123), use-case title, ID, or #uc route'
---

# Build HLS Demo

Create one credible operational demo, not a generic dashboard and not a production healthcare system.

## Procedure

1. Resolve the work order. Given an issue number, read it with `gh issue view <number> --json number,title,body,state,assignees,url` and take the use-case ID, artifact path, and acceptance criteria from it; given a name, find its `demo`-labelled issue first. Then resolve one exact record from `data/catalog.js`. If the request matches several records, ask the user to choose.
2. Check for duplicate effort before building: skip and route to `audit-hls-demo` if the artifact exists, and stop if the issue is closed or assigned to someone else. Otherwise claim it with `gh issue edit <number> --add-assignee @me`.
3. Inspect the matching scenario in `data/demo-scenarios.js`, canonical workload names in `data/enrichment.js`, and the current renderer in `assets/demos.js`. When the demo will name a Microsoft capability, service behaviour, API, or limit that the catalog does not state, confirm it against Microsoft Learn with the Microsoft Learn MCP server (`microsoft_docs_search`, then `microsoft_docs_fetch` for the specific page) rather than writing it from memory.
4. Fill [the demo brief](./assets/demo-brief.template.md). Keep facts, assumptions, and synthetic fixture decisions visibly separate.
5. Read [trust and safety](./references/hls-trust-and-safety.md). For AI, clinical, payment, coverage, safety, or compliance workflows, make review and escalation part of the interaction rather than footer copy.
6. Read [interaction design](./references/interaction-design.md), choose one decisive interaction, and model the happy path plus one credible exception.
7. Consult [the technology radar](./references/technology-radar.md) only after the experience is defined. Native HTML/CSS/JS is the default, not a limitation.
8. Create `demos/<subvertical-id>/<use-case-id>.html`. Start the `<style>` element with [the demo shell](./assets/demo-shell.css) pasted verbatim, set `<body data-subvertical="<subvertical-id>">`, then add layout CSS built from the shared tokens. Keep fixture data, CSS, and JavaScript in the file; no live requests or secrets.
9. Run `npm run check:demos` after the first meaningful edit. Repair contract failures before polishing.
10. Execute [the quality gates](./references/quality-gates.md), including browser screenshots and interaction checks. Repeat only the failing gate after repairs.
11. Report the artifact path, implemented flows, validation evidence, catalog-sourced claims, assumptions, and any remaining risk. When a tracking issue is in scope, post that summary as an issue comment and leave the issue open for the owner to close.

## Non-negotiable outcome

The first viewport identifies the user, operational context, primary object, and next action. The demo must produce a meaningful state change within three interactions and allow reset or replay.

Do not modify catalog records, add a backend, install a framework, overwrite an existing demo, or make multiple demos unless the user explicitly expands scope.