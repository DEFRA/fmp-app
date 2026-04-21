---
name: pdf-compare
description: >
  Compare PDF documents and produce detailed reports of differences — text changes,
  visual/layout changes, and metadata differences.
---

# PDF Compare

Compare two PDF documents and produce a structured report covering text changes,
visual/layout differences, and metadata variations.

## When to use

- User asks to "run the pdf compare", compare PDFs, diff documents, check what changed,
  or any variation of these
- User provides two PDF file paths
- User wants to verify two PDFs are identical

## Workflow

### 1. Run the comparison

Check `skills/pdf-compare/inbox/` for PDFs. If PDFs are present, run immediately:

```bash
cd skills/pdf-compare && npm run inbox
```

The HTML report opens in the browser automatically.

If the inbox is empty, ask the user to drop their PDFs into `skills/pdf-compare/inbox/`
and then run the command above.

The script auto-detects:
- **2 PDFs** → single comparison (1st alphabetically = left/original, 2nd = right/revised)
- **4, 6, 8... PDFs** → batch comparison, paired alphabetically (1st↔2nd, 3rd↔4th, etc.)

Naming tip: use prefixes so pairs sort together: `1a-filename.pdf, 1b-filename.pdf, 2a-filename.pdf, 2b-filename.pdf`

All HTML reports open in the browser automatically. Batch output goes to
`inbox/output/pair-1/`, `pair-2/`, etc. with a `batch_summary.json` at the root.

**Or with explicit paths** (single pair only):

```bash
node skills/pdf-compare/scripts/compare_pdfs.js \
  --left <path_to_first_pdf> \
  --right <path_to_second_pdf> \
  --outdir <output_directory> \
  --mode both \
  --visual-threshold 0.01
```

**CLI options:**

| Flag | Default | Description |
|------|---------|-------------|
| `--left` | (required) | Path to first PDF |
| `--right` | (required) | Path to second PDF |
| `--outdir` | `./pdf-compare-output` | Output directory |
| `--mode` | `both` | `text`, `visual`, or `both` |
| `--visual-threshold` | `0.01` | Sensitivity for visual diff (0.0–1.0) |
| `--ignore-headers-footers` | off | Strip repeating headers/footers |
| `--pages` | all | Page range, e.g. `1-3,7,10-12` |
| `--open` | **on** | Open HTML report in browser (use `--no-open` to suppress) |

### 2. Analyse the report

After running the CLI, **always read `report.json`** from the output directory. Do not just
relay the CLI stdout — that is a one-line summary. Your job is to interpret the data.

**For batch comparisons**: Read **only `batch_summary.json`** from the output root. This
file contains the overview stats and per-pair triage data (structural, substantive, cosmetic,
global patterns) — you do not need to read individual `report.json` files for the overview.

Present a combined analysis:
- Start with the overview stats (how many pairs identical / substantive / cosmetic-only)
- Then a batch table: pair | left | right | pages (L→R) | status | key changes
- For each pair with substantive changes, summarise using `triage_summary` — list structural
  changes (inserted/deleted pages) and substantive changes (with reasons)
- Group cosmetic patterns briefly
- Do NOT read individual `pair-N/report.json` files unless the user asks about a specific pair

#### 2a. Triage changes by significance

Read every page entry and classify changes into tiers:

- **Substantive** — Text insertions/deletions that change meaning (new clauses, removed
  sections, changed values, corrected data). Look at `text_diff_lines` for actual content.
- **Structural** — Pages inserted or deleted (`match_type: "inserted"` / `"deleted"`),
  page count differences, major layout shifts (`visual_changes` mentioning >5% of page).
- **Cosmetic** — Date stamps, copyright year updates, page numbers, reference numbers,
  header/footer tweaks. These are noise — group and summarise, don't list individually.

#### 2b. Identify patterns

Scan across all pages for repeating changes. Common patterns:

- **Global updates**: Same date/reference/copyright changed on every page → mention once
  ("The document date changed from 27 Aug 2025 to 11 Mar 2026 across all pages")
- **Section-specific changes**: Cluster of changes on pages 12-15 → describe as a group
  ("Pages 12-15 contain new flood zone boundary data")
- **Inserted/deleted sections**: Use `match_type` to explain what was added or removed and
  where in the document flow it sits

#### 2c. Summarise what actually matters

Write a plain-English summary aimed at someone who needs to know: *should I care about
this revision?* Lead with the most important changes. Be specific — quote actual text
differences when they are meaningful (e.g. "added 'climate change modelled data' to the
contents list").

### 3. Present results

Always present results in this order:

#### Executive summary

2-4 sentences: Are the documents identical or different? What are the **substantive**
changes? How many pages were affected, and what is the nature of those changes?

#### Key changes (substantive only)

Bullet list of meaningful differences. Include page numbers and quote actual text where
relevant. Group related changes.

#### Structural changes

If pages were inserted, deleted, or reordered — explain what happened and where.

#### Cosmetic / boilerplate changes

One brief paragraph grouping all recurring noise (date changes, reference numbers,
copyright years, page number removals). Do not list these per-page.

#### Per-page breakdown (condensed)

Only include pages where something noteworthy happened. Skip pages that only have
cosmetic/boilerplate changes. Use this format:

| Page | L→R | Type | What changed |
|------|-----|------|-------------|
| 2 | 2→2 | Text | Added "climate change modelled data" to contents |
| 12 | 10→12 | Inserted | New page — flood zone boundary data |
| 15 | 13→15 | Visual | Major layout change, ~31% of page |

#### Output files

- **`report.html`** — Self-contained HTML report with inline diff images, color-coded
  tables, and match type badges. Open in a browser for the best experience.
- `report.json` — Machine-readable report
- `report.md` — Human-readable report
- `diff_page_*.png` — Visual diff images per changed page

**Smart page matching**: When documents have different page counts, the tool uses
content-based alignment (Needleman-Wunsch algorithm with Jaccard text similarity) to match
pages intelligently. This detects inserted, deleted, and matched pages — even when page
numbers shift.

### 4. Handle follow-up questions

When the user asks follow-up questions, **re-read the relevant JSON file** from the output
directory. Do not rely on conversation memory — always re-read the file. Do NOT re-run
the comparison.

**Single comparison follow-ups:**

| User says | What to do |
|-----------|-----------|
| "What changed on page 7?" | Read `report.json`, show `pages[6].text_diff_lines` and `visual_changes` |
| "Were there any text deletions?" | Filter pages where `text_diff_stats.deletions > 0`, summarise |
| "Which pages are new?" | Filter `match_type === "inserted"`, list with content summary |
| "Is the map data different?" | Find pages with map-related content, check visual scores |
| "Summarise for an email" | Write a stakeholder-ready paragraph from the key changes |
| "Compare just the text" | Re-run with `--mode text` — this is the only case to re-run |

**Batch comparison follow-ups:**

| User says | What to do |
|-----------|-----------|
| "Tell me more about pair 3" | Read `pair-3/report.json`, give full per-page analysis |
| "Which pairs had new pages?" | Filter from `batch_summary.json` where `structural_count > 0` |
| "Which pairs had substantive changes?" | Filter where `substantive_count > 0` |
| "What changed on page 7 of pair 2?" | Read `pair-2/report.json`, show that page |
| "Summarise all comparisons for an email" | Produce stakeholder summary from `batch_summary.json` |

**Never re-run the comparison for a follow-up question** unless the user explicitly asks
to change parameters (different mode, different pages, different threshold).

### 5. Validate expectations

If the user states what they expected to change (e.g. "I only updated the date"), actively
check whether the actual differences match. Flag anything unexpected:

> "You mentioned you only updated the date. I can confirm the date changed from
> 27 Aug 2025 to 11 Mar 2026 on all pages. However, I also found: page 2 has a new
> bullet point 'climate change modelled data' added to the contents list, and a typo
> fix ('floodng' → 'flooding'). Were these intentional?"

## Scripts

The `scripts/` directory contains the implementation modules (JavaScript/Node.js):

- `compare_pdfs.js` — CLI orchestrator; calls the other modules and writes reports
- `extract_text.js` — Extracts text per page with normalization options (via mupdf WASM)
- `render_pages.js` — Renders PDF pages to images at a given DPI (via mupdf WASM)
- `diff_images.js` — Compares page images and produces difference scores + highlight PNGs (via pixelmatch)
- `text_diff.js` — Minimal unified diff for text comparison
- `page_matcher.js` — Smart page alignment using Needleman-Wunsch algorithm with Jaccard text similarity
- `html_report.js` — Self-contained HTML report generator with inline base64 diff images
- `utils.js` — Shared helpers (page range parsing, normalization, report writing)
- `run_evals.js` — Eval runner with diagnosis and iteration comparison

Scripts do the deterministic heavy lifting. Only their outputs come back to the model.
No Python or system-level dependencies are required — PDF operations use `mupdf` (WASM).

## Eval and Iterate

The eval runner tests the comparison engine and the full skill output pipeline. Use it to
validate changes and iterate on improvements.

### Running evals

```bash
cd skills/pdf-compare && npm run eval
```

This auto-detects the next iteration number and writes results to
`pdf-compare-workspace/iteration-N/`. Each iteration produces:

- `benchmark.json` — Pass/fail counts per eval, overall pass rate
- `diagnosis.json` — Structured failure analysis with root cause files and next steps

### Iteration workflow

When the user says "iterate on the skill", "run the eval and fix", or "improve the skill":

1. **Run evals**: `npm run eval`
2. **Read `diagnosis.json`** from the latest iteration directory
3. If `status` is `all_passing` — report success, suggest adding more eval cases
4. If `status` is `has_failures`:
   - Read each entry in `failures[]` — it tells you the failing check, evidence,
     and which file + area likely needs fixing
   - Make the fix
   - Re-run evals (`npm run eval` — auto-increments iteration)
   - Read the new `diagnosis.json` — check the `comparison` section for
     regressions vs improvements against the previous iteration
5. Repeat until `status` is `all_passing` or pass rate stops improving

### Adding eval cases

Add new entries to `evals/evals.json`. Each eval needs:
- `id` — unique integer
- `prompt` — the user's question (drives mode/page detection)
- `expected_output` — keywords that trigger specific grading checks
- `files` — PDF paths relative to the skill directory
- `type` — `"batch"` for batch evals (4+ files), omit for single pair

The grading checks are keyword-driven from `expected_output`. Key phrases:
- `"triage"` + `"substantive"` — checks triage.substantive has entries
- `"triage"` + `"structural"` — checks triage.structural has entries
- `"triage"` + `"structural should be empty"` — checks structural is empty
- `"batch_summary.json"` — triggers batch grading (structure, overview, per-pair triage)
- `"report.md should exist"` — checks report.md generation
- See `gradeReport()` and `gradeBatchSummary()` in `run_evals.js` for all triggers

## References

- `references/OUTPUT_SCHEMA.md` — JSON schema for `report.json`
- `references/NORMALIZATION_RULES.md` — Text normalization rules applied before diffing
- `references/LIMITATIONS.md` — Known limitations and edge cases

## Domain Glossary

These documents are Environment Agency flood risk assessments. Use this glossary to
interpret technical terms in comparison results:

| Term | Meaning |
|------|---------|
| AEP | Annual Exceedance Probability — the chance of a flood of a given size in any year. 1% AEP = 1 in 100 year flood |
| Fluvial | Flooding from rivers |
| Tidal | Flooding from the sea / tidal waters |
| Defended | Modelled flood extent assuming existing flood defences are in place |
| Defences removed | Modelled flood extent assuming no flood defences exist |
| Climate change (+Xmm) | Flood scenario with sea level rise or increased rainfall (e.g. +50mm, +95mm, +780mm) |
| Flood Zone 2 | Land with between 0.1% and 1% AEP of river flooding, or 0.1% and 0.5% AEP of sea flooding |
| Flood Zone 3 | Land with 1% or greater AEP of river flooding, or 0.5% or greater AEP of sea flooding |
| Product 4 | Legacy name for this flood risk assessment data package |
| SFRA | Strategic Flood Risk Assessment — local authority level assessment |
| Main river | A river designated by the Environment Agency on the Main River Map |
| FRA | Flood Risk Assessment — required for planning applications in flood risk areas |
| Easting/Northing | UK national grid coordinates (British National Grid / OSGB36) |
