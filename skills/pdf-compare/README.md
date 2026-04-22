# PDF Compare

Compare two PDF documents and get a detailed report of text changes, visual/layout differences, and metadata variations.

## Quick Start

```bash
cd skills/pdf-compare
npm install
```

### Drop Zone (easiest)

1. Drop PDFs into the `inbox/` folder
2. Run:

```bash
npm run inbox
```

**Single pair:** Drop 2 PDFs. The file sorted first alphabetically is the original, the second is the revised. Tip: name them `1_original.pdf` and `2_revised.pdf`.

**Batch mode:** Drop 4+ PDFs (even number). Files are sorted alphabetically and paired sequentially — `1a`, `1b`, `2a`, `2b`, etc. Each pair gets its own output subdirectory.

Results land in `inbox/output/`. Single-pair mode auto-opens the HTML report. Batch mode produces a `batch_summary.json` with cross-pair overview and per-pair triage.

### CLI (full control)

```bash
node scripts/compare_pdfs.js --left doc_v1.pdf --right doc_v2.pdf --outdir ./output
```

The output directory will contain:

| File | Description |
|------|-------------|
| `report.html` | Self-contained HTML report — open in a browser for the best experience |
| `report.json` | Machine-readable JSON report |
| `report.md` | Triaged analysis — executive summary, structural changes, key substantive changes with quoted diffs, cosmetic/boilerplate patterns, per-page breakdown |
| `diff_page_*.png` | Visual diff images for each changed page |

Batch mode additionally produces:

| File | Description |
|------|-------------|
| `batch_summary.json` | Cross-pair overview with per-pair triage (structural/substantive/cosmetic counts, global patterns) |
| `pair-N/` | Individual output directories per pair, each containing the files above |

## CLI Options

```
node scripts/compare_pdfs.js [options]
```

| Flag | Default | Description |
|------|---------|-------------|
| `--left <path>` | *(required)* | Path to the first (original) PDF |
| `--right <path>` | *(required)* | Path to the second (revised) PDF |
| `--outdir <path>` | `./pdf-compare-output` | Output directory |
| `--mode <mode>` | `both` | `text`, `visual`, or `both` |
| `--visual-threshold <n>` | `0.01` | Sensitivity for visual diff (0.0–1.0) |
| `--ignore-headers-footers` | off | Strip repeating headers/footers before comparing |
| `--pages <spec>` | all | Page range, e.g. `1-3,7,10-12` |
| `--open` | off | Open the HTML report in your browser after completion |

### Examples

```bash
# Full comparison, auto-open the report
node scripts/compare_pdfs.js \
  --left contract_v1.pdf --right contract_v2.pdf \
  --outdir ./contract-diff --open

# Text-only comparison of pages 1-5
node scripts/compare_pdfs.js \
  --left old.pdf --right new.pdf \
  --mode text --pages 1-5

# Visual-only with higher sensitivity
node scripts/compare_pdfs.js \
  --left design_a.pdf --right design_b.pdf \
  --mode visual --visual-threshold 0.001
```

## Smart Page Matching

When documents have different page counts (e.g. pages were added or removed), the tool automatically aligns pages by content similarity using the Needleman-Wunsch algorithm with Jaccard text similarity scoring. This means:

- **Inserted pages** are detected — new pages added mid-document won't throw off the comparison
- **Deleted pages** are detected — removed pages are flagged without misaligning the rest
- **Matched pages** are correctly paired even when page numbers shift

Each page in the report includes a `match_type` field: `matched`, `inserted`, `deleted`, or `replaced`.

## Change Triage

Every changed page is automatically classified:

- **Structural** — Pages inserted or deleted (document grew/shrank)
- **Substantive** — Meaningful content changes (text diffs, major visual differences)
- **Cosmetic** — Boilerplate updates (dates, copyright lines, page numbers)

Global cosmetic patterns are detected and grouped (e.g. "9 pages: date stamp update") so they don't bury the important changes. The `report.md` leads with what matters — substantive changes with quoted before/after text — and pushes cosmetic noise to the bottom.

## Using with GitHub Copilot

This skill is registered with Copilot. In VS Code chat, just say things like:

- *"Compare these two PDFs: path/to/v1.pdf and path/to/v2.pdf"*
- *"What changed between these document versions?"*
- *"Are these PDFs identical?"*
- *"Diff these documents and open the report"*

Copilot will run the comparison and present the results.

## Project Structure

```
skills/pdf-compare/
├── scripts/                          # Core engine + CLI runners
│   ├── compare_pdfs.js               # CLI orchestrator
│   ├── inbox.js                      # Smart inbox runner (single + batch)
│   ├── extract_text.js               # Text extraction per page (mupdf WASM)
│   ├── render_pages.js               # Page rendering to images (mupdf WASM)
│   ├── diff_images.js                # Pixel-level image comparison (pixelmatch)
│   ├── text_diff.js                  # Unified text diff (LCS-based)
│   ├── page_matcher.js               # Smart page alignment (Needleman-Wunsch + Jaccard)
│   ├── html_report.js                # Self-contained HTML report generator
│   ├── utils.js                      # Shared helpers (report generation, triage, substitution extraction)
│   ├── batch.js                      # Batch comparison runner
│   ├── chain_compare.js              # Chained comparison runner
│   ├── summary.js                    # Report summarization
│   ├── summarize_report.js           # Report summarization helpers
│   └── visual_analyzer.js            # Visual analysis utilities
├── evals/                            # Eval infrastructure (separate from core)
│   ├── run_evals.js                  # Eval runner with findings + consumability grading
│   ├── evals.json                    # Eval definitions (16 scenarios, 167 checks)
│   ├── rubric.md                     # Grading criteria
│   ├── samples/                      # Generated sample PDFs for evals
│   │   └── generate_samples.js       # Sample PDF generator
│   └── iterations/                   # Eval iteration outputs (auto-generated)
├── tests/
│   ├── utils.test.js                 # Unit tests
│   └── integration.test.js           # Integration tests
├── references/
│   ├── OUTPUT_SCHEMA.md              # JSON report schema docs
│   ├── NORMALIZATION_RULES.md
│   └── LIMITATIONS.md
├── SKILL.md                          # Skill definition for Copilot
├── inbox/                            # Drop zone — put PDFs here
└── package.json
```

## Running Tests

```bash
# Unit + integration tests
npm test

# Generate fresh sample PDFs
npm run generate-samples

# Run evals (quality benchmark — 16 scenarios, 167 checks)
npm run eval
```

The eval suite tests three dimensions:
- **Keyword checks** — Report contains expected terms and values
- **Expected findings** — Specific findings are derivable from report data (text diffs, structural changes, metadata, visual presence)
- **Consumability** — Report is useful to an agent: quotable diffs, described inserts/deletes, triage classifications, cosmetic patterns grouped

Evals auto-increment iterations and compare against the previous run.

## Dependencies

All PDF operations use [mupdf](https://mupdf.com/) (WASM) — no system-level dependencies, Python, or native binaries required.

| Package | Purpose |
|---------|---------|
| `mupdf` | PDF text extraction and page rendering (WASM) |
| `pixelmatch` | Pixel-level image comparison |
| `pngjs` | PNG encoding/decoding |
| `commander` | CLI argument parsing |
| `pdf-lib` | Sample PDF generation (dev/test only) |

## Limitations

- Scanned/image-only PDFs have no extractable text — only visual comparison works
- No OCR support — text comparison is skipped for image pages
- Large PDFs are handled with explicit memory management (pixmap disposal, WASM store shrinking every 20 pages, store clearing between batch pairs), but very large documents still use significant memory
- Visual comparison uses rasterisation at 150 DPI — sub-pixel differences may not be detected

See [references/LIMITATIONS.md](references/LIMITATIONS.md) for the full list.
