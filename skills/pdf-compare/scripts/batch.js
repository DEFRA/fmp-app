#!/usr/bin/env node
/**
 * Batch comparison — compare PDFs in pairs from a folder.
 *
 * Drop PDFs into skills/pdf-compare/inbox/, named so they sort into pairs:
 *   1a.pdf, 1b.pdf, 2a.pdf, 2b.pdf   → compares 1a↔1b, then 2a↔2b
 *   old_report.pdf, new_report.pdf     → compares old↔new
 *
 * Files are sorted alphabetically and paired: 1st↔2nd, 3rd↔4th, etc.
 *
 * Usage:
 *   node scripts/batch.js              # from inbox/ folder
 *   node scripts/batch.js --dir /path  # from a custom folder
 *   node scripts/batch.js --no-open    # suppress browser
 *
 * Output goes to inbox/output/pair-1/, inbox/output/pair-2/, etc.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runComparison } from './compare_pdfs.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const args = process.argv.slice(2)
const dirIdx = args.indexOf('--dir')
const inputDir = dirIdx !== -1 ? args[dirIdx + 1] : path.join(__dirname, '..', 'inbox')
const shouldOpen = !args.includes('--no-open')

// Find all PDFs
const pdfs = fs.readdirSync(inputDir)
  .filter(f => f.toLowerCase().endsWith('.pdf'))
  .sort()
  .map(f => path.join(inputDir, f))

if (pdfs.length === 0) {
  console.error(`No PDFs found in ${inputDir}`)
  process.exit(1)
}

if (pdfs.length % 2 !== 0) {
  console.error(`Found ${pdfs.length} PDFs — need an even number to pair them.`)
  console.error('Files found:')
  pdfs.forEach(p => console.error(`  ${path.basename(p)}`))
  process.exit(1)
}

const pairs = []
for (let i = 0; i < pdfs.length; i += 2) {
  pairs.push({ left: pdfs[i], right: pdfs[i + 1] })
}

console.log(`Found ${pdfs.length} PDFs → ${pairs.length} pair(s)\n`)

const outputBase = path.join(inputDir, 'output')

// Clean previous output
if (fs.existsSync(outputBase)) {
  fs.rmSync(outputBase, { recursive: true, force: true })
}

const results = []

for (let i = 0; i < pairs.length; i++) {
  const { left, right } = pairs[i]
  const pairLabel = `pair-${i + 1}`
  const outdir = path.join(outputBase, pairLabel)

  console.log(`--- ${pairLabel}: ${path.basename(left)} ↔ ${path.basename(right)} ---`)

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
    total_changed: s.total_changed,
    left_page_count: s.left_page_count,
    right_page_count: s.right_page_count,
    page_count_match: s.page_count_match,
    structural_count: triage.structural.length,
    substantive_count: triage.substantive.length,
    cosmetic_count: triage.cosmetic.length,
    global_patterns: triage.global_patterns || [],
    outdir: pairLabel,
  })
}

// Write batch summary
const summaryPath = path.join(outputBase, 'batch_summary.json')
fs.writeFileSync(summaryPath, JSON.stringify({ pairs: results }, null, 2), 'utf8')

console.log('=== Batch Complete ===')
for (const r of results) {
  const icon = r.identical ? '✅' : '⚠️'
  console.log(`  ${icon} ${r.left} ↔ ${r.right} — ${r.identical ? 'identical' : r.total_changed + ' changed'}`)
}
console.log(`\nBatch summary: ${summaryPath}`)
