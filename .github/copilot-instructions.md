# Copilot Instructions

## PDF Compare Skill

This workspace contains a PDF comparison skill at `skills/pdf-compare/`.

When the user asks to compare PDFs, diff documents, run the pdf compare, check what changed
between versions, redline documents, or verify if two PDFs are identical, follow the
instructions in `skills/pdf-compare/SKILL.md`.

**Quick reference** (full details in SKILL.md):

```bash
cd skills/pdf-compare && npm run inbox
```

The inbox script auto-detects single pair vs batch and opens the HTML report automatically.

**After every comparison run:** Always read the report and present the full analysis in
chat — triage changes by significance (substantive vs cosmetic), identify patterns across
pages, and lead with what actually matters. See SKILL.md steps 2-3 for full instructions.
- **Single pair:** Read `report.json`
- **Batch:** Read `batch_summary.json` only for the overview — it contains per-pair triage
  data. Only read individual `pair-N/report.json` when the user asks about a specific pair.

**Follow-up questions:** Re-read the relevant JSON from the last comparison — do NOT re-run
the CLI unless the user explicitly asks to change comparison parameters.

**Eval and iterate:** When the user says "run the eval", "iterate on the skill", or
"improve the skill", follow the iteration workflow in SKILL.md § "Eval and Iterate":
```bash
cd skills/pdf-compare && npm run eval
```
Then read `diagnosis.json` from the latest iteration. If there are failures, fix them and
re-run. The eval auto-increments iterations and compares against the previous run.
