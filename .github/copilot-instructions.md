# Copilot Instructions

## PDF Compare Skill

This workspace contains a PDF comparison skill at `skills/pdf-compare/`.

When the user asks to compare PDFs, diff documents, run the pdf compare, check what changed
between versions, redline documents, or verify if two PDFs are identical, follow the
instructions in `skills/pdf-compare/SKILL.md`.

**Quick reference** — three steps, one ask (full details in SKILL.md):

1. Run the comparison:
```bash
cd skills/pdf-compare && npm run inbox
```

2. Read all `report.json` files and write `inbox/output/analysis.json` per the schema in SKILL.md §2.

3. Generate the HTML report:
```bash
cd skills/pdf-compare && npm run report
```

The report opens in the browser automatically. Confirm to the user — do not reproduce
the analysis in chat.

**After every comparison run:** Follow all three steps above. The HTML report is the
deliverable — it contains your written analysis, verdicts, side-by-side screenshots, and
recommendations.

**Follow-up questions:** Re-read the relevant JSON from the last comparison — do NOT re-run
the CLI unless the user explicitly asks to change comparison parameters.

**Eval and iterate:** When the user says "run the eval", "iterate on the skill", or
"improve the skill", follow the iteration workflow in SKILL.md § "Eval and Iterate":
```bash
cd skills/pdf-compare && npm run eval
```
Then read `diagnosis.json` from the latest iteration. If there are failures, fix them and
re-run. The eval auto-increments iterations and compares against the previous run.
