---
name: 'Audit HLS Demo'
description: 'Run independent pre-presentation QA on one standalone HLS demo without editing it.'
argument-hint: 'Path to one demo HTML file'
agent: hls-demo-qa
---

Use the `audit-hls-demo` skill. Return findings first, evidence from automated and browser checks, the quality matrix, and a `PASS`, `PASS WITH NOTES`, or `FAIL` verdict. Do not modify files.