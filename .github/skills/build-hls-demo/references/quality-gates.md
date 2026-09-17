# Quality Gates

## Automated

Run:

```powershell
npm run check:demos
npm run check:render
npm run build
```

All three must pass. `check:demos` fails when a demo forks the shared palette: the tokens from [the demo shell](../assets/demo-shell.css), the four `body[data-subvertical]` accent bindings, and a `data-subvertical` attribute matching the folder are all required. `check:render` loads each demo in a headless browser and fails on horizontal overflow, elements that still render despite the `hidden` attribute, text below 4.5:1 contrast (3:1 for large text), and console errors. It skips when no Chromium-based browser is installed, so a manual browser pass is still required in that case.

A scripted DOM harness can verify logic, but it cannot see the CSS cascade or layout. Defects such as an author `display` rule defeating `[hidden]`, a table overflowing at 375 px, or dark ink left on a mid-tone accent fill, only appear in a real render.

## Behavior

- Primary result is reachable in three interactions.
- One credible exception, empty, low-confidence, or error path is demonstrable.
- Working, success, failure, and reset states are deterministic.
- Every visible action works; no control is decorative by accident.
- Refresh starts from a coherent state.

## Responsive Visual Review

Capture full-page screenshots at 375x812, 768x1024, 1280x800, and 1920x1080. At each viewport verify no page-level horizontal scroll, clipping, overlap, detached labels, unreadable charts, or controls below a practical touch size. The primary object and action must remain obvious.

## Visual Identity

The demo must look like a sibling of the demos already in `demos/`, not a separate product. Compare a screenshot against one existing demo and confirm the same app bar treatment (dark `--ink` bar with a 3 px accent rule), the same outlined disclosure pill, the same card, border, and radius language, and the same typography. The subvertical accent is the only colour that should differ.

## Accessibility

- Navigate the whole flow with a keyboard and visible focus.
- Confirm headings and landmarks describe the structure.
- Confirm labels, names, and status announcements are available without visual inference.
- Confirm information is not encoded by color alone.
- Confirm reduced motion suppresses nonessential animation.
- Prefer native semantics; use ARIA only to fill real gaps.

## Trust Review

- Disclosure is persistently visible.
- All data and identities are unmistakably fictional.
- Consequential output has human review and an escalation route.
- Sources, dates, confidence, and generated-versus-approved state are clear where relevant.
- Microsoft product and feature claims trace to the catalog record, `data/enrichment.js`, or a Microsoft Learn page checked through the Microsoft Learn MCP server.
- No network request, secret, sensitive input, customer impersonation, or unsupported outcome claim exists.

## Verdict

Do not call the demo complete while any automated failure, console error, broken primary flow, overlap, keyboard blocker, missing disclosure, or consequential automation without review remains.