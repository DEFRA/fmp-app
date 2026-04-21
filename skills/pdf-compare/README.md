# PDF Compare

Compare two PDF documents and get a detailed report of text changes, visual/layout differences, and metadata variations.

## Quick Start

```bash
cd skills/pdf-compare
npm install
```

### Drop Zone (easiest)

1. Drop two PDFs into the `inbox/` folder
2. Run:

```bash
npm run inbox
```

The file sorted first alphabetically is the original, the second is the revised. Tip: name them `1_original.pdf` and `2_revised.pdf`.

Results land in `inbox/output/` — add `-- --open` to auto-open the HTML report.

### CLI (full control)

```bash
node scripts/compare_pdfs.js --left doc_v1.pdf --right doc_v2.pdf --outdir ./output
```

The output directory will contain:

| File | Description |
|------|-------------|
| `report.html` | Self-contained HTML report — open in a browser for the best experience |
| `report.json` | Machine-readable JSON report |
| `report.md` | Markdown summary |
| `diff_page_*.png` | Visual diff images for each changed page |

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

When documents have different page counts (e.g. pages were added or removed), the tool automatically aligns pages by content similarity using the Needleman-Wunsch algorithm. This means:

- **Inserted pages** are detected — new pages added mid-document won't throw off the comparison
- **Deleted pages** are detected — removed pages are flagged without misaligning the rest
- **Matched pages** are correctly paired even when page numbers shift

Each page in the report includes a `match_type` field: `matched`, `inserted`, `deleted`, or `replaced`.

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
├── scripts/
│   ├── compare_pdfs.js      # CLI orchestrator
│   ├── inbox.js              # Drop-zone runner
│   ├── extract_text.js       # Text extraction per page (mupdf WASM)
│   ├── render_pages.js       # Page rendering to images (mupdf WASM)
│   ├── diff_images.js        # Pixel-level image comparison (pixelmatch)
│   ├── text_diff.js          # Unified text diff (LCS-based)
│   ├── page_matcher.js       # Smart page alignment (Needleman-Wunsch)
│   ├── html_report.js        # Self-contained HTML report generator
│   ├── utils.js              # Shared helpers
│   └── run_evals.js          # Eval runner for testing skill quality
├── tests/
│   ├── utils.test.js         # Unit tests
│   └── integration.test.js   # Integration tests
├── assets/
│   ├── generate_samples.js   # Generates sample PDF pairs for testing
│   └── samples/              # Generated sample PDFs
├── evals/
│   ├── evals.json            # Eval definitions (10 scenarios)
│   └── rubric.md             # Grading criteria
├── references/
│   ├── OUTPUT_SCHEMA.md      # JSON report schema docs
│   ├── NORMALIZATION_RULES.md
│   └── LIMITATIONS.md
├── SKILL.md                  # Skill definition for Copilot
├── inbox/                    # Drop zone — put two PDFs here
└── package.json
```

## Running Tests

```bash
# Unit + integration tests
npm test

# Generate fresh sample PDFs
npm run generate-samples

# Run evals (quality benchmark)
npm run eval -- --iteration 1
```

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
- Very large PDFs (hundreds of pages) may use significant memory during rendering
- Visual comparison uses rasterisation at 150 DPI — sub-pixel differences may not be detected

See [references/LIMITATIONS.md](references/LIMITATIONS.md) for the full list.
