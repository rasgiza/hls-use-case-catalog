---
name: 'Plan HLS Demo'
description: 'Create a source-grounded brief and acceptance contract for one catalog demo without implementing it.'
argument-hint: 'Use-case title, ID, or #uc route'
agent: hls-demo-researcher
tools: [read, search, web]
---

Resolve exactly one record from `data/catalog.js` for the supplied use case. Follow the `build-hls-demo` skill through the brief stage only.

Return a completed demo brief with catalog facts, assumptions, primary and exception flows, synthetic data plan, trust boundaries, visual direction, technology recommendation, acceptance checks, and source links. Do not create or edit a demo.