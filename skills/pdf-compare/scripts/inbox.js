#!/usr/bin/env node
/**
 * Smart inbox runner — drop PDFs into skills/pdf-compare/inbox/ and run this script.
 *
 * Auto-detects:
 *   - 2 PDFs → single comparison (left = 1st alphabetically, right = 2nd)
 *   - 4, 6, 8... PDFs → batch comparison (pairs: 1st↔2nd, 3rd↔4th, etc.)
 *
 * Usage:
 *   node scripts/inbox.js [--no-open]
 *
 * HTML reports open in the browser by default. Use --no-open to suppress.
 *
 * Naming tip: use prefixes so pairs sort together:
 *   1a-report.pdf, 1b-report.pdf, 2a-policy.pdf, 2b-policy.pdf
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as mupdf from 'mupdf'
import { runComparison } from './compare_pdfs.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const INBOX_DIR = path.join(__dirname, '..', 'inbox')
const OUTPUT_DIR = path.join(INBOX_DIR, 'output')

// Ensure inbox exists
fs.mkdirSync(INBOX_DIR, { recursive: true })

// Clean previous output
if (fs.existsSync(OUTPUT_DIR)) {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true })
}

// Find PDFs in inbox (non-recursive, top-level only)
const pdfs = fs.readdirSync(INBOX_DIR)
  .filter(f => f.toLowerCase().endsWith('.pdf'))
  .sort()
  .map(f => path.join(INBOX_DIR, f))

const shouldOpen = !process.argv.includes('--no-open')

if (pdfs.length === 0) {
  console.log('No PDFs found in inbox/')
  console.log(`Drop PDF files into: ${INBOX_DIR}`)
  process.exit(1)
}

if (pdfs.length === 1) {
  console.error('Only 1 PDF found — need at least 2.')
  console.error(`  Found: ${path.basename(pdfs[0])}`)
  process.exit(1)
}

if (pdfs.length % 2 !== 0) {
  console.error(`Found ${pdfs.length} PDFs — need an even number to pair them.`)
  pdfs.forEach(p => console.error(`  ${path.basename(p)}`))
  process.exit(1)
}

// === Single pair ===
if (pdfs.length === 2) {
  const [left, right] = pdfs
  console.log(`Left (original): ${path.basename(left)}`)
  console.log(`Right (revised):  ${path.basename(right)}`)
  console.log('Output:           inbox/output/')
  console.log()

  const report = runComparison({
    left,
    right,
    outdir: OUTPUT_DIR,
    mode: 'both',
    visualThreshold: 0.01,
    open: shouldOpen,
  })

  const s = report.summary
  if (s.identical) {
    console.log('Result: Documents are IDENTICAL')
  } else {
    console.log(`Result: Documents DIFFER — ${s.total_changed} page(s) changed`)
  }
  console.log('Reports written to: inbox/output/')
  process.exit(0)
}

// === Batch: 4+ PDFs, paired automatically ===
const pairs = []
for (let i = 0; i < pdfs.length; i += 2) {
  pairs.push({ left: pdfs[i], right: pdfs[i + 1] })
}

console.log(`Found ${pdfs.length} PDFs → ${pairs.length} pair(s)\n`)
pairs.forEach((p, i) => console.log(`  Pair ${i + 1}: ${path.basename(p.left)} ↔ ${path.basename(p.right)}`))
console.log()

const results = []

for (let i = 0; i < pairs.length; i++) {
  const { left, right } = pairs[i]
  const pairLabel = `pair-${i + 1}`
  const outdir = path.join(OUTPUT_DIR, pairLabel)

  // Flush mupdf WASM store between pairs to free accumulated memory
  if (i > 0) {
    try { mupdf.emptyStore() } catch { /* ignore if not available */ }
  }

  console.log(`--- ${pairLabel}: ${path.basename(left)} ↔ ${path.basename(right)} ---`)

  try {
    const report = runComparison({
      left,
      right,
      outdir,
      mode: 'both',
      visualThreshold: 0.01,
      open: shouldOpen,
    })

    const s = report.summary
    const triage = report.triage || { structural: [], substantive: [], cosmetic: [], global_patterns: [] }
    const status = s.identical ? 'IDENTICAL' : `${s.total_changed} page(s) changed`
    console.log(`  Result: ${status}`)
    console.log(`  Output: ${pairLabel}/\n`)

    results.push({
      pair: i + 1,
      left: path.basename(left),
      right: path.basename(right),
      identical: s.identical,
      left_page_count: s.left_page_count,
      right_page_count: s.right_page_count,
      total_changed: s.total_changed,
      triage_summary: {
        structural_count: triage.structural.length,
        substantive_count: triage.substantive.length,
        cosmetic_count: triage.cosmetic.length,
        structural: triage.structural,
        substantive: triage.substantive,
        cosmetic_pages: triage.cosmetic,
        global_patterns: triage.global_patterns,
      },
      outdir: pairLabel,
    })
  } catch (err) {
    console.log(`  ❌ FAILED: ${err.message}`)
    console.log(`  Output: ${pairLabel}/ (incomplete)\n`)

    results.push({
      pair: i + 1,
      left: path.basename(left),
      right: path.basename(right),
      error: err.message,
      identical: null,
      left_page_count: null,
      right_page_count: null,
      total_changed: null,
      triage_summary: null,
      outdir: pairLabel,
    })
  }
}

// Build overview stats
const succeeded = results.filter(r => !r.error)
const failed = results.filter(r => r.error)
const overview = {
  identical: succeeded.filter(r => r.identical).length,
  substantive_changes: succeeded.filter(r => !r.identical && r.triage_summary.substantive_count > 0).length,
  cosmetic_only: succeeded.filter(r => !r.identical && r.triage_summary.substantive_count === 0 && r.triage_summary.structural_count === 0).length,
  total_inserted_pages: succeeded.reduce((sum, r) => sum + r.triage_summary.structural.filter(s => s.type === 'inserted').length, 0),
  total_deleted_pages: succeeded.reduce((sum, r) => sum + r.triage_summary.structural.filter(s => s.type === 'deleted').length, 0),
  failed: failed.length,
}

// Write batch summary
const summaryPath = path.join(OUTPUT_DIR, 'batch_summary.json')
const batchSummary = {
  generated_at: new Date().toISOString(),
  total_pairs: results.length,
  overview,
  pairs: results,
}
fs.writeFileSync(summaryPath, JSON.stringify(batchSummary, null, 2), 'utf8')

console.log('=== Batch Complete ===')
for (const r of results) {
  if (r.error) {
    console.log(`  ❌ ${r.left} ↔ ${r.right} — FAILED: ${r.error}`)
  } else {
    const icon = r.identical ? '✅' : '⚠️'
    console.log(`  ${icon} ${r.left} ↔ ${r.right} — ${r.identical ? 'identical' : r.total_changed + ' changed'}`)
  }
}
console.log(`\nBatch summary: ${summaryPath}`)
console.log('Reports written to: inbox/output/')
console.log('Open report: open inbox/output/report.html')
