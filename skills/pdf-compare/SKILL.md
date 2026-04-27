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

### 2. Write the analysis

Read every `report.json` produced in step 1 and write a single `analysis.json` file
to the output directory. This is your interpretation of the raw data — do not just
parrot the diffs. Explain what changed, why it matters, and what to do about it.

**Single pair:** Read `inbox/output/report.json`
**Batch:** Read `inbox/output/batch_summary.json` then each `inbox/output/pair-N/report.json`

Write the file to `inbox/output/analysis.json` with this exact schema:

```json
{
  "batch_summary": "One-paragraph overview of all pairs (batch only, omit for single)",
  "pairs": [
    {
      "pair": 1,
      "left": "filename-a.pdf",
      "right": "filename-b.pdf",
      "verdict": "ROUTINE UPDATE",
      "revision_type": "Annual date roll + minor data correction",
      "summary": "2-4 sentences interpreting what changed and why it matters. Go beyond listing diffs — explain cause and effect, e.g. 'The flood zone boundary shifted 15m north on page 4, likely reflecting the 2025 modelled data update.'",
      "findings": [
        {
          "pages": "4",
          "type": "substantive",
          "finding": "Quote or closely paraphrase the actual text change, e.g. '\"1 in 100\" replaced with \"1 in 75\" in flood risk summary table'",
          "significance": "Explain the domain meaning — what this change means for the reader/stakeholder"
        }
      ],
      "cosmetic_summary": "Brief note on boilerplate/date/formatting changes (or null if none)",
      "recommendation": "Clear action: 'Safe to publish' / 'Check with hydrology team before approving' / etc."
    }
  ]
}
```

**Verdict criteria** — assign exactly one per pair:

| Verdict | When to use |
|---------|-------------|
| `IDENTICAL` | Zero differences (text + visual) |
| `ROUTINE UPDATE` | Only dates, version numbers, cosmetic formatting, or minor typo fixes |
| `NEEDS REVIEW` | Data values changed, new/deleted content, or boundary shifts — but explainable |
| `INVESTIGATE` | Unexpected structural changes, page count differs, or changes contradict stated intent |

**Finding types:** `substantive` (data/content changes), `structural` (added/deleted pages),
`visual` (layout/image changes only).

**Page numbering — CRITICAL:**

The `page` field in report.json is an **alignment position**, not the actual PDF page
number. When documents have different page counts, pages are matched using content
alignment. Each entry has:
- `page` — the alignment position (used for image filenames, use in the `pages` field)
- `left_page` — the actual page number in the left (original) PDF
- `right_page` — the actual page number in the right (revised) PDF

When `left_page ≠ right_page`, **always cite both** in your finding text:
- ✅ "Left page 17 / Right page 18: flood extent map shows updated AEP scenarios"
- ❌ "Page 18: the map was relabelled from tidal to fluvial"

The `pages` field in analysis.json **must use the alignment position** (the `page` value)
because the report generator uses it to locate screenshot images.

**Match quality — avoiding misattribution:**

Check `match_similarity` for each page entry:
- **≥ 0.8**: High confidence — the pages genuinely correspond
- **0.6–0.8**: Moderate — the pages likely correspond but have significant changes
- **< 0.6**: Low confidence — the matcher may have paired **different pages** together
  due to insertions/deletions shifting the alignment

When similarity is low:
- Do NOT describe differences as "relabelling" or "changes" — the two pages may simply
  be different pages that got aligned together
- Check whether the content on `left_page` exists elsewhere in the right document (and
  vice versa) by scanning nearby page entries
- If consecutive pages all have low similarity and show swapped labels (e.g. "tidal" ↔
  "fluvial"), the pages were likely **reordered**, not changed. Say "pages reordered"
  not "page relabelled"
- Note the low match confidence in your finding so reviewers understand the limitation

**Interpretation guidance:**
- Use domain language: "flood zone boundary", "climate change allowance", "return period"
- Distinguish data corrections from content changes
- When values change, state the old → new values
- When pages are inserted/deleted, describe what content was added/removed
- Group related changes (e.g. a date change on every page is one finding, not N findings)
- When pages have been reordered between documents, describe the reordering rather than
  treating each misaligned pair as a content change

**Describing inserted/deleted pages — read `page_text` first:**

Every page entry in report.json has a `page_text` field with the extracted text content.
For inserted and deleted pages, you **MUST** read `page_text` before describing what the
page contains. Never guess or assume — describe only what the text actually says.

- ✅ Read page_text: "New page (right page 11) containing model scenario listing: 'Hythe Streams 2015 — Defences removed climate change modelled fluvial'"
- ❌ Guessing: "New map page added, likely the 'no defences exist tidal' extent map"

For map pages, look for keywords in `page_text` like "modelled tidal extent", "AEP",
"climate change", model names, etc. to accurately describe the map content.

**Reordered pages — describe the actual mapping:**

When describing reordered pages, list the actual left→right page correspondences from
the report data rather than summarising as a simple block move. Check each reordered
entry for `left_page` and `right_page` values. If any individual page within the
reordered block has substantive changes (e.g. visual_score > 2% or different text),
describe that as a separate finding rather than mixing it into the reorder description.

### 3. Generate the HTML report

Run the report generator to produce a self-contained HTML report with your analysis,
verdicts, and side-by-side page screenshots:

```bash
cd skills/pdf-compare && npm run report
```

The report opens in the browser automatically. **After it opens, say:**

> "The analysis report is open in your browser. It covers [N pair(s)] with verdicts,
> interpretation, and side-by-side screenshots for every changed page."

**Do not** reproduce the analysis in chat — the HTML report is the deliverable.

### 4. Output files

- **`analysis_report.html`** — The final deliverable. Self-contained HTML with inline
  images, verdicts, LLM-written analysis, side-by-side page screenshots, and recommendations.
  Opens in the browser automatically.
- `analysis.json` — Structured analysis written by the LLM (step 2)
- `report.json` — Machine-readable raw comparison data (use for follow-up questions)
- `report.md` — Per-pair markdown report
- `batch_summary.json` — Machine-readable batch stats (batch only)
- `left_page_*.png` / `right_page_*.png` — Left and right page renders (embedded in HTML)
- `diff_page_*.png` — Visual diff overlay images (embedded in HTML)

**Smart page matching**: When documents have different page counts, the tool uses
content-based alignment (Needleman-Wunsch algorithm with Jaccard text similarity) to match
pages intelligently. This detects inserted, deleted, and matched pages — even when page
numbers shift.

### 5. Handle follow-up questions

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

### 6. Validate expectations

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
- `html_report.js` — Per-pair HTML report generator with inline base64 diff images
- `generate_report.js` — Renders analysis.json + screenshots into self-contained HTML report
- `utils.js` — Shared helpers (page range parsing, normalization, report writing)

Scripts do the deterministic heavy lifting. Only their outputs come back to the model.
No Python or system-level dependencies are required — PDF operations use `mupdf` (WASM).

### Eval code (in `evals/`)

- `run_evals.js` — Eval runner with diagnosis and iteration comparison

## Eval and Iterate

The eval runner tests the comparison engine and the full skill output pipeline. Use it to
validate changes and iterate on improvements.

### Running evals

```bash
cd skills/pdf-compare && npm run eval
```

This auto-detects the next iteration number and writes results to
`evals/iterations/iteration-N/`. Each iteration produces:

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
- See `gradeReport()` and `gradeBatchSummary()` in `evals/run_evals.js` for all triggers

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
