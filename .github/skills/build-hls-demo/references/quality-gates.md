# Quality Gates

## Automated

Run:

```powershell
npm run check:demos
npm run build
```

Both must pass. Browser console errors are failures.

## Behavior

- Primary result is reachable in three interactions.
- One credible exception, empty, low-confidence, or error path is demonstrable.
- Working, success, failure, and reset states are deterministic.
- Every visible action works; no control is decorative by accident.
- Refresh starts from a coherent state.

## Responsive Visual Review

Capture full-page screenshots at 375x812, 768x1024, 1280x800, and 1920x1080. At each viewport verify no page-level horizontal scroll, clipping, overlap, detached labels, unreadable charts, or controls below a practical touch size. The primary object and action must remain obvious.

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
- No network request, secret, sensitive input, customer impersonation, or unsupported outcome claim exists.

## Verdict

Do not call the demo complete while any automated failure, console error, broken primary flow, overlap, keyboard blocker, missing disclosure, or consequential automation without review remains.