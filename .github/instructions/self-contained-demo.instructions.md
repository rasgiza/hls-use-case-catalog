---
description: 'Use when planning, creating, editing, or reviewing standalone HLS catalog mock demos and demo HTML artifacts.'
applyTo: 'demos/**/*.html'
---

# Self-Contained Demo Contract

- One HTML file owns its markup, styles, behavior, and synthetic fixture data.
- The file must work from `file://`; do not use `fetch`, XHR, WebSocket, server routes, secrets, authentication, or persistence beyond optional local UI state.
- Every demo shares one visual identity. Paste `.github/skills/build-hls-demo/assets/demo-shell.css` into the `<style>` element before any demo-specific CSS, and set `<body data-subvertical="...">` to the demo's folder. `npm run check:demos` fails if the shared tokens, the four accent bindings, or the body attribute are missing.
- Do not fork the palette. Build layout with the shared tokens (`--ink`, `--muted`, `--line`, `--bg`, `--surface`, `--surface-2`, `--ok`, `--warn`, `--stop`, `--radius`, `--font`). The accent is owned by the subvertical binding, so never hard-code an accent colour.
- Custom properties resolve where they are declared. An alias such as `--brand: var(--accent-strong)` placed in `:root` freezes the root value and ignores the `body[data-subvertical]` binding. Declare demo-specific aliases in a `body` rule that follows the bindings.
- Text on an accent or status fill must use `var(--on-accent)`. Dark ink on a mid-tone brand fill fails contrast.
- Keep every text and background pairing at 4.5:1, or 3:1 for large text. `npm run check:render` measures this in a real browser and fails the build.
- Use a clear document title, `lang`, responsive viewport, semantic landmarks, native controls, explicit button types, visible `:focus-visible` styles, and `prefers-reduced-motion` handling.
- Use `addEventListener`; do not use inline event attributes or `javascript:` URLs.
- Author `display` rules outrank the user-agent `[hidden]` rule, so toggling the `hidden` attribute silently does nothing. Include `[hidden] { display: none !important; }` whenever the demo uses `hidden`.
- A table whose rows become `display: grid` or `flex` at a breakpoint still sizes to max-content. Set the table and its `tbody` to `display: block` in the same breakpoint, or the page overflows horizontally.
- Stacked labels need block-level boxes. Two inline `<span>` elements run together no matter what margin they carry.
- Keep the synthetic-data disclosure on screen while the page scrolls, for example with a sticky header.
- Keep the primary next action inside the first viewport at 1280x800; do not park it below a long secondary panel.
- Put the workflow's primary object and next action in the first viewport. Operational tools should be dense, calm, and optimized for scanning.
- Cover the happy path plus one credible exception, low-confidence, empty, or error state. All controls shown as actionable must work.
- Give async simulations deterministic timing, an in-progress state, and a clear completion announcement. Avoid fake spinners that never resolve.
- Use a persistent label such as "Illustrative demo - synthetic data." Do not use actual patient, member, trial participant, customer, provider, or employee data.
- Use fictional organizations and unmistakably synthetic identifiers. Do not recreate a real customer's UI or logo.
- Preserve human review for clinical, coverage, payment, safety, compliance, and other consequential decisions.
- Do not present generated text as medical advice or authoritative policy. Show grounding, source, confidence, effective date, and escalation where relevant.
- Derive hard figures only from the selected catalog record; label invented operational values as sample data, not outcomes.
- Keep Microsoft product and feature claims accurate. Use the canonical names in `data/enrichment.js` for the record's workloads. When the demo asserts a capability, service behaviour, API shape, standard, or limit that the catalog does not state, verify it against Microsoft Learn through the **Microsoft Learn MCP server** (`microsoft_docs_search`, `microsoft_docs_fetch`, `microsoft_code_sample_search`) instead of relying on recall.
- If that server is unavailable, keep the reference at the level the catalog supports, or mark the detail as illustrative. Do not state a specific product capability you could not check.
- Avoid generic SaaS card grids, oversized marketing headers, decorative gradients, excessive rounding, all-caps labels, and motion without meaning.
- Keep text readable and contained at all target widths. Avoid horizontal page scrolling and overlapping controls.
- Run `npm run check:demos` and browser-test the primary path at 375, 768, 1280, and 1920 pixels.