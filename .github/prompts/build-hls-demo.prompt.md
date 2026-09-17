---
name: 'Build HLS Demo'
description: 'Run the complete research, implementation, and independent QA workflow for one self-contained catalog demo, driven by its tracking issue.'
argument-hint: 'Issue number (#123), or a use-case title, ID, or #uc route'
agent: hls-demo-studio
---

Build exactly one self-contained demo artifact using the `build-hls-demo` skill.

If the argument is an issue number, treat that issue as the work order: read it, honour its acceptance criteria, claim it before building, and report back on it when finished. If no issue is given, find the matching tracking issue before starting so parallel contributors are not duplicated.

Resolve the catalog record, prepare the brief, implement the demo, run the executable checks, and hand it to independent QA. Do not batch use cases or broaden into catalog-shell changes.