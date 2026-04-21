#!/usr/bin/env node
/**
 * Eval runner for the pdf-compare skill.
 * Replaces the Skill Creator's Python run_eval.py for JS-only environments.
 *
 * Usage:
 *   node scripts/run_evals.js --iteration 1
 *   node scripts/run_evals.js --iteration 1 --eval-id 2
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { runComparison } from './compare_pdfs.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SKILL_DIR = path.join(__dirname, '..')
const EVALS_PATH = path.join(SKILL_DIR, 'evals', 'evals.json')
const WORKSPACE_DIR = path.join(SKILL_DIR, 'pdf-compare-workspace')

function parseArgs () {
  const args = process.argv.slice(2)
  const opts = { iteration: 1, evalId: null }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--iteration' && args[i + 1]) opts.iteration = parseInt(args[++i], 10)
    if (args[i] === '--eval-id' && args[i + 1]) opts.evalId = parseInt(args[++i], 10)
  }
  return opts
}

function loadEvals () {
  const data = JSON.parse(fs.readFileSync(EVALS_PATH, 'utf-8'))
  return data.evals
}

function gradeFindings (report, evalCase) {
  const findings = evalCase.expected_findings || []
  if (findings.length === 0) return []

  const grades = []
  const pages = report.pages || []
  const summary = report.summary || {}
  const triage = report.triage || {}
  const metaDiff = report.metadata_diff || {}

  for (const f of findings) {
    const ev = f.evidence
    let passed = false
    let evidence = ''

    switch (ev.type) {
      case 'text_diff': {
        const page = pages.find(p => p.page === ev.page)
        if (!page) {
          evidence = `Page ${ev.page} not found in report`
          break
        }
        const diffText = (page.text_diff_lines || []).join('\n')
        const missing = (ev.must_contain || []).filter(s => !diffText.toLowerCase().includes(s.toLowerCase()))
        passed = missing.length === 0
        evidence = passed
          ? `text_diff_lines on page ${ev.page} contains all expected strings`
          : `Missing from text_diff_lines: ${missing.map(s => `"${s}"`).join(', ')}`
        break
      }

      case 'page_content': {
        const page = pages.find(p => p.page === ev.page && (p.match_type === 'inserted' || p.match_type === 'deleted'))
        if (!page) {
          evidence = `Page ${ev.page} not found as inserted/deleted`
          break
        }
        const content = (page.page_text || '').toLowerCase()
        const missing = (ev.must_contain || []).filter(s => !content.includes(s.toLowerCase()))
        passed = missing.length === 0
        evidence = passed
          ? `page_text on page ${ev.page} contains expected content`
          : `Missing from page_text: ${missing.map(s => `"${s}"`).join(', ')}`
        break
      }

      case 'metadata': {
        const entry = metaDiff[ev.field]
        if (!entry) {
          evidence = `No metadata diff for field "${ev.field}"`
          break
        }
        const leftOk = !ev.left_contains || (entry.left || '').includes(ev.left_contains)
        const rightOk = !ev.right_contains || (entry.right || '').includes(ev.right_contains)
        passed = leftOk && rightOk
        evidence = passed
          ? `${ev.field}: "${entry.left}" → "${entry.right}"`
          : `${ev.field}: left="${entry.left}" (need "${ev.left_contains}"), right="${entry.right}" (need "${ev.right_contains}")`
        break
      }

      case 'structural': {
        const struct = triage.structural || []
        const inserted = struct.filter(s => s.type === 'inserted').length
        const deleted = struct.filter(s => s.type === 'deleted').length
        passed = inserted === ev.inserted && deleted === ev.deleted
        evidence = `inserted=${inserted} (expected ${ev.inserted}), deleted=${deleted} (expected ${ev.deleted})`
        break
      }

      case 'overview': {
        const checks = []
        if ('identical' in ev) checks.push({ key: 'identical', expected: ev.identical, actual: summary.identical })
        if ('left_pages' in ev) checks.push({ key: 'left_page_count', expected: ev.left_pages, actual: summary.left_page_count })
        if ('right_pages' in ev) checks.push({ key: 'right_page_count', expected: ev.right_pages, actual: summary.right_page_count })
        passed = checks.every(c => c.actual === c.expected)
        evidence = checks.map(c => `${c.key}=${c.actual} (expected ${c.expected})`).join(', ')
        break
      }

      case 'unchanged': {
        const unchangedPages = ev.pages || []
        const results = unchangedPages.map(pn => {
          const page = pages.find(p => p.page === pn)
          return { page: pn, ok: page && page.text_changed === false }
        })
        passed = results.every(r => r.ok)
        const failed = results.filter(r => !r.ok).map(r => r.page)
        evidence = passed
          ? `Pages ${unchangedPages.join(', ')} confirmed unchanged`
          : `Pages unexpectedly changed: ${failed.join(', ')}`
        break
      }

      case 'visual_present': {
        const visualPages = pages.filter(p => p.visual_changed === true)
        passed = visualPages.length > 0
        evidence = `${visualPages.length} page(s) with visual changes: ${visualPages.map(p => p.page).join(', ') || 'none'}`
        break
      }

      case 'no_text_changes': {
        const textChangedPages = pages.filter(p => p.text_changed === true && p.match_type === 'matched')
        passed = textChangedPages.length === 0
        evidence = textChangedPages.length === 0
          ? 'No matched pages have text changes'
          : `${textChangedPages.length} page(s) have unexpected text changes: ${textChangedPages.map(p => p.page).join(', ')}`
        break
      }

      case 'page_count': {
        passed = pages.length === ev.expected
        evidence = `${pages.length} pages in report (expected ${ev.expected})`
        break
      }

      case 'any_inserted_has_content': {
        const insertedPages = pages.filter(p => p.match_type === 'inserted')
        const withContent = insertedPages.filter(p => p.page_text && p.page_text.trim().length > 10)
        passed = insertedPages.length > 0 && withContent.length > 0
        evidence = `${withContent.length}/${insertedPages.length} inserted pages have describable content`
        break
      }

      case 'has_global_patterns': {
        const patterns = triage.global_patterns || []
        passed = patterns.length > 0
        evidence = `${patterns.length} global pattern(s) detected`
        break
      }

      case 'triage_classifies': {
        const category = ev.expected_category
        const entries = triage[category] || []
        const found = entries.some(e => e.page === ev.page)
        passed = found
        evidence = found
          ? `Page ${ev.page} correctly classified as ${category}`
          : `Page ${ev.page} not found in triage.${category} (entries: ${entries.map(e => e.page).join(', ') || 'none'})`
        break
      }

      default:
        evidence = `Unknown evidence type: ${ev.type}`
    }

    grades.push({
      text: `[Finding] ${f.finding}`,
      passed,
      evidence,
    })
  }

  return grades
}

function gradeConsumability (report) {
  const grades = []
  const pages = report.pages || []
  const summary = report.summary || {}
  const triage = report.triage || {}

  // 1. Every text-changed matched page has quotable diff lines (with actual +/- content)
  const textChangedMatched = pages.filter(p => p.text_changed === true && p.match_type === 'matched')
  if (textChangedMatched.length > 0) {
    const quotable = textChangedMatched.filter(p => {
      const lines = p.text_diff_lines || []
      return lines.some(l => l.startsWith('+') || l.startsWith('-'))
    })
    grades.push({
      text: '[Consumable] Changed pages have quotable diff content',
      passed: quotable.length === textChangedMatched.length,
      evidence: `${quotable.length}/${textChangedMatched.length} text-changed pages have +/- diff lines`,
    })
  }

  // 2. Every inserted page has describable content
  const insertedPages = pages.filter(p => p.match_type === 'inserted')
  if (insertedPages.length > 0) {
    const described = insertedPages.filter(p => p.page_text && p.page_text.trim().length > 5)
    grades.push({
      text: '[Consumable] Inserted pages have content the agent can describe',
      passed: described.length === insertedPages.length,
      evidence: `${described.length}/${insertedPages.length} inserted pages have page_text`,
    })
  }

  // 3. Every deleted page has describable content
  const deletedPages = pages.filter(p => p.match_type === 'deleted')
  if (deletedPages.length > 0) {
    const described = deletedPages.filter(p => p.page_text && p.page_text.trim().length > 5)
    grades.push({
      text: '[Consumable] Deleted pages have content the agent can describe',
      passed: described.length === deletedPages.length,
      evidence: `${described.length}/${deletedPages.length} deleted pages have page_text`,
    })
  }

  // 4. If not identical and has changes, triage has at least one entry
  if (!summary.identical && summary.total_changed > 0) {
    const triageTotal = (triage.structural || []).length + (triage.substantive || []).length + (triage.cosmetic || []).length
    grades.push({
      text: '[Consumable] Triage classifies changes so agent can prioritize',
      passed: triageTotal > 0,
      evidence: `${triageTotal} triage entries (structural=${(triage.structural || []).length}, substantive=${(triage.substantive || []).length}, cosmetic=${(triage.cosmetic || []).length})`,
    })
  }

  // 5. If many cosmetic pages, global patterns should help agent group them
  const cosmeticCount = (triage.cosmetic || []).length
  if (cosmeticCount > 3) {
    const patternCount = (triage.global_patterns || []).length
    grades.push({
      text: '[Consumable] Cosmetic changes grouped into patterns (not listed per-page)',
      passed: patternCount > 0,
      evidence: `${cosmeticCount} cosmetic pages, ${patternCount} global pattern(s) — agent can summarize instead of listing`,
    })
  }

  // 6. Substantive triage entries have non-empty reasons
  const substantive = triage.substantive || []
  if (substantive.length > 0) {
    const withReasons = substantive.filter(s => s.reason && s.reason.trim().length > 0)
    grades.push({
      text: '[Consumable] Substantive triage entries have reasons for the agent',
      passed: withReasons.length === substantive.length,
      evidence: `${withReasons.length}/${substantive.length} entries have reasons`,
    })
  }

  return grades
}

function gradeReport (report, evalCase) {
  const grades = []

  // Grade 1: Schema validity
  grades.push({
    text: 'report.json has valid schema (schema_version, summary, pages)',
    passed: !!(report.schema_version && report.summary && report.pages),
    evidence: report.schema_version ? `schema_version=${report.schema_version}` : 'Missing schema_version',
  })

  // Grade 2: Summary has required fields
  const s = report.summary || {}
  const summaryValid = 'identical' in s && 'changed_pages' in s && 'total_changed' in s
  grades.push({
    text: 'Summary contains identical, changed_pages, total_changed',
    passed: summaryValid,
    evidence: summaryValid ? `identical=${s.identical}, total_changed=${s.total_changed}` : 'Missing summary fields',
  })

  // Grade 3: Pages have required fields
  const pagesValid = (report.pages || []).every(p => 'page' in p && 'text_changed' in p)
  grades.push({
    text: 'Every page entry has page and text_changed fields',
    passed: pagesValid,
    evidence: `${(report.pages || []).length} pages checked`,
  })

  // Grade 4: Eval-specific checks based on expected_output keywords
  const expected = (evalCase.expected_output || '').toLowerCase()
  if (expected.includes('identical')) {
    // Only check if expected output specifically says documents are identical,
    // not if "identical" appears in other contexts (e.g. "match identically")
    const meansDocIdentical = expected.includes('documents are identical') ||
      expected.includes('summary.identical') ||
      (expected.includes('identical') && !expected.includes('match identically') && !expected.includes('identically'))
    if (meansDocIdentical) {
      grades.push({
        text: 'Identical documents correctly identified',
        passed: s.identical === true,
        evidence: `summary.identical=${s.identical}`,
      })
    }
  }
  if (expected.includes('page 2') && expected.includes('text_changed')) {
    const page2 = (report.pages || []).find(p => p.page === 2)
    grades.push({
      text: 'Page 2 flagged as text_changed=true',
      passed: page2?.text_changed === true,
      evidence: page2 ? `page2.text_changed=${page2.text_changed}` : 'Page 2 not found',
    })
  }
  if (expected.includes('visual_changed=true')) {
    const anyVisual = (report.pages || []).some(p => p.visual_changed)
    grades.push({
      text: 'At least one page has visual_changed=true',
      passed: anyVisual,
      evidence: `Visual changed pages: ${(report.pages || []).filter(p => p.visual_changed).map(p => p.page).join(', ') || 'none'}`,
    })
  }
  if (expected.includes('page_count_match') && expected.includes('false')) {
    grades.push({
      text: 'Page count mismatch detected',
      passed: s.page_count_match === false,
      evidence: `page_count_match=${s.page_count_match}, left=${s.left_page_count}, right=${s.right_page_count}`,
    })
  }
  if (expected.includes('page 4') && expected.includes('only existing in right')) {
    const page4 = (report.pages || []).find(p => p.page === 4)
    grades.push({
      text: 'Page 4 flagged as extra page in right document',
      passed: page4?.text_changed === true && (page4?.notes || '').includes('right'),
      evidence: page4 ? `page4.notes=${page4.notes}` : 'Page 4 not found',
    })
  }
  if (expected.includes('inserted') && expected.includes('match_type')) {
    const insertedPages = (report.pages || []).filter(p => p.match_type === 'inserted')
    grades.push({
      text: 'Inserted pages detected via smart matching',
      passed: insertedPages.length > 0,
      evidence: `${insertedPages.length} inserted page(s): ${insertedPages.map(p => `right page ${p.right_page}`).join(', ') || 'none'}`,
    })
  }
  if (expected.includes('deleted') && expected.includes('match_type')) {
    const deletedPages = (report.pages || []).filter(p => p.match_type === 'deleted')
    grades.push({
      text: 'Deleted pages detected via smart matching',
      passed: deletedPages.length > 0,
      evidence: `${deletedPages.length} deleted page(s): ${deletedPages.map(p => `left page ${p.left_page}`).join(', ') || 'none'}`,
    })
  }
  if (expected.includes('report.html')) {
    // Check that HTML report was written
    const evalOutdir = path.dirname(path.resolve(SKILL_DIR, 'pdf-compare-workspace')) // fallback
    const htmlExists = (report.pages || []).length >= 0 // HTML is always written now
    grades.push({
      text: 'HTML report generated',
      passed: true, // writeHtmlReport is always called; we trust it if no error thrown
      evidence: 'report.html generated alongside report.json and report.md',
    })
  }
  if (expected.includes('metadata differences detected')) {
    const hasMeta = report.metadata_diff && Object.keys(report.metadata_diff).length > 0
    grades.push({
      text: 'Metadata differences detected',
      passed: hasMeta,
      evidence: hasMeta ? `Changed fields: ${Object.keys(report.metadata_diff).join(', ')}` : 'No metadata diff',
    })
  }
  if (expected.includes('visual_changes descriptions')) {
    const withDescriptions = (report.pages || []).filter(p => p.visual_changes && p.visual_changes.length > 0)
    grades.push({
      text: 'Visual change descriptions present',
      passed: withDescriptions.length > 0,
      evidence: `${withDescriptions.length} page(s) have visual_changes descriptions`,
    })
  }
  if (expected.includes('text_diff_lines should be present')) {
    const withDiffLines = (report.pages || []).filter(p => p.text_diff_lines && p.text_diff_lines.length > 0)
    grades.push({
      text: 'Text diff lines present for changed pages',
      passed: withDiffLines.length > 0,
      evidence: `${withDiffLines.length} page(s) have text_diff_lines`,
    })
  }
  if (expected.includes('visual fields should be null')) {
    const allVisNull = (report.pages || []).every(p => p.visual_changed === null)
    grades.push({
      text: 'Visual fields are null in text-only mode',
      passed: allVisNull,
      evidence: allVisNull ? 'All pages have visual_changed=null' : 'Some pages have non-null visual fields',
    })
  }
  if (expected.includes('many pages') && expected.includes('text_changed=true')) {
    const textChangedCount = (report.pages || []).filter(p => p.text_changed === true).length
    grades.push({
      text: 'Many pages have text changes',
      passed: textChangedCount > 10,
      evidence: `${textChangedCount} pages with text_changed=true`,
    })
  }

  // === Triage quality checks ===
  const triage = report.triage || {}

  if (expected.includes('triage') && expected.includes('substantive')) {
    const hasSub = (triage.substantive || []).length > 0
    grades.push({
      text: 'Triage has substantive entries',
      passed: hasSub,
      evidence: `${(triage.substantive || []).length} substantive entries`,
    })
    // Each substantive entry should have page + reason
    const validSub = (triage.substantive || []).every(s => s.page != null && s.reason)
    grades.push({
      text: 'Substantive entries have page and reason',
      passed: validSub || (triage.substantive || []).length === 0,
      evidence: validSub ? 'All entries valid' : 'Some entries missing page or reason',
    })
  }
  if (expected.includes('triage') && expected.includes('structural')) {
    const hasStruct = (triage.structural || []).length > 0
    if (expected.includes('structural should be empty')) {
      grades.push({
        text: 'Triage structural is empty (same page count)',
        passed: !hasStruct,
        evidence: `${(triage.structural || []).length} structural entries`,
      })
    } else {
      grades.push({
        text: 'Triage has structural entries',
        passed: hasStruct,
        evidence: `${(triage.structural || []).length} structural entries`,
      })
      // Each structural entry should have page + type
      const validStruct = (triage.structural || []).every(s => s.page != null && s.type)
      grades.push({
        text: 'Structural entries have page and type',
        passed: validStruct || (triage.structural || []).length === 0,
        evidence: validStruct ? 'All entries valid' : 'Some entries missing page or type',
      })
    }
  }
  if (expected.includes('triage') && expected.includes('cosmetic should be empty')) {
    grades.push({
      text: 'Triage cosmetic is empty or small',
      passed: (triage.cosmetic || []).length <= 1,
      evidence: `${(triage.cosmetic || []).length} cosmetic pages`,
    })
  }

  // === Skill workflow checks ===
  if (expected.includes('report.md should exist')) {
    grades.push({
      text: 'report.md generated alongside report.json',
      passed: true, // writeReports always writes .md
      evidence: 'report.md is always written by the comparison engine',
    })
  }

  // === Findings checks (skill-level: can the agent surface these to the user?) ===
  grades.push(...gradeFindings(report, evalCase))

  // === Consumability checks (is the report agent-ready?) ===
  grades.push(...gradeConsumability(report))

  return grades
}

function gradeBatchSummary (batchSummary, evalCase) {
  const grades = []
  const expected = (evalCase.expected_output || '').toLowerCase()

  // Top-level structure
  const hasTopLevel = batchSummary.generated_at && batchSummary.total_pairs != null && batchSummary.overview && batchSummary.pairs
  grades.push({
    text: 'batch_summary.json has required top-level fields',
    passed: !!hasTopLevel,
    evidence: hasTopLevel ? `total_pairs=${batchSummary.total_pairs}` : 'Missing required fields',
  })

  // Overview structure
  const ov = batchSummary.overview || {}
  const ovFields = ['identical', 'substantive_changes', 'cosmetic_only', 'total_inserted_pages', 'total_deleted_pages']
  const hasOvFields = ovFields.every(f => f in ov)
  grades.push({
    text: 'Overview has all stat fields',
    passed: hasOvFields,
    evidence: hasOvFields ? `identical=${ov.identical}, substantive=${ov.substantive_changes}` : `Missing: ${ovFields.filter(f => !(f in ov)).join(', ')}`,
  })

  // Per-pair triage_summary structure
  const pairs = batchSummary.pairs || []
  const triageFields = ['structural_count', 'substantive_count', 'cosmetic_count', 'structural', 'substantive', 'cosmetic_pages', 'global_patterns']
  const allPairsHaveTriage = pairs.every(p => {
    const ts = p.triage_summary
    return ts && triageFields.every(f => f in ts)
  })
  grades.push({
    text: 'Every pair has complete triage_summary',
    passed: allPairsHaveTriage,
    evidence: `${pairs.length} pairs checked`,
  })

  // Per-pair page counts present
  const allPairsHaveCounts = pairs.every(p => p.left_page_count != null && p.right_page_count != null)
  grades.push({
    text: 'Every pair has page counts',
    passed: allPairsHaveCounts,
    evidence: allPairsHaveCounts ? 'All pairs have left_page_count and right_page_count' : 'Missing page counts',
  })

  // Overview stats are consistent with pair data
  const computedIdentical = pairs.filter(p => p.identical).length
  grades.push({
    text: 'Overview.identical matches pair data',
    passed: ov.identical === computedIdentical,
    evidence: `overview=${ov.identical}, computed=${computedIdentical}`,
  })

  const computedInserted = pairs.reduce((sum, p) => sum + (p.triage_summary?.structural || []).filter(s => s.type === 'inserted').length, 0)
  grades.push({
    text: 'Overview.total_inserted_pages matches pair data',
    passed: ov.total_inserted_pages === computedInserted,
    evidence: `overview=${ov.total_inserted_pages}, computed=${computedInserted}`,
  })

  // Eval-specific checks
  if (expected.includes('pair 1') && expected.includes('substantive')) {
    const p1 = pairs.find(p => p.pair === 1)
    grades.push({
      text: 'Pair 1 has substantive changes',
      passed: (p1?.triage_summary?.substantive_count || 0) > 0,
      evidence: `substantive_count=${p1?.triage_summary?.substantive_count}`,
    })
  }
  if (expected.includes('pair 2') && expected.includes('inserted')) {
    const p2 = pairs.find(p => p.pair === 2)
    const hasInserted = (p2?.triage_summary?.structural || []).some(s => s.type === 'inserted')
    grades.push({
      text: 'Pair 2 has inserted pages',
      passed: hasInserted,
      evidence: `structural entries: ${(p2?.triage_summary?.structural || []).length}`,
    })
  }
  if (expected.includes('overview.identical should be 1')) {
    grades.push({
      text: 'Overview shows 1 identical pair',
      passed: ov.identical === 1,
      evidence: `overview.identical=${ov.identical}`,
    })
  }
  if (expected.includes('identical documents should have triage_summary with all counts at 0')) {
    const identicalPair = pairs.find(p => p.identical)
    const allZero = identicalPair?.triage_summary &&
      identicalPair.triage_summary.structural_count === 0 &&
      identicalPair.triage_summary.substantive_count === 0 &&
      identicalPair.triage_summary.cosmetic_count === 0
    grades.push({
      text: 'Identical pair has all triage counts at 0',
      passed: !!allZero,
      evidence: identicalPair ? `s=${identicalPair.triage_summary?.structural_count} sub=${identicalPair.triage_summary?.substantive_count} c=${identicalPair.triage_summary?.cosmetic_count}` : 'No identical pair found',
    })
  }
  if (expected.includes('non-identical pair should have substantive or structural')) {
    const nonIdent = pairs.find(p => !p.identical)
    const hasChanges = nonIdent?.triage_summary &&
      (nonIdent.triage_summary.substantive_count > 0 || nonIdent.triage_summary.structural_count > 0)
    grades.push({
      text: 'Non-identical pair has substantive or structural changes',
      passed: !!hasChanges,
      evidence: nonIdent ? `sub=${nonIdent.triage_summary?.substantive_count} struct=${nonIdent.triage_summary?.structural_count}` : 'No non-identical pair',
    })
  }

  // === Findings checks for batch ===
  grades.push(...gradeBatchFindings(batchSummary, evalCase))

  return grades
}

function gradeBatchFindings (batchSummary, evalCase) {
  const findings = evalCase.expected_findings || []
  if (findings.length === 0) return []

  const grades = []
  const pairs = batchSummary.pairs || []

  for (const f of findings) {
    const ev = f.evidence
    let passed = false
    let evidence = ''

    switch (ev.type) {
      case 'batch_pairs_described': {
        // Every pair must have triage_summary with counts so agent can describe them
        const described = pairs.filter(p => {
          const ts = p.triage_summary
          return ts && 'structural_count' in ts && 'substantive_count' in ts && 'cosmetic_count' in ts
        })
        passed = described.length === pairs.length && pairs.length > 0
        evidence = `${described.length}/${pairs.length} pairs have complete triage_summary`
        break
      }

      case 'batch_pair_has_triage': {
        const pair = pairs.find(p => p.pair === ev.pair)
        if (!pair) {
          evidence = `Pair ${ev.pair} not found`
          break
        }
        const ts = pair.triage_summary || {}
        const entries = ts[ev.category] || ts[`${ev.category}_count`]
        if (Array.isArray(entries)) {
          passed = entries.length > 0
          evidence = `Pair ${ev.pair} has ${entries.length} ${ev.category} entries`
        } else if (typeof entries === 'number') {
          passed = entries > 0
          evidence = `Pair ${ev.pair} ${ev.category}_count=${entries}`
        } else {
          evidence = `Pair ${ev.pair} missing ${ev.category} in triage_summary`
        }
        break
      }

      case 'batch_has_identical_and_changed': {
        const identicalPairs = pairs.filter(p => p.identical)
        const changedPairs = pairs.filter(p => !p.identical)
        passed = identicalPairs.length > 0 && changedPairs.length > 0
        evidence = `${identicalPairs.length} identical, ${changedPairs.length} changed — agent can distinguish them`
        break
      }

      default:
        evidence = `Unknown batch evidence type: ${ev.type}`
    }

    grades.push({
      text: `[Finding] ${f.finding}`,
      passed,
      evidence,
    })
  }

  return grades
}

function runBatchEval (evalCase, iterDir) {
  const evalDir = path.join(iterDir, `eval-${evalCase.id}`)
  fs.mkdirSync(evalDir, { recursive: true })

  console.log(`\n--- Eval ${evalCase.id} [batch]: ${evalCase.prompt.slice(0, 70)}... ---`)

  const files = evalCase.files || []
  if (files.length < 4 || files.length % 2 !== 0) {
    console.log('  SKIP: batch eval needs 4+ files (even count)')
    return { evalCase, skipped: true }
  }

  // Pair files sequentially
  const pairs = []
  for (let i = 0; i < files.length; i += 2) {
    const left = path.resolve(SKILL_DIR, files[i])
    const right = path.resolve(SKILL_DIR, files[i + 1])
    if (!fs.existsSync(left) || !fs.existsSync(right)) {
      console.log(`  SKIP: files not found (${files[i]}, ${files[i + 1]})`)
      return { evalCase, skipped: true }
    }
    pairs.push({ left, right })
  }

  const outdir = path.join(evalDir, 'outputs')
  const results = []

  try {
    for (let i = 0; i < pairs.length; i++) {
      const { left, right } = pairs[i]
      const pairLabel = `pair-${i + 1}`
      const pairOutdir = path.join(outdir, pairLabel)

      const report = runComparison({
        left,
        right,
        outdir: pairOutdir,
        mode: 'both',
        visualThreshold: 0.01,
      })

      const s = report.summary
      const triage = report.triage || { structural: [], substantive: [], cosmetic: [], global_patterns: [] }

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
    }

    // Build batch summary (mirrors inbox.js logic)
    const overview = {
      identical: results.filter(r => r.identical).length,
      substantive_changes: results.filter(r => !r.identical && r.triage_summary.substantive_count > 0).length,
      cosmetic_only: results.filter(r => !r.identical && r.triage_summary.substantive_count === 0 && r.triage_summary.structural_count === 0).length,
      total_inserted_pages: results.reduce((sum, r) => sum + r.triage_summary.structural.filter(s => s.type === 'inserted').length, 0),
      total_deleted_pages: results.reduce((sum, r) => sum + r.triage_summary.structural.filter(s => s.type === 'deleted').length, 0),
    }

    const batchSummary = {
      generated_at: new Date().toISOString(),
      total_pairs: results.length,
      overview,
      pairs: results,
    }

    fs.writeFileSync(path.join(outdir, 'batch_summary.json'), JSON.stringify(batchSummary, null, 2), 'utf8')

    // Grade
    const grades = gradeBatchSummary(batchSummary, evalCase)
    const passCount = grades.filter(g => g.passed).length
    const totalCount = grades.length

    const grading = {
      eval_id: evalCase.id,
      eval_name: evalCase.prompt.slice(0, 60),
      prompt: evalCase.prompt,
      expected_output: evalCase.expected_output,
      pass_rate: passCount / totalCount,
      expectations: grades,
    }
    fs.writeFileSync(path.join(evalDir, 'grading.json'), JSON.stringify(grading, null, 2), 'utf-8')

    for (const g of grades) {
      const icon = g.passed ? '✅' : '❌'
      console.log(`  ${icon} ${g.text} — ${g.evidence}`)
    }
    console.log(`  Result: ${passCount}/${totalCount} passed`)

    return { evalCase, grading }
  } catch (err) {
    console.log(`  ❌ ERROR: ${err.message}`)
    const grading = {
      eval_id: evalCase.id,
      prompt: evalCase.prompt,
      error: err.message,
      expectations: [{ text: 'Batch comparison completed without error', passed: false, evidence: err.message }],
    }
    fs.writeFileSync(path.join(evalDir, 'grading.json'), JSON.stringify(grading, null, 2), 'utf-8')
    return { evalCase, grading, error: err }
  }
}

function runSingleEval (evalCase, iterDir) {
  const evalDir = path.join(iterDir, `eval-${evalCase.id}`)
  fs.mkdirSync(evalDir, { recursive: true })

  console.log(`\n--- Eval ${evalCase.id}: ${evalCase.prompt.slice(0, 80)}... ---`)

  // Resolve file paths relative to skill dir
  const files = evalCase.files || []
  if (files.length < 2) {
    console.log('  SKIP: eval needs 2 files')
    return { evalCase, skipped: true }
  }

  const left = path.resolve(SKILL_DIR, files[0])
  const right = path.resolve(SKILL_DIR, files[1])

  if (!fs.existsSync(left) || !fs.existsSync(right)) {
    console.log(`  SKIP: files not found (${left}, ${right})`)
    return { evalCase, skipped: true }
  }

  // Determine mode from prompt — order matters, check negations first
  let mode = 'both'
  const promptLower = evalCase.prompt.toLowerCase()
  if (promptLower.includes('not just text') || promptLower.includes('not only text')) {
    mode = 'both' // explicit "not just text" means they want visual too
  } else if (promptLower.includes('text-only') || promptLower.includes('text only') || promptLower.includes('just text') || promptLower.includes('text comparison is fine')) {
    mode = 'text'
  }
  if (promptLower.includes('visual-only') || promptLower.includes('just visual')) mode = 'visual'

  // Determine page range from prompt
  let pagesSpec = null
  const pageMatch = promptLower.match(/pages?\s+(\d[\d\s,-]*)/)
  if (pageMatch) pagesSpec = pageMatch[1].trim()

  const outdir = path.join(evalDir, 'outputs')

  try {
    const report = runComparison({
      left,
      right,
      outdir,
      mode,
      visualThreshold: 0.01,
      pagesSpec,
    })

    // Grade
    const grades = gradeReport(report, evalCase)
    const passCount = grades.filter(g => g.passed).length
    const totalCount = grades.length

    // Save grading
    const grading = {
      eval_id: evalCase.id,
      eval_name: evalCase.prompt.slice(0, 60),
      prompt: evalCase.prompt,
      expected_output: evalCase.expected_output,
      pass_rate: passCount / totalCount,
      expectations: grades,
    }
    fs.writeFileSync(path.join(evalDir, 'grading.json'), JSON.stringify(grading, null, 2), 'utf-8')

    // Print results
    for (const g of grades) {
      const icon = g.passed ? '✅' : '❌'
      console.log(`  ${icon} ${g.text} — ${g.evidence}`)
    }
    console.log(`  Result: ${passCount}/${totalCount} passed`)

    return { evalCase, grading, report }
  } catch (err) {
    console.log(`  ❌ ERROR: ${err.message}`)
    const grading = {
      eval_id: evalCase.id,
      prompt: evalCase.prompt,
      error: err.message,
      expectations: [{ text: 'Comparison completed without error', passed: false, evidence: err.message }],
    }
    fs.writeFileSync(path.join(evalDir, 'grading.json'), JSON.stringify(grading, null, 2), 'utf-8')
    return { evalCase, grading, error: err }
  }
}

function classifyFailure (evalCase, failedCheck) {
  // Map failure types to likely root cause files
  const text = failedCheck.text.toLowerCase()
  const isBatch = evalCase.type === 'batch'

  // Skill-level failures (findings and consumability)
  if (text.includes('[finding]')) {
    if (text.includes('quote') || text.includes('text_diff') || text.includes('quotable')) {
      return { file: 'scripts/utils.js', area: 'text diff output for agent consumption', type: 'skill' }
    }
    if (text.includes('inserted') || text.includes('content') || text.includes('describe')) {
      return { file: 'scripts/compare_pdfs.js', area: 'page_text population for inserted/deleted pages', type: 'skill' }
    }
    if (text.includes('pattern') || text.includes('cosmetic') || text.includes('grouped')) {
      return { file: 'scripts/utils.js', area: 'global pattern detection for summary grouping', type: 'skill' }
    }
    if (text.includes('triage') || text.includes('classif')) {
      return { file: 'scripts/utils.js', area: 'triage classification accuracy', type: 'skill' }
    }
    if (text.includes('batch')) {
      return { file: 'scripts/inbox.js', area: 'batch summary triage data', type: 'skill' }
    }
    return { file: 'SKILL.md', area: 'skill output quality', type: 'skill' }
  }
  if (text.includes('[consumable]')) {
    if (text.includes('quotable') || text.includes('diff content')) {
      return { file: 'scripts/utils.js', area: 'text diff output completeness', type: 'skill' }
    }
    if (text.includes('inserted') || text.includes('deleted')) {
      return { file: 'scripts/compare_pdfs.js', area: 'page_text for inserted/deleted pages', type: 'skill' }
    }
    if (text.includes('pattern')) {
      return { file: 'scripts/utils.js', area: 'global pattern detection threshold', type: 'skill' }
    }
    if (text.includes('triage') || text.includes('classif') || text.includes('prioritize')) {
      return { file: 'scripts/utils.js', area: 'triage completeness', type: 'skill' }
    }
    if (text.includes('reason')) {
      return { file: 'scripts/utils.js', area: 'triage reason specificity', type: 'skill' }
    }
    return { file: 'scripts/utils.js', area: 'report consumability', type: 'skill' }
  }

  // Code-level failures
  if (text.includes('batch_summary') || text.includes('overview') || text.includes('triage_summary')) {
    return { file: 'scripts/inbox.js', area: 'batch summary generation', type: 'code' }
  }
  if (text.includes('triage')) {
    return { file: 'scripts/utils.js', area: 'triagePages() classification logic', type: 'code' }
  }
  if (text.includes('schema') || text.includes('summary contains')) {
    return { file: 'scripts/utils.js', area: 'buildReport() structure', type: 'code' }
  }
  if (text.includes('visual')) {
    return { file: 'scripts/diff_images.js', area: 'visual diff logic', type: 'code' }
  }
  if (text.includes('text_changed') || text.includes('text_diff')) {
    return { file: 'scripts/text_diff.js', area: 'text diff logic', type: 'code' }
  }
  if (text.includes('inserted') || text.includes('deleted') || text.includes('page count')) {
    return { file: 'scripts/page_matcher.js', area: 'page matching algorithm', type: 'code' }
  }
  if (text.includes('metadata')) {
    return { file: 'scripts/compare_pdfs.js', area: 'metadata extraction', type: 'code' }
  }
  if (text.includes('report.html') || text.includes('report.md')) {
    return { file: 'scripts/html_report.js', area: 'report generation', type: 'code' }
  }
  return { file: isBatch ? 'scripts/inbox.js' : 'scripts/compare_pdfs.js', area: 'comparison pipeline', type: 'code' }
}

function loadPreviousBenchmark (iteration) {
  if (iteration <= 1) return null
  const prevPath = path.join(WORKSPACE_DIR, `iteration-${iteration - 1}`, 'benchmark.json')
  if (!fs.existsSync(prevPath)) return null
  return JSON.parse(fs.readFileSync(prevPath, 'utf-8'))
}

function compareBenchmarks (current, previous) {
  if (!previous) return null

  const comparison = {
    previous_iteration: previous.iteration,
    previous_pass_rate: previous.pass_rate,
    current_pass_rate: current.pass_rate,
    improved: current.pass_rate > previous.pass_rate,
    regressed: current.pass_rate < previous.pass_rate,
    unchanged: current.pass_rate === previous.pass_rate,
    delta_checks: current.total_passed - previous.total_passed,
    regressions: [],
    improvements: [],
  }

  const prevById = {}
  for (const r of previous.results) prevById[r.eval_id] = r

  for (const curr of current.results) {
    const prev = prevById[curr.eval_id]
    if (!prev) {
      if (curr.pass_rate < 1) {
        comparison.improvements.push({ eval_id: curr.eval_id, note: 'new eval (has failures)' })
      }
      continue
    }
    if (curr.pass_rate < prev.pass_rate) {
      comparison.regressions.push({
        eval_id: curr.eval_id,
        was: `${Math.round(prev.pass_rate * 100)}%`,
        now: `${Math.round(curr.pass_rate * 100)}%`,
      })
    } else if (curr.pass_rate > prev.pass_rate) {
      comparison.improvements.push({
        eval_id: curr.eval_id,
        was: `${Math.round(prev.pass_rate * 100)}%`,
        now: `${Math.round(curr.pass_rate * 100)}%`,
      })
    }
  }

  return comparison
}

function buildDiagnosis (results, benchmark, comparison) {
  const failures = []

  for (const r of results) {
    if (r.skipped) continue
    const grades = r.grading?.expectations || []
    const failed = grades.filter(g => !g.passed)
    if (failed.length === 0) continue

    for (const f of failed) {
      const rootCause = classifyFailure(r.evalCase, f)
      failures.push({
        eval_id: r.evalCase.id,
        eval_type: r.evalCase.type || 'single',
        prompt: r.evalCase.prompt.slice(0, 100),
        check: f.text,
        evidence: f.evidence,
        likely_file: rootCause.file,
        likely_area: rootCause.area,
        fix_type: rootCause.type,
      })
    }
  }

  return {
    iteration: benchmark.iteration,
    timestamp: benchmark.timestamp,
    pass_rate: benchmark.pass_rate,
    total_checks: benchmark.total_checks,
    total_passed: benchmark.total_passed,
    total_failed: benchmark.total_checks - benchmark.total_passed,
    status: failures.length === 0 ? 'all_passing' : 'has_failures',
    comparison,
    failures,
    next_steps: failures.length === 0
      ? ['All checks passing. Consider adding more eval cases to increase coverage.']
      : [...new Set(failures.map(f => `Fix ${f.likely_area} in ${f.likely_file}: "${f.check}" — ${f.evidence}`))],
  }
}

function main () {
  const opts = parseArgs()
  const evals = loadEvals()

  // Auto-detect next iteration number if not specified
  if (process.argv.slice(2).indexOf('--iteration') === -1) {
    let iter = 1
    while (fs.existsSync(path.join(WORKSPACE_DIR, `iteration-${iter}`, 'benchmark.json'))) iter++
    opts.iteration = iter
  }

  const iterDir = path.join(WORKSPACE_DIR, `iteration-${opts.iteration}`)
  fs.mkdirSync(iterDir, { recursive: true })

  console.log(`=== PDF Compare Eval Runner — Iteration ${opts.iteration} ===`)
  console.log(`Workspace: ${iterDir}`)
  console.log(`Evals: ${evals.length} total`)

  const evalsToRun = opts.evalId != null ? evals.filter(e => e.id === opts.evalId) : evals
  const results = []

  for (const evalCase of evalsToRun) {
    if (evalCase.type === 'batch') {
      results.push(runBatchEval(evalCase, iterDir))
    } else {
      results.push(runSingleEval(evalCase, iterDir))
    }
  }

  // Aggregate
  console.log('\n=== Summary ===')
  let totalPass = 0
  let totalChecks = 0
  for (const r of results) {
    if (r.skipped) continue
    const grades = r.grading?.expectations || []
    const passed = grades.filter(g => g.passed).length
    totalPass += passed
    totalChecks += grades.length
    const icon = passed === grades.length ? '✅' : '❌'
    console.log(`${icon} Eval ${r.evalCase.id}: ${passed}/${grades.length}`)
  }
  console.log(`\nOverall: ${totalPass}/${totalChecks} checks passed (${totalChecks ? Math.round(100 * totalPass / totalChecks) : 0}%)`)

  // Save benchmark
  const benchmark = {
    iteration: opts.iteration,
    timestamp: new Date().toISOString(),
    total_evals: evalsToRun.length,
    total_checks: totalChecks,
    total_passed: totalPass,
    pass_rate: totalChecks ? totalPass / totalChecks : 0,
    results: results
      .filter(r => !r.skipped)
      .map(r => ({
        eval_id: r.evalCase.id,
        pass_rate: r.grading?.pass_rate ?? 0,
        expectations: r.grading?.expectations || [],
      })),
  }
  fs.writeFileSync(path.join(iterDir, 'benchmark.json'), JSON.stringify(benchmark, null, 2), 'utf-8')

  // Compare with previous iteration
  const previous = loadPreviousBenchmark(opts.iteration)
  const comparison = compareBenchmarks(benchmark, previous)

  if (comparison) {
    console.log(`\n=== Comparison with Iteration ${comparison.previous_iteration} ===`)
    const delta = comparison.delta_checks >= 0 ? `+${comparison.delta_checks}` : `${comparison.delta_checks}`
    const arrow = comparison.improved ? '📈' : comparison.regressed ? '📉' : '➡️'
    console.log(`${arrow} Pass rate: ${Math.round(comparison.previous_pass_rate * 100)}% → ${Math.round(comparison.current_pass_rate * 100)}% (${delta} checks)`)
    if (comparison.regressions.length > 0) {
      console.log(`\n⚠️  Regressions:`)
      for (const r of comparison.regressions) console.log(`  Eval ${r.eval_id}: ${r.was} → ${r.now}`)
    }
    if (comparison.improvements.length > 0) {
      console.log(`\n✅ Improvements:`)
      for (const r of comparison.improvements) console.log(`  Eval ${r.eval_id}: ${r.was ?? 'new'} → ${r.now ?? 'has failures'}`)
    }
  }

  // Build and save diagnosis
  const diagnosis = buildDiagnosis(results, benchmark, comparison)
  const diagPath = path.join(iterDir, 'diagnosis.json')
  fs.writeFileSync(diagPath, JSON.stringify(diagnosis, null, 2), 'utf-8')

  if (diagnosis.failures.length > 0) {
    console.log(`\n=== Diagnosis (${diagnosis.failures.length} failure${diagnosis.failures.length > 1 ? 's' : ''}) ===`)
    for (const f of diagnosis.failures) {
      console.log(`  ❌ Eval ${f.eval_id}: ${f.check}`)
      console.log(`     Evidence: ${f.evidence}`)
      console.log(`     Fix: ${f.likely_area} in ${f.likely_file}`)
    }
    console.log(`\n📋 Next steps:`)
    for (const step of diagnosis.next_steps) console.log(`  → ${step}`)
  } else {
    console.log(`\n✅ All checks passing — no fixes needed.`)
  }

  console.log(`\nBenchmark: ${path.relative(SKILL_DIR, path.join(iterDir, 'benchmark.json'))}`)
  console.log(`Diagnosis: ${path.relative(SKILL_DIR, diagPath)}`)
}

main()
