---
name: 'Audit HLS Demo'
description: 'Run independent pre-presentation QA on one standalone HLS demo without editing it, and report the verdict on its tracking issue.'
argument-hint: 'Demo HTML path or issue number (#123)'
agent: hls-demo-qa
---

Use the `audit-hls-demo` skill. If given an issue number, resolve the artifact path from the issue and check the audit against that issue's acceptance criteria.

Return findings first, evidence from automated and browser checks, the quality matrix, and a `PASS`, `PASS WITH NOTES`, or `FAIL` verdict. Do not modify the demo. Post the verdict as an issue comment when a tracking issue is in scope, and never close the issue yourself.