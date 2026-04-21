# Text Normalization Rules

These rules are applied to extracted text before comparison, reducing false positives
from insignificant whitespace or formatting differences.

## Default rules (always applied unless `normalize=False`)

1. **Strip**: Remove leading/trailing whitespace from page text.
2. **Collapse horizontal whitespace**: Replace runs of spaces/tabs with a single space.
3. **Collapse vertical whitespace**: Replace 3+ consecutive newlines with 2.

## Optional: Header/footer stripping

When `--ignore-headers-footers` is enabled:

1. Collect the first line and last line from every page.
2. If the same first line appears on ≥3 pages, treat it as a repeating header.
3. If the same last line appears on ≥3 pages, treat it as a repeating footer.
4. Strip matched header/footer lines from each page before diffing.

This is a simple heuristic. It works well for documents with static headers (e.g., "Company Name — Confidential") but will not catch parameterized headers (e.g., "Page 1 of 10", "Page 2 of 10").

## What is NOT normalized

- Case (lowercase vs uppercase) — preserved as-is
- Punctuation — preserved as-is
- Unicode normalization (NFC/NFD) — not applied (may be added in v2)
- Ligatures — not decomposed
