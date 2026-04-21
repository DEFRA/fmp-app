#!/usr/bin/env node
/**
 * CLI orchestrator for PDF comparison.
 *
 * Usage:
 *   node skills/pdf-compare/scripts/compare_pdfs.js \
 *     --left doc_a.pdf --right doc_b.pdf --outdir ./output
 */

import { program } from 'commander'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import { difflib_unifiedDiff } from './text_diff.js'
import { extractTextPerPage, extractTextBounds, getMetadata, getPageCount, diffMetadata } from './extract_text.js'
import { renderPages } from './render_pages.js'
import { diffPageImages, compareImages } from './diff_images.js'
import { matchPages } from './page_matcher.js'
import { writeHtmlReport } from './html_report.js'
import { analyzeVisualChanges } from './visual_analyzer.js'
import {
  buildReport,
  detectRepeatingHeaderFooter,
  parsePageRange,
  stripHeaderFooter,
  writeJsonReport,
  writeMarkdownReport,
} from './utils.js'

/**
 * Compute diff stats between two page texts.
 */
function computeTextDiff (leftText, rightText) {
  const leftLines = leftText.split('\n')
  const rightLines = rightText.split('\n')
  const diffLines = difflib_unifiedDiff(leftLines, rightLines)

  let insertions = 0
  let deletions = 0
  for (const line of diffLines) {
    if (line.startsWith('+') && !line.startsWith('+++')) insertions++
    else if (line.startsWith('-') && !line.startsWith('---')) deletions++
  }

  return { insertions, deletions, diffLines }
}

/**
 * Run the full comparison pipeline with smart page matching.
 */
export function runComparison ({
  left,
  right,
  outdir,
  mode = 'both',
  visualThreshold = 0.01,
  ignoreHeadersFooters = false,
  pagesSpec = null,
  open = false,
}) {
  // Clean previous output
  if (fs.existsSync(outdir)) {
    fs.rmSync(outdir, { recursive: true, force: true })
  }

  // Page counts
  const leftCount = getPageCount(left)
  const rightCount = getPageCount(right)

  // Metadata
  const leftMeta = getMetadata(left)
  const rightMeta = getMetadata(right)
  const metaDiff = diffMetadata(leftMeta, rightMeta)

  // Always extract text (needed for page matching when counts differ)
  let leftTexts = extractTextPerPage(left)
  let rightTexts = extractTextPerPage(right)

  if (ignoreHeadersFooters) {
    const { header: headerL, footer: footerL } = detectRepeatingHeaderFooter(leftTexts)
    const { header: headerR, footer: footerR } = detectRepeatingHeaderFooter(rightTexts)
    leftTexts = leftTexts.map(t => stripHeaderFooter(t, headerL, footerL))
    rightTexts = rightTexts.map(t => stripHeaderFooter(t, headerR, footerR))
  }

  const doText = mode === 'text' || mode === 'both'
  const doVisual = mode === 'visual' || mode === 'both'

  // Extract text bounding boxes for visual analysis (to separate text from non-text changes)
  let leftTextBounds = []
  let rightTextBounds = []
  if (doVisual) {
    leftTextBounds = extractTextBounds(left)
    rightTextBounds = extractTextBounds(right)
  }

  // Smart page matching — align pages by content similarity
  const alignment = matchPages(leftTexts, rightTexts)

  // Filter to requested pages if specified (based on left page numbers)
  let filteredAlignment = alignment
  if (pagesSpec) {
    const requestedPages = new Set(parsePageRange(pagesSpec, leftCount))
    filteredAlignment = alignment.filter(a =>
      (a.leftIndex != null && requestedPages.has(a.leftIndex)) ||
      (a.rightIndex != null && a.leftIndex == null) // always include inserted pages
    )
  }

  // Render pages for visual comparison
  let leftRenderedMap = new Map()
  let rightRenderedMap = new Map()
  if (doVisual) {
    const leftIndices = [...new Set(filteredAlignment.filter(a => a.leftIndex != null).map(a => a.leftIndex))]
    const rightIndices = [...new Set(filteredAlignment.filter(a => a.rightIndex != null).map(a => a.rightIndex))]
    const leftRendered = renderPages(left, { pages: leftIndices })
    const rightRendered = renderPages(right, { pages: rightIndices })
    leftRenderedMap = new Map(leftRendered.map(r => [r.index, r]))
    rightRenderedMap = new Map(rightRendered.map(r => [r.index, r]))
  }

  // Build per-page results from alignment
  const pageResults = []
  let pageCounter = 0

  for (const match of filteredAlignment) {
    pageCounter++
    const entry = { page: pageCounter }
    const notesParts = []

    // Record match info
    entry.match_type = match.type
    entry.match_similarity = match.similarity
    if (match.leftIndex != null) entry.left_page = match.leftIndex + 1
    if (match.rightIndex != null) entry.right_page = match.rightIndex + 1

    if (match.type === 'deleted') {
      // Page only in left — deleted from right
      entry.text_changed = true
      entry.text_diff_stats = null
      entry.page_text = leftTexts[match.leftIndex] || ''
      entry.visual_changed = doVisual ? true : null
      entry.visual_score = doVisual ? 1.0 : null
      notesParts.push(`Page ${match.leftIndex + 1} deleted from right document`)
    } else if (match.type === 'inserted') {
      // Page only in right — inserted
      entry.text_changed = true
      entry.text_diff_stats = null
      entry.page_text = rightTexts[match.rightIndex] || ''
      entry.visual_changed = doVisual ? true : null
      entry.visual_score = doVisual ? 1.0 : null
      notesParts.push(`Page ${match.rightIndex + 1} inserted in right document`)
    } else {
      // matched or replaced — compare the pair
      const li = match.leftIndex
      const ri = match.rightIndex

      // Text comparison
      if (doText) {
        const lt = leftTexts[li] || ''
        const rt = rightTexts[ri] || ''
        if (!lt && !rt) {
          notesParts.push('Text extraction empty (scanned/image page?)')
          entry.text_changed = false
          entry.text_diff_stats = { insertions: 0, deletions: 0 }
        } else {
          entry.text_changed = lt !== rt
          const diff = computeTextDiff(lt, rt)
          entry.text_diff_stats = { insertions: diff.insertions, deletions: diff.deletions }
          if (diff.diffLines.length > 0) {
            entry.text_diff_lines = diff.diffLines
          }
        }
      } else {
        entry.text_changed = null
        entry.text_diff_stats = null
      }

      // Visual comparison
      if (doVisual) {
        const leftImg = leftRenderedMap.get(li)
        const rightImg = rightRenderedMap.get(ri)
        if (leftImg && rightImg) {
          const { score, changed, diffPng, leftRgba, rightRgba, diffMask, width: dw, height: dh } = compareImages(leftImg, rightImg, { threshold: visualThreshold })
          entry.visual_changed = changed
          entry.visual_score = score
          if (changed && diffPng) {
            fs.mkdirSync(outdir, { recursive: true })
            const diffPath = `${outdir}/diff_page_${String(pageCounter).padStart(4, '0')}.png`
            fs.writeFileSync(diffPath, diffPng)
            entry.diff_image_path = diffPath

            // Analyze what changed visually
            if (leftRgba && rightRgba && diffMask) {
              const analysis = analyzeVisualChanges(leftRgba, rightRgba, diffMask, dw, dh, {
                leftTextBounds: li < leftTextBounds.length ? leftTextBounds[li] : [],
                rightTextBounds: ri < rightTextBounds.length ? rightTextBounds[ri] : [],
              })
              if (analysis.visualChanges.length > 0) {
                entry.visual_changes = analysis.visualChanges
              }
              if (analysis.textAreaChanges.length > 0) {
                entry.text_area_visual_changes = analysis.textAreaChanges
              }
            }
          }
        } else {
          entry.visual_changed = null
          entry.visual_score = null
          notesParts.push('Visual comparison skipped (render failed)')
        }
      } else {
        entry.visual_changed = null
        entry.visual_score = null
      }

      if (match.type === 'replaced') {
        notesParts.push(`Low similarity match (${(match.similarity * 100).toFixed(0)}%) — pages may not correspond`)
      }
    }

    entry.notes = notesParts.length ? notesParts.join('; ') : null
    pageResults.push(entry)
  }

  const report = buildReport({
    leftPath: left,
    rightPath: right,
    leftPageCount: leftCount,
    rightPageCount: rightCount,
    metadataDiff: metaDiff,
    pageResults,
  })

  // Write outputs
  writeJsonReport(report, outdir)
  writeMarkdownReport(report, outdir)
  const htmlPath = writeHtmlReport(report, outdir)

  if (open) {
    try {
      const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
      execSync(`${cmd} "${htmlPath}"`)
    } catch { /* ignore if open fails */ }
  }

  return report
}

// --- CLI (only when run directly) ---
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])

if (isMainModule) {
  program
    .name('compare_pdfs')
    .description('Compare two PDF documents')
    .requiredOption('--left <path>', 'Path to first (left) PDF')
    .requiredOption('--right <path>', 'Path to second (right) PDF')
    .option('--outdir <path>', 'Output directory', './pdf-compare-output')
    .option('--mode <mode>', 'Comparison mode: text, visual, or both', 'both')
    .option('--visual-threshold <number>', 'Visual difference threshold 0.0–1.0', parseFloat, 0.01)
    .option('--ignore-headers-footers', 'Strip repeating headers/footers', false)
    .option('--pages <spec>', 'Page range, e.g. "1-3,7,10-12"')
    .option('--open', 'Open HTML report in browser (default: true)', true)
    .option('--no-open', 'Suppress opening HTML report')

  program.parse()

  const opts = program.opts()

  if (!fs.existsSync(opts.left)) {
    console.error(`Error: left PDF not found: ${opts.left}`)
    process.exit(1)
  }
  if (!fs.existsSync(opts.right)) {
    console.error(`Error: right PDF not found: ${opts.right}`)
    process.exit(1)
  }

  const report = runComparison({
    left: opts.left,
    right: opts.right,
    outdir: opts.outdir,
    mode: opts.mode,
    visualThreshold: opts.visualThreshold,
    ignoreHeadersFooters: opts.ignoreHeadersFooters,
    pagesSpec: opts.pages ?? null,
    open: opts.open,
  })

  const summary = report.summary
  if (summary.identical) {
    console.log('Result: Documents are IDENTICAL')
  } else {
    console.log(`Result: Documents DIFFER — ${summary.total_changed} page(s) changed`)
  }
  console.log(`Reports written to: ${opts.outdir}`)
}
