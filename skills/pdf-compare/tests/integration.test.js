/**
 * Integration tests for the pdf-compare pipeline.
 * Requires sample PDFs to be generated first: npm run generate-samples
 * Uses Node.js built-in test runner.
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SAMPLES_DIR = path.join(__dirname, '..', 'evals', 'samples')
const OUTPUT_DIR = path.join(__dirname, '..', 'test-output')

let runComparison

before(async () => {
  const mod = await import('../scripts/compare_pdfs.js')
  runComparison = mod.runComparison
})

function samplesExist () {
  return fs.existsSync(path.join(SAMPLES_DIR, 'identical_a.pdf'))
}

describe('Identical PDFs', () => {
  it('should produce zero changes', { skip: !samplesExist() && 'Sample PDFs not generated' }, () => {
    const outdir = path.join(OUTPUT_DIR, 'test-identical')
    const report = runComparison({
      left: path.join(SAMPLES_DIR, 'identical_a.pdf'),
      right: path.join(SAMPLES_DIR, 'identical_b.pdf'),
      outdir,
      mode: 'both',
    })

    assert.strictEqual(report.summary.identical, true)
    assert.deepStrictEqual(report.summary.changed_pages, [])
    assert.strictEqual(report.summary.total_changed, 0)

    for (const page of report.pages) {
      assert.strictEqual(page.text_changed, false)
      assert.strictEqual(page.visual_changed, false)
    }

    // Validate output files
    assert.ok(fs.existsSync(path.join(outdir, 'report.json')))
    assert.ok(fs.existsSync(path.join(outdir, 'report.md')))

    // Validate JSON schema
    const json = JSON.parse(fs.readFileSync(path.join(outdir, 'report.json'), 'utf-8'))
    assert.strictEqual(json.schema_version, '1.0.0')
    assert.ok(Array.isArray(json.pages))
  })
})

describe('Text change PDFs', () => {
  it('should detect text change on page 2 only', { skip: !samplesExist() && 'Sample PDFs not generated' }, () => {
    const outdir = path.join(OUTPUT_DIR, 'test-text-change')
    const report = runComparison({
      left: path.join(SAMPLES_DIR, 'text_change_a.pdf'),
      right: path.join(SAMPLES_DIR, 'text_change_b.pdf'),
      outdir,
      mode: 'both',
    })

    assert.strictEqual(report.summary.identical, false)
    assert.ok(report.summary.changed_pages.includes(2))

    const page1 = report.pages.find(p => p.page === 1)
    assert.strictEqual(page1.text_changed, false)

    const page2 = report.pages.find(p => p.page === 2)
    assert.strictEqual(page2.text_changed, true)
    assert.ok(page2.text_diff_stats.insertions > 0)

    const page3 = report.pages.find(p => p.page === 3)
    assert.strictEqual(page3.text_changed, false)
  })
})

describe('Layout change PDFs', () => {
  it('should detect visual changes with same text', { skip: !samplesExist() && 'Sample PDFs not generated' }, () => {
    const outdir = path.join(OUTPUT_DIR, 'test-layout-change')
    const report = runComparison({
      left: path.join(SAMPLES_DIR, 'layout_change_a.pdf'),
      right: path.join(SAMPLES_DIR, 'layout_change_b.pdf'),
      outdir,
      mode: 'both',
    })

    assert.strictEqual(report.summary.identical, false)

    const visualChanged = report.pages.filter(p => p.visual_changed)
    assert.ok(visualChanged.length > 0, 'At least one page should have visual changes')

    for (const page of visualChanged) {
      assert.ok(page.visual_score > 0, 'Visual score should be above zero')
    }
  })
})

describe('report.json schema validation', () => {
  it('has required top-level fields', { skip: !samplesExist() && 'Sample PDFs not generated' }, () => {
    const outdir = path.join(OUTPUT_DIR, 'test-schema')
    const report = runComparison({
      left: path.join(SAMPLES_DIR, 'identical_a.pdf'),
      right: path.join(SAMPLES_DIR, 'identical_b.pdf'),
      outdir,
      mode: 'text',
    })

    // Top-level fields
    assert.ok('schema_version' in report)
    assert.ok('generated_at' in report)
    assert.ok('left' in report)
    assert.ok('right' in report)
    assert.ok('summary' in report)
    assert.ok('metadata_diff' in report)
    assert.ok('pages' in report)

    // Summary fields
    assert.ok('identical' in report.summary)
    assert.ok('left_page_count' in report.summary)
    assert.ok('right_page_count' in report.summary)
    assert.ok('page_count_match' in report.summary)
    assert.ok('changed_pages' in report.summary)
    assert.ok('total_changed' in report.summary)

    // Page fields
    for (const page of report.pages) {
      assert.ok('page' in page)
      assert.ok('text_changed' in page)
    }
  })
})
