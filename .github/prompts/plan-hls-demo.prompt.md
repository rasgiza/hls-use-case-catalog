---
name: 'Plan HLS Demo'
description: 'Create a source-grounded brief and acceptance contract for one catalog demo, from its tracking issue, without implementing it.'
argument-hint: 'Issue number (#123), or a use-case title, ID, or #uc route'
agent: hls-demo-researcher
tools: [read, search, web, execute]
---

If the argument is an issue number, read it first with `gh issue view <number> --json number,title,body,state,assignees` and take the use-case ID, target artifact path, and acceptance criteria from it. Use the terminal only to read issue data.

Resolve exactly one record from `data/catalog.js` and follow the `build-hls-demo` skill through the brief stage only.

Return a completed demo brief with catalog facts, assumptions, primary and exception flows, synthetic data plan, trust boundaries, visual direction, technology recommendation, acceptance checks, and source links. Do not create or edit a demo, and do not write to the issue.