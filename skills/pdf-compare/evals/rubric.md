# Evaluation Rubric — pdf-compare

## Correctness criteria

### 1. Identical PDFs → no changes
- `summary.identical` must be `true`
- `summary.changed_pages` must be `[]`
- Every page entry must have `text_changed: false` and `visual_changed: false`

### 2. Text-only change → correct page flagged
- Only the page(s) with text differences should have `text_changed: true`
- `text_diff_stats` should report non-zero `insertions` and/or `deletions`
- `visual_changed` may also be `true` on those pages (acceptable, since visual rendering changes too)

### 3. Layout-only change → visual detected, text clean
- Pages with layout changes should have `visual_changed: true`
- Those same pages should have `text_changed: false` (text is the same, just repositioned)
- `visual_score` should be above the threshold

### 4. Page range filtering
- When `--pages` is specified, only those pages should appear in the report
- Pages outside the range must not be included

### 5. Scanned/image pages
- Pages with no extractable text must have a note indicating empty text extraction
- The comparison must not crash; it should gracefully report the limitation

## Output validity

### 6. report.json schema
- Must include `schema_version`, `generated_at`, `left`, `right`, `summary`, `metadata_diff`, `pages`
- `summary.identical` must be a boolean
- `summary.changed_pages` must be an array of integers
- Every page entry must have `page`, `text_changed`, `visual_changed`

### 7. report.md format
- Must include Summary, Per-Page Breakdown table, and Notes & Limitations (when applicable)
- Table must have correct column headers

### 8. Diff images
- When visual changes are detected and mode includes visual, diff PNGs should be produced
- PNGs must be valid image files

## Grading

- **Pass**: Criterion is fully met
- **Partial**: Criterion is mostly met with minor issues
- **Fail**: Criterion is not met or produces incorrect results
