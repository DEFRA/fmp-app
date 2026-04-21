#!/usr/bin/env node
/**
 * Chain multiple PDF comparisons: A↔B then B↔C, showing what's new in each step.
 *
 * Usage:
 *   node scripts/chain_compare.js --files a.pdf b.pdf c.pdf --outdir ./chain-output
 *   npm run chain -- --files a.pdf b.pdf c.pdf
 *
 * Produces:
 *   chain-output/step-1_a-vs-b/  (report.json, report.html, etc.)
 *   chain-output/step-2_b-vs-c/  (report.json, report.html, etc.)
 *   chain-output/chain_summary.json  (cross-step analysis)
 */

import { program } from 'commander'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runComparison } from './compare_pdfs.js'

program
  .requiredOption('--files <paths...>', 'Two or more PDF files in version order')
  .option('--outdir <dir>', 'Output directory', './chain-output')
  .option('--mode <mode>', 'Comparison mode', 'both')
  .option('--visual-threshold <n>', 'Visual diff threshold', parseFloat, 0.01)
  .option('--open', 'Open final HTML report', false)
  .parse()

const opts = program.opts()
const files = opts.files

if (files.length < 2) {
  console.error('Need at least 2 PDF files to chain')
  process.exit(1)
}

// Clean output directory
if (fs.existsSync(opts.outdir)) {
  fs.rmSync(opts.outdir, { recursive: true, force: true })
}

const steps = []
const stepReports = []

for (let i = 0; i < files.length - 1; i++) {
  const left = files[i]
  const right = files[i + 1]
  const leftName = path.basename(left, '.pdf')
  const rightName = path.basename(right, '.pdf')
  const stepDir = path.join(opts.outdir, `step-${i + 1}_${leftName}-vs-${rightName}`)

  console.log(`\nStep ${i + 1}: ${path.basename(left)} ↔ ${path.basename(right)}`)

  const report = runComparison({
    left: path.resolve(left),
    right: path.resolve(right),
    outdir: stepDir,
    mode: opts.mode,
    visualThreshold: opts.visualThreshold,
    open: false,
  })

  steps.push({
    step: i + 1,
    left: path.basename(left),
    right: path.basename(right),
    outdir: stepDir,
  })
  stepReports.push(report)
}

// Build chain summary: what's new at each step, what persists
const chainSummary = {
  generated_at: new Date().toISOString(),
  files: files.map(f => path.basename(f)),
  steps: [],
}

for (let i = 0; i < stepReports.length; i++) {
  const report = stepReports[i]
  const triage = report.triage || { structural: [], substantive: [], cosmetic: [] }

  const stepSummary = {
    step: i + 1,
    left: steps[i].left,
    right: steps[i].right,
    identical: report.summary.identical,
    total_changed: report.summary.total_changed,
    structural_count: triage.structural.length,
    substantive_count: triage.substantive.length,
    cosmetic_count: triage.cosmetic.length,
    structural: triage.structural,
    substantive: triage.substantive.map(s => ({ page: s.page, reason: s.reason })),
  }

  // If this isn't the first step, find what's NEW vs the previous step
  if (i > 0) {
    const prevPages = new Set(stepReports[i - 1].pages
      .filter(p => p.text_changed || p.visual_changed)
      .map(p => p.right_page || p.page))
    const currPages = report.pages.filter(p => p.text_changed || p.visual_changed)
    const newChanges = currPages.filter(p => !prevPages.has(p.left_page || p.page))
    stepSummary.new_changes = newChanges.map(p => ({
      page: p.page,
      left_page: p.left_page,
      right_page: p.right_page,
      match_type: p.match_type,
    }))
    stepSummary.new_change_count = newChanges.length
  }

  chainSummary.steps.push(stepSummary)
}

// Write chain summary
const chainPath = path.join(opts.outdir, 'chain_summary.json')
fs.writeFileSync(chainPath, JSON.stringify(chainSummary, null, 2), 'utf8')
console.log(`\nChain summary: ${chainPath}`)

// Print overview
console.log('\n=== Chain Overview ===')
for (const step of chainSummary.steps) {
  const status = step.identical ? 'IDENTICAL' : `${step.total_changed} changed`
  const newLabel = step.new_change_count != null ? ` (${step.new_change_count} new)` : ''
  console.log(`  Step ${step.step}: ${step.left} → ${step.right} — ${status}${newLabel}`)
  console.log(`    Structural: ${step.structural_count} | Substantive: ${step.substantive_count} | Cosmetic: ${step.cosmetic_count}`)
}

// Open the last step's report if requested
if (opts.open && stepReports.length > 0) {
  const lastDir = steps[steps.length - 1].outdir
  const htmlPath = path.join(lastDir, 'report.html')
  if (fs.existsSync(htmlPath)) {
    const { execSync } = await import('node:child_process')
    try {
      const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
      execSync(`${cmd} "${htmlPath}"`)
    } catch { /* ignore */ }
  }
}
