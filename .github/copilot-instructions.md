# HLS Use Case Catalog Agent Guide

This repository is a dependency-free static catalog of healthcare and life-sciences sales use cases. Future detailed mock demos belong in `demos/<subvertical-id>/<use-case-id>.html` and should normally be one self-contained HTML file that opens from `file://`.

## Source of truth

- Select use cases from `data/catalog.js`; do not invent catalog identifiers, buyers, problems, value claims, workloads, or discovery questions.
- Use `data/enrichment.js` for canonical Microsoft product names and official documentation links.
- Use `data/demo-scenarios.js` and `assets/demos.js` as realism and interaction references, not as a visual template to clone.
- Do not hand-edit the generated `data/catalog.js` file.

## Demo work

- Each use case has a GitHub issue labelled `demo` that carries its acceptance criteria and target artifact path. Work from that issue, claim it before building, and report results back on it.
- Never overwrite an existing demo artifact; audit it instead.
- Before coding, produce a compact demo brief: user, job, decisive moment, 3-5 step happy path, exception path, proof points, and explicit non-goals.
- Build the actual operational product screen, not a landing page or a generic dashboard.
- Use synthetic, fictional data only. Keep a persistent visible disclosure in every demo.
- Never make live API calls, collect credentials, imply clinical diagnosis, automate an irreversible decision, or claim measured customer outcomes.
- Keep consequential actions simulated and reversible. Show review, confidence, source, audit, and escalation affordances where the scenario calls for them.
- Prefer semantic HTML, modern CSS, and vanilla JavaScript. Add a library only when it materially improves a domain capability and preserve a useful no-network fallback.
- Treat accessibility, responsive behavior, keyboard operation, reduced motion, empty/loading/error states, and realistic interaction depth as acceptance criteria.

## Verification

Run the narrowest relevant checks, then finish demo work with:

```powershell
npm run check:demos
npm run build
```

For UI work, also inspect the rendered artifact at 375, 768, 1280, and 1920 CSS pixels, exercise the primary and exception flows, and check browser console output. A source-only review is not enough.