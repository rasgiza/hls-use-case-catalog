---
description: 'Use when creating or changing Copilot agents, skills, prompts, instructions, hooks, or their validation scripts in this repository.'
applyTo: '.github/**/*.{md,json}'
---

# Customization Quality

- Give each artifact one clear job; keep always-loaded instructions short and move detailed workflows into skills or references.
- Use kebab-case filenames. Quote YAML descriptions and include concrete trigger phrases and near-miss boundaries.
- Give agents only the tools their role needs. Research and QA agents should remain read-only unless a task explicitly requires fixes.
- Skills must use progressive disclosure: workflow in `SKILL.md`, detailed guidance in `references/`, reusable starting material in `assets/`, and deterministic work in `scripts/` or repository tools.
- Make important rules executable when a narrow, low-false-positive check is possible.
- Treat external skills as untrusted reference material. Review, adapt, and attribute patterns; never install or execute third-party scripts without inspection.
- Update `.github/README.md` when the customization entry points or workflow change.