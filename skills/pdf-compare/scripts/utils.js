/**
 * Shared utilities for pdf-compare skill.
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * Parse a page-range spec like '1-3,7,10-12' into sorted 0-based page indices.
 * @param {string|null} spec - Page range string, or null/empty for all pages.
 * @param {number} totalPages - Total pages in the document.
 * @returns {number[]} Sorted array of 0-based page indices.
 */
export function parsePageRange (spec, totalPages) {
  if (!spec || !spec.trim()) {
    return Array.from({ length: totalPages }, (_, i) => i)
  }

  const pages = new Set()
  for (const part of spec.split(',')) {
    const trimmed = part.trim()
    if (!trimmed) continue

    const rangeMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/)
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10)
      const end = parseInt(rangeMatch[2], 10)
      if (start < 1 || end > totalPages || start > end) {
        throw new Error(`Invalid page range '${trimmed}' for document with ${totalPages} pages`)
      }
      for (let i = start - 1; i < end; i++) pages.add(i)
    } else if (/^\d+$/.test(trimmed)) {
      const p = parseInt(trimmed, 10)
      if (p < 1 || p > totalPages) {
        throw new Error(`Page ${p} out of range (document has ${totalPages} pages)`)
      }
      pages.add(p - 1)
    } else {
      throw new Error(`Malformed page spec: '${trimmed}'`)
    }
  }
  return [...pages].sort((a, b) => a - b)
}

/**
 * Normalize extracted text.
 */
export function normalizeText (text, { collapseWhitespace = true, strip = true } = {}) {
  if (strip) text = text.trim()
  if (collapseWhitespace) {
    text = text.replace(/[ \t]+/g, ' ')
    text = text.replace(/\n{3,}/g, '\n\n')
  }
  return text
}

/**
 * Heuristically detect repeating header/footer lines across pages.
 * @returns {{ header: string|null, footer: string|null }}
 */
export function detectRepeatingHeaderFooter (pages, threshold = 3) {
  if (pages.length < threshold) return { header: null, footer: null }

  const firstLines = []
  const lastLines = []
  for (const page of pages) {
    const lines = page.trim().split('\n')
    if (lines.length) {
      firstLines.push(lines[0].trim())
      lastLines.push(lines[lines.length - 1].trim())
    }
  }

  return {
    header: mostCommon(firstLines, threshold),
    footer: mostCommon(lastLines, threshold),
  }
}

function mostCommon (items, minCount) {
  if (!items.length) return null
  const counts = {}
  for (const item of items) {
    counts[item] = (counts[item] || 0) + 1
  }
  let best = null
  let bestCount = 0
  for (const [value, count] of Object.entries(counts)) {
    if (count > bestCount) { best = value; bestCount = count }
  }
  return bestCount >= minCount ? best : null
}

/**
 * Remove detected header/footer lines from page text.
 */
export function stripHeaderFooter (text, header, footer) {
  const lines = text.split('\n')
  if (header && lines.length && lines[0].trim() === header) lines.shift()
  if (footer && lines.length && lines[lines.length - 1].trim() === footer) lines.pop()
  return lines.join('\n')
}

export const REPORT_SCHEMA_VERSION = '1.0.0'

// Patterns that indicate cosmetic-only changes
const COSMETIC_PATTERNS = [
  /^[-+]©.*copyright.*\d{4}/i,
  /^[-+]\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/i,
  /^[-+]Page\s+\d+/i,
  /^[-+]\s*$/,
  /^[-+]•\s*$/,
  /^[-+]Customer reference number:/i,
  /^[-+]Document created on:/i,
]

/**
 * Classify a page's text diffs as cosmetic or substantive.
 * Returns true if ALL meaningful diff lines match cosmetic patterns.
 */
function isOnlyCosmetic (diffLines) {
  if (!diffLines || diffLines.length === 0) return true
  const meaningful = diffLines.filter(l =>
    (l.startsWith('+') || l.startsWith('-')) &&
    !l.startsWith('--- ') && !l.startsWith('+++ ')
  )
  if (meaningful.length === 0) return true
  return meaningful.every(line => COSMETIC_PATTERNS.some(pat => pat.test(line)))
}

/**
 * Normalize a diff line for signature comparison.
 * Strips page numbers, dates, reference numbers so similar boilerplate groups together.
 */
function normalizeDiffLine (line) {
  return line
    .replace(/Page\s+\d+/gi, 'Page N')
    .replace(/\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/gi, 'DD Mon YYYY')
    .replace(/\d{4}(?=\.\s|,\s|\s)/g, 'YYYY')
    .replace(/[A-Z0-9]{8,}/g, 'REF')
    .replace(/OS \d+|AC\d+/g, 'LICENCE')
}

/**
 * Auto-triage pages into structural, substantive, and cosmetic categories.
 */
function triagePages (pageResults) {
  const structural = []
  const substantive = []
  const cosmetic = []

  // Detect global patterns (same normalized change on many pages)
  const diffSignatures = new Map()
  for (const p of pageResults) {
    if (!p.text_diff_lines) continue
    const meaningful = p.text_diff_lines.filter(l =>
      (l.startsWith('+') || l.startsWith('-')) &&
      !l.startsWith('--- ') && !l.startsWith('+++ ')
    )
    if (meaningful.length === 0) continue
    const sig = meaningful.map(normalizeDiffLine).sort().join('|')
    if (!diffSignatures.has(sig)) diffSignatures.set(sig, [])
    diffSignatures.get(sig).push(p.page)
  }

  // Signatures appearing on 3+ pages are "global" (likely boilerplate)
  const globalPatterns = []
  for (const [sig, pages] of diffSignatures) {
    if (pages.length >= 3 && sig) {
      const lines = sig.split('|').slice(0, 4)
      globalPatterns.push({ pattern: lines, pages, count: pages.length })
    }
  }

  for (const p of pageResults) {
    if (!p.text_changed && !p.visual_changed) continue

    if (p.match_type === 'inserted' || p.match_type === 'deleted') {
      structural.push({
        page: p.page,
        type: p.match_type,
        left_page: p.left_page ?? null,
        right_page: p.right_page ?? null,
        reason: p.match_type === 'inserted'
          ? `New page inserted (R${p.right_page})`
          : `Page removed (L${p.left_page})`,
      })
    } else if (p.visual_changed && p.visual_score > 0.05) {
      // Major visual change = substantive
      substantive.push({
        page: p.page,
        left_page: p.left_page ?? null,
        right_page: p.right_page ?? null,
        reason: `Major visual change (${(p.visual_score * 100).toFixed(1)}% pixels differ)`,
      })
    } else if (p.text_changed && !isOnlyCosmetic(p.text_diff_lines)) {
      substantive.push({
        page: p.page,
        left_page: p.left_page ?? null,
        right_page: p.right_page ?? null,
        reason: `Substantive text changes (+${p.text_diff_stats?.insertions || 0}/-${p.text_diff_stats?.deletions || 0})`,
      })
    } else {
      cosmetic.push(p.page)
    }
  }

  return { structural, substantive, cosmetic, global_patterns: globalPatterns }
}

/**
 * Build the report.json structure.
 */
export function buildReport ({ leftPath, rightPath, leftPageCount, rightPageCount, metadataDiff, pageResults }) {
  const changedPages = pageResults
    .filter(p => p.text_changed || p.visual_changed)
    .map(p => p.page)

  // Auto-triage pages into categories
  const triage = triagePages(pageResults)

  return {
    schema_version: REPORT_SCHEMA_VERSION,
    generated_at: new Date().toISOString(),
    left: leftPath,
    right: rightPath,
    summary: {
      identical: changedPages.length === 0,
      left_page_count: leftPageCount,
      right_page_count: rightPageCount,
      page_count_match: leftPageCount === rightPageCount,
      changed_pages: changedPages,
      total_changed: changedPages.length,
    },
    triage,
    metadata_diff: metadataDiff,
    pages: pageResults,
  }
}

/**
 * Write report.json to the output directory.
 */
export function writeJsonReport (report, outdir) {
  fs.mkdirSync(outdir, { recursive: true })
  const filePath = path.join(outdir, 'report.json')
  fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf-8')
  return filePath
}

/**
 * Walk a unified diff's lines and extract paired substitutions and lone adds/removes.
 * Adjacent -/+ runs are paired into substitutions.
 */
function extractSubstitutions (diffLines) {
  const results = []
  let i = 0
  while (i < diffLines.length) {
    const line = diffLines[i]
    if (line.startsWith('--- ') || line.startsWith('+++ ')) { i++; continue }
    if (line.startsWith('-')) {
      // Collect consecutive - lines
      const removed = []
      while (i < diffLines.length && diffLines[i].startsWith('-') && !diffLines[i].startsWith('--- ')) {
        removed.push(diffLines[i].slice(1).trim())
        i++
      }
      // Collect consecutive + lines that follow
      const added = []
      while (i < diffLines.length && diffLines[i].startsWith('+') && !diffLines[i].startsWith('+++ ')) {
        added.push(diffLines[i].slice(1).trim())
        i++
      }
      // Pair them
      const maxPairs = Math.max(removed.length, added.length)
      for (let j = 0; j < maxPairs; j++) {
        if (j < removed.length && j < added.length) {
          results.push({ type: 'substitution', removed: removed[j], added: added[j] })
        } else if (j < removed.length) {
          results.push({ type: 'removed', text: removed[j] })
        } else {
          results.push({ type: 'added', text: added[j] })
        }
      }
    } else if (line.startsWith('+')) {
      results.push({ type: 'added', text: line.slice(1).trim() })
      i++
    } else {
      i++ // context line
    }
  }
  return results
}

/**
 * Write report.md to the output directory.
 */
export function writeMarkdownReport (report, outdir) {
  fs.mkdirSync(outdir, { recursive: true })
  const s = report.summary
  const triage = report.triage || {}
  const pages = report.pages || []
  const lines = []

  lines.push('# PDF Comparison Report\n')
  lines.push(`**Left:** \`${path.basename(report.left)}\`  `)
  lines.push(`**Right:** \`${path.basename(report.right)}\`  `)
  lines.push(`**Generated:** ${report.generated_at}\n`)

  // --- Executive summary ---
  lines.push('## Executive summary\n')
  if (s.identical) {
    lines.push('The documents are **identical** — no text, visual, or structural differences detected.\n')
    if (report.metadata_diff && Object.keys(report.metadata_diff).length) {
      lines.push('Metadata differs (see below), but page content is the same.\n')
    }
  } else {
    const parts = []
    if (s.page_count_match) {
      parts.push(`Both documents have **${s.left_page_count} pages**.`)
    } else {
      parts.push(`The document grew from **${s.left_page_count} to ${s.right_page_count} pages** (${s.right_page_count - s.left_page_count > 0 ? '+' : ''}${s.right_page_count - s.left_page_count}).`)
    }

    const structCount = (triage.structural || []).length
    const subCount = (triage.substantive || []).length
    const cosmCount = (triage.cosmetic || []).length

    if (structCount > 0) {
      const inserted = (triage.structural || []).filter(e => e.type === 'inserted').length
      const deleted = (triage.structural || []).filter(e => e.type === 'deleted').length
      const structParts = []
      if (inserted) structParts.push(`${inserted} new page${inserted > 1 ? 's' : ''} inserted`)
      if (deleted) structParts.push(`${deleted} page${deleted > 1 ? 's' : ''} removed`)
      parts.push(structParts.join(', ') + '.')
    }
    if (subCount > 0) parts.push(`**${subCount} page${subCount > 1 ? 's' : ''}** with substantive changes.`)
    if (cosmCount > 0) parts.push(`${cosmCount} page${cosmCount > 1 ? 's' : ''} with cosmetic-only changes.`)

    lines.push(parts.join(' ') + '\n')
  }

  // --- Metadata ---
  if (report.metadata_diff && Object.keys(report.metadata_diff).length) {
    lines.push('## Metadata changes\n')
    for (const [key, vals] of Object.entries(report.metadata_diff)) {
      lines.push(`- **${key}**: "${vals.left}" → "${vals.right}"`)
    }
    lines.push('')
  }

  if (s.identical) {
    const filePath = path.join(outdir, 'report.md')
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8')
    return filePath
  }

  // --- Structural changes ---
  const structural = triage.structural || []
  if (structural.length > 0) {
    lines.push('## Structural changes\n')
    const inserted = structural.filter(e => e.type === 'inserted')
    const deleted = structural.filter(e => e.type === 'deleted')

    if (inserted.length > 0) {
      lines.push(`**${inserted.length} page${inserted.length > 1 ? 's' : ''} inserted:**\n`)
      for (const e of inserted) {
        const page = pages.find(p => p.page === e.page)
        const content = page?.page_text ? `: ${page.page_text.split('\n')[0].trim()}` : ''
        lines.push(`- Page ${e.page} (right)${content}`)
      }
      lines.push('')
    }
    if (deleted.length > 0) {
      lines.push(`**${deleted.length} page${deleted.length > 1 ? 's' : ''} removed:**\n`)
      for (const e of deleted) {
        const page = pages.find(p => p.page === e.page)
        const content = page?.page_text ? `: ${page.page_text.split('\n')[0].trim()}` : ''
        lines.push(`- Page ${e.page} (left)${content}`)
      }
      lines.push('')
    }
  }

  // --- Substantive changes ---
  const substantive = triage.substantive || []
  if (substantive.length > 0) {
    lines.push('## Key changes (substantive)\n')
    for (const e of substantive) {
      const page = pages.find(p => p.page === e.page)
      const header = `**Page ${e.page}** (L${e.left_page}→R${e.right_page})`

      if (e.reason.includes('visual change')) {
        lines.push(`- ${header} — ${e.reason}`)
      } else {
        // Walk the diff to find adjacent -/+ pairs (actual substitutions)
        const diffLines = page?.text_diff_lines || []
        const changes = extractSubstitutions(diffLines)
        // Filter to substantive only
        const substantiveChanges = changes.filter(c => {
          if (c.type === 'substitution') {
            return !COSMETIC_PATTERNS.some(p => p.test('-' + c.removed)) ||
                   !COSMETIC_PATTERNS.some(p => p.test('+' + c.added))
          }
          const line = c.type === 'added' ? '+' + c.text : '-' + c.text
          return !COSMETIC_PATTERNS.some(p => p.test(line))
        })

        lines.push(`- ${header} — ${e.reason}`)
        // Quote up to 3 substantive changes
        const quotable = []
        for (const c of substantiveChanges.slice(0, 3)) {
          if (c.type === 'substitution') {
            quotable.push(`  - "${c.removed}" → "${c.added}"`)
          } else if (c.type === 'removed') {
            quotable.push(`  - Removed: "${c.text}"`)
          } else {
            quotable.push(`  - Added: "${c.text}"`)
          }
        }
        if (quotable.length > 0) {
          lines.push(...quotable)
        }
      }
    }
    lines.push('')
  }

  // --- Cosmetic / boilerplate ---
  const cosmeticPages = triage.cosmetic || []
  const globalPatterns = triage.global_patterns || []
  if (cosmeticPages.length > 0) {
    lines.push('## Cosmetic / boilerplate changes\n')
    if (globalPatterns.length > 0) {
      for (const gp of globalPatterns) {
        const patternDesc = gp.pattern
          .map(p => p.replace(/^[-+]/, '').trim())
          .filter(p => p.length > 0)
          .slice(0, 2)
          .join(', ')
        lines.push(`- **${gp.count} pages** (${gp.pages.slice(0, 5).join(', ')}${gp.pages.length > 5 ? '...' : ''}): ${patternDesc}`)
      }
    } else {
      lines.push(`${cosmeticPages.length} pages with minor changes: ${cosmeticPages.join(', ')}`)
    }
    lines.push('')
  }

  // --- Per-page breakdown (noteworthy only) ---
  const noteworthy = pages.filter(p => {
    if (p.match_type === 'inserted' || p.match_type === 'deleted') return true
    const isSub = substantive.some(e => e.page === p.page)
    return isSub
  })

  if (noteworthy.length > 0) {
    lines.push('## Per-page breakdown\n')
    lines.push('| Page | L→R | Type | What changed |')
    lines.push('|------|-----|------|-------------|')
    for (const p of noteworthy) {
      const pn = p.page
      if (p.match_type === 'inserted') {
        const desc = p.page_text ? p.page_text.split('\n')[0].trim() : 'New page'
        lines.push(`| ${pn} | —→${p.right_page} | Inserted | ${desc} |`)
      } else if (p.match_type === 'deleted') {
        const desc = p.page_text ? p.page_text.split('\n')[0].trim() : 'Removed'
        lines.push(`| ${pn} | ${p.left_page}→— | Deleted | ${desc} |`)
      } else {
        const sub = substantive.find(e => e.page === pn)
        const type = sub?.reason.includes('visual') ? 'Visual' : 'Text'
        const reason = sub?.reason || ''
        lines.push(`| ${pn} | ${p.left_page}→${p.right_page} | ${type} | ${reason} |`)
      }
    }
    lines.push('')
  }

  // --- Output files ---
  lines.push('## Output files\n')
  lines.push('- **report.html** — Visual diff with inline images (open in browser)')
  lines.push('- report.json — Machine-readable report')
  lines.push('- report.md — This file')
  const diffImages = pages.filter(p => p.diff_image_path)
  if (diffImages.length > 0) {
    lines.push(`- ${diffImages.length} diff image(s) for visually changed pages`)
  }
  lines.push('')

  const filePath = path.join(outdir, 'report.md')
  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8')
  return filePath
}
