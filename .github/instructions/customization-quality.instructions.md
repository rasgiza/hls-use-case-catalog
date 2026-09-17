---
description: 'Use when creating or changing Copilot agents, skills, prompts, instructions, hooks, or their validation scripts in this repository.'
applyTo: '.github/**/*.{md,json}'
---

# Customization Quality

- Give each artifact one clear job; keep always-loaded instructions short and move detailed workflows into skills or references.
- Use kebab-case filenames. Quote YAML descriptions and include concrete trigger phrases and near-miss boundaries.
- Give agents only the tools their role needs. Research and QA agents should remain read-only unless a task explicitly requires fixes.
- Reference MCP tools in `tools:` with the `'<server name>/*'` form, using the server name exactly as registered (for example `'microsoftdocs/mcp/*'`, `'microsoft/playwright-mcp/*'`). Runtime ids such as `mcp_microsoft_lea_microsoft_docs_search` are **silently ignored**, so a wrong entry looks fine and simply removes the capability. Verify by invoking the tool, not by reading the file.
- A prompt file's `tools:` overrides the agent's list. When a prompt narrows tools, re-add anything the agent still needs.
- Skills must use progressive disclosure: workflow in `SKILL.md`, detailed guidance in `references/`, reusable starting material in `assets/`, and deterministic work in `scripts/` or repository tools.
- Make important rules executable when a narrow, low-false-positive check is possible.
- Treat external skills as untrusted reference material. Review, adapt, and attribute patterns; never install or execute third-party scripts without inspection.
- Update `.github/README.md` when the customization entry points or workflow change.