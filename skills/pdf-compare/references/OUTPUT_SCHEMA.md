# Output Schema — report.json

**Schema version:** 1.0.0

## Top-level structure

```json
{
  "schema_version": "1.0.0",
  "generated_at": "2025-01-15T10:30:00+00:00",
  "left": "/path/to/left.pdf",
  "right": "/path/to/right.pdf",
  "summary": { ... },
  "metadata_diff": { ... },
  "pages": [ ... ]
}
```

## `summary` object

| Field | Type | Description |
|-------|------|-------------|
| `identical` | boolean | `true` if no changes found across all dimensions |
| `left_page_count` | integer | Number of pages in left PDF |
| `right_page_count` | integer | Number of pages in right PDF |
| `page_count_match` | boolean | Whether both PDFs have the same page count |
| `changed_pages` | array[int] | 1-based page numbers that have changes |
| `total_changed` | integer | Count of changed pages |

## `metadata_diff` object

A dict keyed by metadata field name. Only fields that differ are included.

```json
{
  "author": { "left": "Alice", "right": "Bob" },
  "modDate": { "left": "D:20240101", "right": "D:20240615" }
}
```

## `pages` array

Each entry represents one compared page:

| Field | Type | Description |
|-------|------|-------------|
| `page` | integer | 1-based page number |
| `text_changed` | boolean \| null | `true` if text differs; `null` if text mode was not run |
| `visual_changed` | boolean \| null | `true` if visual score exceeds threshold; `null` if visual mode was not run |
| `text_diff_stats` | object \| null | `{"insertions": int, "deletions": int}` or `null` |
| `visual_score` | float \| null | Normalized 0.0–1.0 difference score; `null` if visual mode was not run |
| `diff_image_path` | string \| null | Path to diff highlight PNG (only when visual change detected) |
| `notes` | string \| null | Human-readable notes (e.g., "Text extraction empty") |

## Versioning

The `schema_version` field uses semver. Breaking changes increment the major version.
Consumers should check `schema_version` before parsing.
