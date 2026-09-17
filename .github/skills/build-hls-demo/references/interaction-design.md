# Interaction Design

## Start With Work, Not Widgets

Write one sentence: "When [trigger], [user] needs to [job] so they can [outcome]." The screen should expose the object they act on, evidence needed to decide, and the next safe action. A collection of KPI cards is not a workflow.

Choose the closest operational shape:

| Workflow | Useful shape | Decisive interaction |
| --- | --- | --- |
| Intake / extraction | source beside structured fields | inspect evidence and approve a low-confidence field |
| Assistant / retrieval | conversation beside source context | ask, inspect citation, continue or escalate |
| Review / summarization | source timeline beside editable draft | accept, revise, or reject a grounded section |
| Agentic workflow | work queue plus execution trace | approve a gated step or resolve an exception |
| Matching / scoring | ranked list plus rationale | compare evidence and choose with human review |
| Analytics | trend or cohort view plus drilldown | filter to a signal and inspect underlying records |
| Device / operations | topology, telemetry, or work order | diagnose a signal and simulate a reversible action |

## State Model

Define states before coding: `ready`, `working`, `result`, `exception`, and `reset`. Add `empty` only when the workflow naturally has one. Each transition needs a trigger, visible feedback, and a recovery route.

- Keep the primary outcome reachable in three interactions.
- Use deterministic fixture-driven results so a sales presentation is repeatable.
- Keep labels stable from action to confirmation.
- Use `aria-live="polite"` for asynchronous status text.
- Disable or explain unavailable actions rather than leaving controls inert.
- Preserve user context across panels; do not navigate merely to reveal one detail.

## Visual Direction

Derive the interface from domain artifacts: a claim, chart, protocol, device fleet, prior-authorization packet, safety case, work queue, study timeline, or account plan. Spend distinctiveness on one meaningful element and keep the surrounding chrome disciplined.

Avoid generic generated-UI signatures: decorative hero copy, floating page sections, nested cards, repeated rounded panels, arbitrary gradients, oversized metrics, all-caps micro-labels, and identical reveal animations. Use sentence case and plain operational language.