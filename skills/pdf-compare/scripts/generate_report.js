#!/usr/bin/env node
/**
 * Generate a comprehensive HTML analysis report from analysis.json + comparison data.
 *
 * Reads:
 *   - inbox/output/analysis.json  (LLM-written structured analysis)
 *   - inbox/output/[pair-N/]report.json  (raw comparison data)
 *   - inbox/output/[pair-N/]left_page_*.png, right_page_*.png, diff_page_*.png
 *
 * Produces:
 *   - inbox/output/analysis_report.html  (self-contained, opens in browser)
 *
 * Usage:
 *   node scripts/generate_report.js [--no-open]
 *   npm run report
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.join(__dirname, '..', 'inbox', 'output')
const shouldOpen = !process.argv.includes('--no-open')

// ── Helpers ────────────────────────────────────────────────────────────────────

function parsePageRef (ref) {
  if (!ref) return []
  const nums = []
  for (const part of String(ref).split(/[,;]/)) {
    const range = part.trim().match(/^(\d+)\s*-\s*(\d+)$/)
    if (range) {
      for (let i = parseInt(range[1]); i <= parseInt(range[2]); i++) nums.push(i)
    } else {
      const n = parseInt(part.trim())
      if (!isNaN(n)) nums.push(n)
    }
  }
  return nums
}

function readReportData (dir) {
  const p = path.join(dir, 'report.json')
  if (!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function imageToBase64 (imgPath) {
  if (!imgPath || !fs.existsSync(imgPath)) return null
  return fs.readFileSync(imgPath).toString('base64')
}

function findPageImages (outdir, pageNum) {
  const pad = String(pageNum).padStart(4, '0')
  return {
    left: imageToBase64(path.join(outdir, `left_page_${pad}.png`)),
    right: imageToBase64(path.join(outdir, `right_page_${pad}.png`)),
    diff: imageToBase64(path.join(outdir, `diff_page_${pad}.png`))
  }
}

/** Build a map from alignment page number → { left_page, right_page, match_type, match_similarity } */
function buildPageMap (report) {
  const map = new Map()
  if (!report?.pages) return map
  for (const p of report.pages) {
    map.set(p.page, {
      left_page: p.left_page ?? null,
      right_page: p.right_page ?? null,
      match_type: p.match_type,
      match_similarity: p.match_similarity
    })
  }
  return map
}

/**
 * Build a human-readable page label from alignment positions by resolving to actual PDF page numbers.
 * E.g. alignment pos 14 with L13/R14 → "Left p13 / Right p14"
 *      alignment pos 11 (inserted R11) → "Right p11 (new)"
 *      alignment pos 21 (deleted L19) → "Left p19 (removed)"
 */
function buildPageLabel (pagesStr, pageMap) {
  if (!pagesStr) return 'Page ?'
  const positions = parsePageRef(pagesStr)
  if (positions.length === 0) return 'Page ?'

  const labels = []
  for (const pos of positions) {
    const m = pageMap.get(pos)
    if (!m) { labels.push(`Page ${pos}`); continue }

    if (m.match_type === 'inserted') {
      labels.push(`Right p${m.right_page} (new)`)
    } else if (m.match_type === 'deleted') {
      labels.push(`Left p${m.left_page} (removed)`)
    } else if (m.left_page != null && m.right_page != null) {
      if (m.left_page === m.right_page) {
        labels.push(`Page ${m.left_page}`)
      } else {
        labels.push(`Left p${m.left_page} / Right p${m.right_page}`)
      }
    } else {
      labels.push(`Page ${pos}`)
    }
  }
  return labels.join(', ')
}

function esc (str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function verdictClass (verdict) {
  const v = (verdict || '').toUpperCase()
  if (v === 'IDENTICAL') return 'identical'
  if (v === 'ROUTINE UPDATE') return 'routine'
  if (v === 'NEEDS REVIEW') return 'review'
  if (v === 'INVESTIGATE') return 'investigate'
  return 'review'
}

// ── CSS ────────────────────────────────────────────────────────────────────────

const CSS = `
:root {
  --bg: #f4f6f8; --card: #ffffff; --border: #e0e4e8; --text: #1a1a2e;
  --green: #0f9d58; --red: #db4437; --blue: #4285f4; --amber: #f4b400;
  --gray: #6b7280; --light-gray: #f0f2f5;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  background: var(--bg); color: var(--text); line-height: 1.6;
  max-width: 1200px; margin: 0 auto; padding: 2rem;
}
.report-header {
  margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 3px solid var(--border);
}
.report-header h1 { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
.header-meta { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
.date { color: var(--gray); font-size: 0.95rem; }
.batch-summary { color: var(--text); font-size: 1rem; margin-top: 0.5rem; }

.card {
  background: var(--card); border: 1px solid var(--border); border-radius: 10px;
  padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
h2 { font-size: 1.35rem; margin-bottom: 1rem; }
h3 {
  font-size: 1.1rem; margin: 1.5rem 0 0.75rem; color: var(--text);
  border-bottom: 1px solid var(--border); padding-bottom: 0.4rem;
}

/* Verdict badges */
.verdict-badge {
  display: inline-block; padding: 0.25rem 0.75rem; border-radius: 5px;
  font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.03em;
}
.verdict-badge.large { font-size: 1rem; padding: 0.35rem 1rem; }
.verdict-badge.identical { background: #d4edda; color: #155724; }
.verdict-badge.routine { background: #d1ecf1; color: #0c5460; }
.verdict-badge.review { background: #fff3cd; color: #856404; }
.verdict-badge.investigate { background: #f8d7da; color: #721c24; }

/* Overview table */
.overview-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.overview-table th, .overview-table td {
  padding: 0.6rem 0.75rem; text-align: left; border-bottom: 1px solid var(--border);
}
.overview-table th { background: var(--light-gray); font-weight: 600; }
.overview-table tr:hover { background: #f8f9fa; }
.overview-table a { color: var(--blue); text-decoration: none; font-weight: 600; }

/* Pair sections */
.pair-section { scroll-margin-top: 1rem; }
.pair-header {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;
}
.pair-header h2 { margin-bottom: 0; font-size: 1.2rem; }
.revision-type {
  font-size: 0.85rem; color: var(--gray); font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;
}
.pair-summary { font-size: 1rem; line-height: 1.7; margin-bottom: 1rem; }
.pair-meta { display: flex; gap: 1.5rem; font-size: 0.9rem; color: var(--gray); margin-bottom: 1rem; }

/* Findings */
.finding {
  margin: 1rem 0; padding: 1rem 1.25rem; background: var(--light-gray);
  border-radius: 8px; border-left: 4px solid var(--gray);
}
.finding.substantive { border-left-color: var(--amber); }
.finding.structural { border-left-color: var(--red); }
.finding.visual { border-left-color: var(--blue); }
.finding-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
.finding-type {
  font-size: 0.75rem; font-weight: 600; text-transform: uppercase;
  padding: 0.15rem 0.5rem; border-radius: 3px; letter-spacing: 0.04em;
}
.finding-type.substantive { background: #fff3cd; color: #856404; }
.finding-type.structural { background: #f8d7da; color: #721c24; }
.finding-type.visual { background: #cce5ff; color: #004085; }
.finding-pages { font-size: 0.85rem; color: var(--gray); font-weight: 500; }
.finding-text {
  line-height: 1.6; margin-bottom: 0.4rem;
  font-family: 'SF Mono', 'Fira Code', Consolas, monospace; font-size: 0.88rem;
}
.finding-significance {
  font-size: 0.9rem; color: #444; line-height: 1.6; font-style: italic;
  padding-top: 0.3rem; border-top: 1px solid #ddd; margin-top: 0.4rem;
}

/* Side-by-side images */
.side-by-side { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
.side-panel {
  border: 1px solid var(--border); border-radius: 6px; overflow: hidden; background: white;
}
.side-panel img { width: 100%; display: block; }
.panel-label {
  padding: 0.4rem 0.75rem; background: var(--light-gray); font-size: 0.8rem;
  font-weight: 600; color: var(--gray); border-bottom: 1px solid var(--border);
}
.diff-overlay { margin: 0.5rem 0 1rem; }
.diff-overlay summary {
  cursor: pointer; font-size: 0.85rem; color: var(--blue); font-weight: 500; padding: 0.3rem 0;
}
.diff-overlay img {
  width: 100%; max-width: 600px; border: 1px solid var(--border);
  border-radius: 6px; margin-top: 0.5rem;
}

/* Cosmetic + recommendation */
.cosmetic-text { font-size: 0.9rem; color: var(--gray); }
.recommendation {
  margin-top: 1.25rem; padding: 0.75rem 1rem; background: #e8f4fd;
  border-left: 4px solid var(--blue); border-radius: 0 6px 6px 0; font-size: 0.95rem;
}
.match-warning {
  margin: 0.5rem 0; padding: 0.5rem 0.75rem; background: #fff8e1;
  border: 1px solid #ffe082; border-radius: 6px; font-size: 0.85rem;
  color: #856404;
}

.pair-back { margin-top: 1rem; text-align: right; }
.pair-back a { color: var(--blue); text-decoration: none; font-size: 0.85rem; }

.report-footer {
  margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border);
  text-align: center; font-size: 0.8rem; color: var(--gray);
}

@media (max-width: 768px) {
  body { padding: 1rem; }
  .side-by-side { grid-template-columns: 1fr; }
  .pair-header { flex-direction: column; align-items: flex-start; }
}
@media print {
  body { padding: 0; max-width: none; }
  .card { box-shadow: none; break-inside: avoid; }
  .pair-section { break-before: page; }
  .pair-back { display: none; }
}
`

// ── Read analysis.json ─────────────────────────────────────────────────────────

const analysisPath = path.join(OUTPUT_DIR, 'analysis.json')
if (!fs.existsSync(analysisPath)) {
  console.error(`analysis.json not found at: ${analysisPath}`)
  console.error('Write the analysis file first, then run this command.')
  process.exit(1)
}

const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'))

// ── Resolve pairs ──────────────────────────────────────────────────────────────

const pairsAnalysis = analysis.pairs || []
const isSinglePair = pairsAnalysis.length === 1

function pairOutdir (pairNum) {
  // Always prefer pair-N/ subdirectory if it exists; fall back to root for single-pair inbox runs
  const sub = path.join(OUTPUT_DIR, `pair-${pairNum}`)
  if (fs.existsSync(path.join(sub, 'report.json'))) return sub
  return OUTPUT_DIR
}

// ── Build HTML fragments ───────────────────────────────────────────────────────

const title = isSinglePair ? 'PDF Comparison Analysis' : 'Batch PDF Comparison Analysis'
const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

const needsReview = pairsAnalysis.filter(p => {
  const v = (p.verdict || '').toUpperCase()
  return v === 'NEEDS REVIEW' || v === 'INVESTIGATE'
})

const batchVerdictText = isSinglePair
  ? pairsAnalysis[0]?.verdict || 'UNKNOWN'
  : needsReview.length === 0
    ? 'All pairs routine — no investigation needed'
    : `${needsReview.length} of ${pairsAnalysis.length} pair${pairsAnalysis.length > 1 ? 's' : ''} need review`

const headerVerdictClass = isSinglePair
  ? verdictClass(pairsAnalysis[0]?.verdict)
  : verdictClass(needsReview.length > 0 ? 'INVESTIGATE' : 'ROUTINE UPDATE')

// Overview table (batch only)
function buildOverviewTable () {
  const rows = pairsAnalysis.map(p => {
    const report = readReportData(pairOutdir(p.pair))
    const s = report?.summary || {}
    const pageInfo = s.page_count_match
      ? `${s.left_page_count || '?'}`
      : `${s.left_page_count || '?'}→${s.right_page_count || '?'}`
    return `<tr>
      <td><a href="#pair-${p.pair}">${p.pair}</a></td>
      <td>${esc(p.left || '')}</td>
      <td>${esc(p.right || '')}</td>
      <td>${pageInfo}</td>
      <td><span class="verdict-badge ${verdictClass(p.verdict)}">${esc(p.verdict)}</span></td>
      <td>${esc(p.recommendation || '')}</td>
    </tr>`
  }).join('\n')

  return `<section class="overview card" id="overview">
  <h2>Overview</h2>
  <table class="overview-table">
    <thead><tr><th>Pair</th><th>Left</th><th>Right</th><th>Pages</th><th>Verdict</th><th>Recommendation</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</section>`
}

// Per-pair section
function buildPairSection (p) {
  const outdir = pairOutdir(p.pair)
  const report = readReportData(outdir)
  const s = report?.summary || {}
  const pageMap = buildPageMap(report)
  const h = []

  h.push(`<section class="pair-section card" id="pair-${p.pair}">`)

  // Header
  const heading = isSinglePair ? 'Analysis' : `Pair ${p.pair}: ${esc(p.left || '')} ↔ ${esc(p.right || '')}`
  h.push(`<div class="pair-header">
    <h2>${heading}</h2>
    <span class="verdict-badge large ${verdictClass(p.verdict)}">${esc(p.verdict)}</span>
  </div>`)

  if (p.revision_type) {
    h.push(`<div class="revision-type">${esc(p.revision_type)}</div>`)
  }
  h.push(`<div class="pair-summary">${esc(p.summary)}</div>`)

  // Page stats
  if (s.left_page_count != null) {
    h.push(`<div class="pair-meta">
      <span>Left: <strong>${s.left_page_count}</strong> pages</span>
      <span>Right: <strong>${s.right_page_count}</strong> pages</span>
      <span>Changed: <strong>${s.total_changed || 0}</strong></span>
    </div>`)
  }

  // Findings
  const findings = p.findings || []
  if (findings.length > 0) {
    h.push('<h3>Key Findings</h3>')
    for (const f of findings) {
      h.push(`<div class="finding ${f.type || ''}">`)
      h.push('<div class="finding-header">')
      if (f.type) h.push(`<span class="finding-type ${f.type}">${esc(f.type)}</span>`)

      // Resolve alignment positions to actual PDF page numbers for the label
      const pageLabel = buildPageLabel(f.pages, pageMap)
      h.push(`<span class="finding-pages">${esc(pageLabel)}</span>`)

      h.push('</div>')
      h.push(`<div class="finding-text">${esc(f.finding)}</div>`)
      if (f.significance) {
        h.push(`<div class="finding-significance">${esc(f.significance)}</div>`)
      }

      // Inline page images for findings
      if (f.pages && report) {
        const pageNums = parsePageRef(f.pages)
        for (const pg of pageNums.slice(0, 2)) {
          const imgs = findPageImages(outdir, pg)
          const mapping = pageMap.get(pg) || {}
          const lp = mapping.left_page
          const rp = mapping.right_page
          const sim = mapping.match_similarity
          const leftLabel = lp != null ? `Left (Original) — Page ${lp}` : 'Left (Original)'
          const rightLabel = rp != null ? `Right (Revised) — Page ${rp}` : 'Right (Revised)'
          if (imgs.left || imgs.right) {
            // Show low-confidence warning when match similarity is below 0.7
            if (sim != null && sim < 0.7) {
              h.push(`<div class="match-warning">⚠ Low match confidence (${(sim * 100).toFixed(0)}%) — these pages may not correspond directly. The page alignment shifted due to inserted/deleted pages.</div>`)
            }
            // Show reorder notice
            if (mapping.match_type === 'reordered') {
              h.push(`<div class="match-warning" style="border-left-color:#2196F3;background:#e3f2fd;">ℹ️ Reordered page — left page ${lp} moved to right page ${rp} (${(sim * 100).toFixed(0)}% similarity).</div>`)
            }
            h.push('<div class="side-by-side">')
            if (imgs.left) {
              h.push(`<div class="side-panel">
                <div class="panel-label">${leftLabel}</div>
                <img src="data:image/png;base64,${imgs.left}" alt="Left page ${lp || pg}" loading="lazy" />
              </div>`)
            }
            if (imgs.right) {
              h.push(`<div class="side-panel">
                <div class="panel-label">${rightLabel}</div>
                <img src="data:image/png;base64,${imgs.right}" alt="Right page ${rp || pg}" loading="lazy" />
              </div>`)
            }
            h.push('</div>')
            if (imgs.diff) {
              h.push(`<details class="diff-overlay">
                <summary>Show diff overlay — Left page ${lp || pg} vs Right page ${rp || pg}</summary>
                <img src="data:image/png;base64,${imgs.diff}" alt="Diff overlay" loading="lazy" />
              </details>`)
            }
          }
        }
      }

      h.push('</div>') // .finding
    }
  }

  // Cosmetic summary
  if (p.cosmetic_summary) {
    h.push('<h3>Cosmetic / Boilerplate</h3>')
    h.push(`<p class="cosmetic-text">${esc(p.cosmetic_summary)}</p>`)
  }

  // Recommendation
  if (p.recommendation) {
    h.push(`<div class="recommendation"><strong>Recommendation:</strong> ${esc(p.recommendation)}</div>`)
  }

  if (!isSinglePair) {
    h.push('<div class="pair-back"><a href="#overview">↑ Back to overview</a></div>')
  }
  h.push('</section>')
  return h.join('\n')
}

// ── Assemble page ──────────────────────────────────────────────────────────────

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>${CSS}</style>
</head>
<body>

<header class="report-header">
  <h1>${title}</h1>
  <div class="header-meta">
    <span class="date">${dateStr}</span>
    <span class="verdict-badge large ${headerVerdictClass}">${batchVerdictText}</span>
  </div>
  ${analysis.batch_summary ? `<p class="batch-summary">${esc(analysis.batch_summary)}</p>` : ''}
</header>

${!isSinglePair ? buildOverviewTable() : ''}

${pairsAnalysis.map(buildPairSection).join('\n')}

<footer class="report-footer">Generated by pdf-compare skill · ${dateStr}</footer>

</body>
</html>`

// ── Write + open ───────────────────────────────────────────────────────────────

const htmlPath = path.join(OUTPUT_DIR, 'analysis_report.html')
fs.writeFileSync(htmlPath, html, 'utf-8')
console.log(`Analysis report: ${htmlPath}`)

if (shouldOpen) {
  try {
    const cmd = process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'start'
        : 'xdg-open'
    execSync(`${cmd} "${htmlPath}"`)
  } catch { /* ignore */ }
}
