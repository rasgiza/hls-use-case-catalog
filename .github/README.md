# HLS Demo Studio Customizations

This workspace customization set supports future standalone mock demos. It does not implement a use case.

## Entry Points

| Need | Use |
| --- | --- |
| Full workflow | Select the **HLS Demo Studio** agent or run `/build-hls-demo #123` |
| Brief only | Run `/plan-hls-demo #123` |
| Repeatable creation procedure | Invoke the `build-hls-demo` skill |
| Independent preflight | Select **HLS Demo QA**, run `/audit-hls-demo`, or invoke `audit-hls-demo` |
| Automatic file rules | `instructions/self-contained-demo.instructions.md` |
| Deterministic checks | `npm run test:harness` |
| Browser render check | `npm run check:render` |

The studio resolves one catalog record, isolates read-only research, builds one artifact, and delegates QA to a separate read-only agent. The `Stop` hook runs the fast demo contract check; it exits successfully while `demos/` does not yet exist.

## Tracking Issues

Each catalog use case has a GitHub issue labelled `demo` plus its subvertical, carrying the catalog facts, acceptance criteria, and target artifact path. The issue is the unit of coordination, so parallel contributors do not collide.

```powershell
npm run issues:preview   # render one sample issue, write nothing
npm run issues:create    # create any missing issues; safe to re-run
```

[tools/demo-issues.mjs](../tools/demo-issues.mjs) generates issue bodies from `data/catalog.js`. It skips use cases whose demo already exists and skips titles already on the repository, so re-running only fills gaps.

Working an issue: claim it by assigning yourself, run `/build-hls-demo #<number>`, post the QA verdict on the issue, and let the owner close it.

## Artifact Convention

Future files use:

```text
demos/
  <subvertical-id>/
    <use-case-id>.html
```

Each file normally contains its own HTML, CSS, JavaScript, and synthetic fixtures. See the `build-hls-demo` references for the full contract and technology decision policy.

## Research Basis

Patterns were adapted, not copied wholesale, from sources reviewed on 2026-09-16:

- [VS Code custom agents](https://code.visualstudio.com/docs/copilot/customization/custom-agents), [skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills), and [hooks](https://code.visualstudio.com/docs/copilot/customization/hooks): frontmatter, scoped tools, progressive loading, and lifecycle enforcement.
- [github/awesome-copilot](https://github.com/github/awesome-copilot): focused agents, prompt-based orchestration, accessibility review, browser QA, anti-generic-UI guidance, and harness engineering with executable checks.
- [anthropics/skills](https://github.com/anthropics/skills): brief-first frontend design, progressive-disclosure skill structure, trigger evals, and reconnaissance-before-action browser testing.
- [Copilot Skills Hub](https://skillshub.space): current cross-vendor discovery patterns and the separation of design, Playwright exploration, screenshots, and harness skills.

External scripts and packages were not installed. Third-party material remains reference input; repository-specific rules and standard-library validation are owned here.

## External Verification

Two MCP servers support this workflow when they are configured:

| Server | Used for |
| --- | --- |
| Microsoft Learn (`microsoftdocs/mcp`) | Confirming a Microsoft capability, standard, plan, or limit before a demo asserts it |
| Playwright (`microsoft/playwright-mcp`) | Interactive browser review during an audit |

Neither is required to build a demo. Without Learn, keep product references at the level the catalog already supports rather than inventing specifics. Without Playwright, `npm run check:render` still covers overflow, clipping, inert `hidden` elements, and console errors through headless Chromium.

## Maintenance

Run `npm run check:customizations` after changing agents, instructions, skills, prompts, hooks, or relative references. Add a validator rule only when it is objective and unlikely to reject a valid demo; keep subjective visual quality in browser review.