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

**For batch comparisons**: Start by reading `batch_summary.json` from the output root for
overview stats and triage data. Then read each `pair-N/report.json` to understand *what
actually changed* — the batch summary only has stats like "+3/-3", not the actual content.
You need the individual reports to write descriptive summaries (e.g. "coordinates format
changed", "climate change model data added"). Read all pair reports upfront — do not wait
for the user to ask.

See **Section 3 → Batch presentation format** for how to present the combined analysis.

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
The raw diff data is the starting point, not the deliverable. Your job is to **interpret**
the changes — explain what they mean, not just list them.

**Connect cause and effect across pages.** If page 4 removes a flood model, and pages 18-20
show major visual changes to maps, say so: "The RMC JFLOW model was removed (page 4), which
explains the map changes on pages 18-20." Don't leave the user to piece it together.

**Explain the significance of values changing.** "AEP values restructured from 1% (+20%) to
50%" is raw data. "The flood scenario modelling was updated from climate-change-adjusted
to baseline probability" is useful. Use the domain glossary.

**Spot data corrections vs content changes.** If "Depth" → "Height" across several pages,
that's likely a labelling fix. If flood level values change by 0.01m, that's a minor
numerical correction. If an entire section appears or disappears, that's a revision.
Distinguish these.

**Recognise inverse substitution patterns.** When one set of pages shows A→B and another
shows B→A for the same values (e.g. "Depth"→"Height" on pages 51-53,
"Height"→"Depth" on pages 54-56), this has two possible interpretations:
- **Reordering**: the Height and Depth data sections swapped positions — same data,
  different sequence
- **Label correction**: the labels were wrong and have been fixed

Don't assume which — present both possibilities unless the surrounding context makes it
clear (e.g. if the actual data values differ, it's a correction; if they're identical,
it's likely a reorder). The report.md flags these as "Inverse substitution patterns".

**Use visual_changes descriptions.** When the report flags a major visual change, check the
`visual_changes` array in report.json for specifics. Colour shifts like "light cyan → light
blue, ~76% of page" tell you the map's colour scheme changed. "Content modified in center
of page" without colour info usually means flood extent boundaries shifted. Surface these
details — "the flood zone colours changed from cyan to blue" is much more useful than
"major visual change (11%)".

**Highlight what's new vs what's different.** Inserted pages with new model data are more
significant than the same page having updated values. Deleted pages suggest content was
removed intentionally — say what was lost.

**Think about what the user needs to know.** A test engineer wants to know: did the right
things change, and did anything change that shouldn't have? A stakeholder wants to know:
is this a minor update or a major revision? Tailor accordingly — lead with the answer,
then support with evidence.

### 3. Present results

#### Single-pair format

For a single comparison, present results in this order:

**Executive summary** — 2-4 sentences: identical or different? What are the substantive
changes? How many pages affected?

**Key changes (substantive only)** — Bullet list of meaningful differences. Include page
numbers and quote actual text where relevant. Group related changes.

**Structural changes** — If pages were inserted, deleted, or reordered.

**Cosmetic / boilerplate changes** — One brief paragraph. Do not list per-page.

**Per-page breakdown (condensed)** — Only noteworthy pages:

| Page | L→R | Type | What changed |
|------|-----|------|-------------|
| 2 | 2→2 | Text | Added "climate change modelled data" to contents |
| 12 | 10→12 | Inserted | New page — flood zone boundary data |
| 15 | 13→15 | Visual | Major layout change, ~31% of page |

#### Batch presentation format

For batch comparisons, use this structure — concise and descriptive, not statistical.

**Batch overview table** — One row per pair, compact:

| Pair | Left | Right | Pages (L→R) | Status |
|------|------|-------|-------------|--------|
| 1 | KR5X8DK129TV | DERA24BD134A | 13→13 | 2 substantive, 3 cosmetic |
| 2 | 9WJYPYV6H68U | FMN8CH6EH72B | 47→54 | 7 inserted, 20 substantive, 27 cosmetic |

Use the reference code from filenames (strip `1a-`/`1b-` prefixes). The Status column is
a short summary of counts — structural first, then substantive, then cosmetic. Follow the
table with one sentence summarising the batch (e.g. "All 3 pairs have substantive changes.
7 pages inserted total, 37 deleted total.").

**Per-pair descriptive summaries** — For each pair, write a short heading and 2-5 sentences
describing *what actually changed*, not just how many lines differed. Be specific — name
the content that was added/removed/modified. Examples of good vs bad:

- Bad: "21 substantive changes, 26 cosmetic, pages 18-20 have major visual changes
  (14-26% pixel diff)"
- Good: "Climate change model data added, RMC JFLOW removed. 7 new pages. Heavy text
  rewrites in the data tables."
- Bad: "Page 1: Substantive text changes (+3/-3). Page 2: Substantive text changes
  (+18/-0)"
- Good: "Page 1: Coordinates format changed (slash removed). Page 2: New 'Information
  that's unavailable' section added — notes no modelled data available"

For each pair:
1. State the nature of the revision in one sentence (minor update / significant revision /
   major restructure)
2. Describe the substantive changes — what content was added, removed, or modified
3. Mention structural changes (inserted/deleted pages) with what they contain
4. Dismiss cosmetic changes in one phrase (e.g. "3 cosmetic pages: date stamp updates")
5. If the pair is complex (many substantive changes), end with a pointer to the HTML
   report for visual inspection

**Do not include** per-page breakdowns, raw diff stats, pixel percentages, cross-pair
pattern analysis, or exhaustive lists of every changed page. Save that detail for when
the user asks about a specific pair.

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
