# Known Limitations

## Text extraction

- **Scanned / image-only PDFs**: If a page contains only raster images (no embedded text),
  text extraction will return an empty string. The report flags this with a note. OCR is
  not included in v1 — text comparison is skipped for those pages.
- **Complex layouts**: Multi-column layouts, text boxes, and overlapping elements may
  produce extraction artifacts (reordered text, merged columns). This can cause false
  positives in text diff.
- **Embedded fonts with custom encodings**: Some PDFs use non-standard character mappings.
  Extraction may produce garbled text. The visual comparison pipeline is unaffected.

## Visual comparison

- **Rendering fidelity**: Pages are rendered via PyMuPDF (MuPDF) at 150 DPI by default.
  Subtle font rendering differences between PDF engines are below the default threshold
  but may appear at very low thresholds (< 0.005).
- **Color space**: Images are compared in RGB. CMYK-only PDFs are converted to RGB for
  comparison, which may introduce minor color shifts.
- **Transparency / blend modes**: Complex transparency may render differently than in
  Adobe Acrobat. This is a MuPDF limitation.

## Metadata

- Metadata comparison is shallow (string equality on standard PDF info fields). XMP
  metadata streams are not compared in v1.

## Page count mismatch

- When PDFs have different page counts, extra pages are reported as fully changed. Only
  pages present in both documents receive a granular text+visual comparison.

## Performance

- Very large PDFs (500+ pages) may be slow due to full-page rendering. Use `--pages` to
  limit scope if needed.
- Memory usage scales with page count × DPI². Consider lowering DPI for very large docs.

## Not supported in v1

- OCR for scanned pages
- Annotated output PDF with inline highlights
- Form field comparison
- Digital signature comparison
- Incremental / structural PDF diff
