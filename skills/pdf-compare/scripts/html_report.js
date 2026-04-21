/**
 * Generate a self-contained HTML report from a comparison report object.
 * Embeds diff images as base64 inline so the HTML works standalone.
 *
 * Features:
 * - Sticky sidebar TOC with jump links
 * - Filter by change type (substantive / structural / cosmetic)
 * - Full-text search across diffs
 * - Inserted/deleted page text content
 * - Triage summary section
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * @param {object} report - The report object from compare_pdfs.
 * @param {string} outdir - Output directory (for reading diff images).
 * @returns {string} Path to the written HTML file.
 */
export function writeHtmlReport (report, outdir) {
  const s = report.summary
  const pages = report.pages || []
  const triage = report.triage || { structural: [], substantive: [], cosmetic: [], global_patterns: [] }

  // Build triage lookup: page number → category
  const triageMap = {}
  for (const item of triage.structural) triageMap[item.page] = 'structural'
  for (const item of triage.substantive) triageMap[item.page] = 'substantive'
  for (const pg of triage.cosmetic) triageMap[pg] = 'cosmetic'

  // Collect inline diff images
  const diffImages = {}
  for (const p of pages) {
    if (p.diff_image_path && fs.existsSync(p.diff_image_path)) {
      const buf = fs.readFileSync(p.diff_image_path)
      diffImages[p.page] = buf.toString('base64')
    }
  }

  const statusClass = s.identical ? 'identical' : 'different'
  const statusText = s.identical ? 'IDENTICAL' : 'DIFFERENT'
  const statusEmoji = s.identical ? '✅' : '⚠️'

  const metaDiffRows = Object.entries(report.metadata_diff || {}).map(([key, v]) =>
    `<tr><td>${esc(key)}</td><td class="del">${esc(v.left || '(empty)')}</td><td class="ins">${esc(v.right || '(empty)')}</td></tr>`
  ).join('\n')

  // Build triage summary section
  const triageSummaryHtml = buildTriageSummary(triage)

  // Build sidebar TOC entries + page detail sections
  const tocEntries = []
  const pageDetailSections = []

  for (const p of pages) {
    const cat = triageMap[p.page] || 'unchanged'
    const hasVisualDiff = !!diffImages[p.page]
    const hasTextDiff = p.text_diff_lines && p.text_diff_lines.length > 0
    const hasPageText = !!p.page_text
    const hasAnyDetail = hasVisualDiff || hasTextDiff || hasPageText

    // Page label
    let pageLabel, shortLabel
    if (p.left_page != null && p.right_page != null) {
      shortLabel = p.left_page === p.right_page ? `P${p.left_page}` : `L${p.left_page}↔R${p.right_page}`
      pageLabel = p.left_page === p.right_page ? `Page ${p.left_page}` : `Left ${p.left_page} ↔ Right ${p.right_page}`
    } else if (p.left_page != null) {
      shortLabel = `L${p.left_page}`
      pageLabel = `Left ${p.left_page} (deleted)`
    } else if (p.right_page != null) {
      shortLabel = `R${p.right_page}`
      pageLabel = `Right ${p.right_page} (inserted)`
    } else {
      shortLabel = `P${p.page}`
      pageLabel = `Page ${p.page}`
    }

    // TOC entry — icon based on category
    const catIcon = { structural: '🔧', substantive: '⚠️', cosmetic: '✏️', unchanged: '✓' }[cat]
    if (p.text_changed || p.visual_changed) {
      tocEntries.push(`<a href="#page-${p.page}" class="toc-item toc-${cat}" data-category="${cat}" title="${esc(pageLabel)}">${catIcon} ${shortLabel}</a>`)
    }

    // Page detail section
    if (hasAnyDetail) {
      const matchBadge = p.match_type ? `<span class="badge badge-${p.match_type}">${p.match_type}</span>` : ''
      const scoreBadge = p.visual_score != null ? `<span class="score">score: ${p.visual_score.toFixed(4)}</span>` : ''
      const catBadge = cat !== 'unchanged' ? `<span class="badge badge-triage-${cat}">${cat}</span>` : ''

      let sectionContent = ''

      // Inserted/deleted page full text
      if (hasPageText) {
        sectionContent += `
        <div class="page-text-section">
          <h4>📄 Page Content</h4>
          <pre class="page-text-block">${esc(p.page_text)}</pre>
        </div>`
      }

      // Visual diff image + analysis
      if (hasVisualDiff) {
        const visualList = (p.visual_changes && p.visual_changes.length > 0)
          ? `<div class="change-group"><h4>Visual / Layout Changes</h4><ul class="change-list visual">${p.visual_changes.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>`
          : ''
        const textAreaList = (p.text_area_visual_changes && p.text_area_visual_changes.length > 0)
          ? `<div class="change-group"><h4>Text-Area Changes <span class="badge badge-matched">covered by text diff</span></h4><ul class="change-list text-area">${p.text_area_visual_changes.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>`
          : ''
        sectionContent += `
        <div class="diff-image-section">
          ${visualList}
          ${textAreaList}
          <img src="data:image/png;base64,${diffImages[p.page]}" alt="Diff page ${p.page}" loading="lazy" />
        </div>`
      }

      // Text diff
      if (hasTextDiff) {
        const lines = p.text_diff_lines.map(line => {
          if (line.startsWith('+') && !line.startsWith('+++')) {
            return `<span class="diff-add">${esc(line)}</span>`
          } else if (line.startsWith('-') && !line.startsWith('---')) {
            return `<span class="diff-del">${esc(line)}</span>`
          } else if (line.startsWith('@@')) {
            return `<span class="diff-hunk">${esc(line)}</span>`
          }
          return `<span>${esc(line)}</span>`
        }).join('\n')
        const stats = p.text_diff_stats || {}
        sectionContent += `
        <details class="text-diff-section" open>
          <summary><strong>Text Changes</strong> <span class="ins">+${stats.insertions || 0}</span> <span class="del">-${stats.deletions || 0}</span></summary>
          <pre class="diff-block">${lines}</pre>
        </details>`
      }

      pageDetailSections.push(`
      <div id="page-${p.page}" class="page-section card" data-category="${cat}" data-page="${p.page}">
        <h3>${esc(pageLabel)} ${matchBadge} ${catBadge} ${scoreBadge}</h3>
        ${sectionContent}
      </div>`)
    }
  }

  // Summary table rows
  const pageRows = pages.map(p => {
    const cat = triageMap[p.page] || 'unchanged'
    const textCls = p.text_changed ? 'changed' : (p.text_changed === null ? 'skipped' : 'unchanged')
    const visCls = p.visual_changed ? 'changed' : (p.visual_changed === null ? 'skipped' : 'unchanged')
    const textLabel = p.text_changed === null ? '—' : (p.text_changed ? 'Yes' : 'No')
    const visLabel = p.visual_changed === null ? '—' : (p.visual_changed ? 'Yes' : 'No')
    const score = p.visual_score != null ? p.visual_score.toFixed(4) : '—'

    const notesParts = []
    if (p.text_diff_stats && (p.text_diff_stats.insertions || p.text_diff_stats.deletions)) {
      notesParts.push(`<span class="ins">+${p.text_diff_stats.insertions}</span> <span class="del">-${p.text_diff_stats.deletions}</span>`)
    }
    if (p.match_type) {
      const badges = { matched: '🔗', inserted: '➕', deleted: '➖', replaced: '🔄' }
      notesParts.push(`<span class="badge badge-${p.match_type}">${badges[p.match_type] || p.match_type}</span>`)
    }
    if (p.notes) notesParts.push(esc(p.notes))
    const notes = notesParts.join(' · ') || '—'

    let pageLabel
    if (p.left_page != null && p.right_page != null) {
      pageLabel = p.left_page === p.right_page ? `${p.left_page}` : `L${p.left_page} ↔ R${p.right_page}`
    } else if (p.left_page != null) {
      pageLabel = `L${p.left_page} (del)`
    } else if (p.right_page != null) {
      pageLabel = `R${p.right_page} (ins)`
    } else {
      pageLabel = `${p.page}`
    }

    return `<tr class="${textCls === 'changed' || visCls === 'changed' ? 'row-changed' : ''}" data-category="${cat}">
      <td><a href="#page-${p.page}">${pageLabel}</a></td>
      <td class="${textCls}">${textLabel}</td>
      <td class="${visCls}">${visLabel}</td>
      <td>${score}</td>
      <td><span class="badge badge-triage-${cat}">${cat}</span></td>
      <td>${notes}</td>
    </tr>`
  }).join('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>PDF Comparison Report</title>
<style>
  :root { --bg: #f8f9fa; --card: #fff; --border: #dee2e6; --text: #212529;
          --green: #198754; --red: #dc3545; --blue: #0d6efd; --yellow: #ffc107;
          --gray: #6c757d; --sidebar-w: 200px; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
         background: var(--bg); color: var(--text); line-height: 1.5; }
  .layout { display: flex; min-height: 100vh; }
  .sidebar { position: sticky; top: 0; height: 100vh; width: var(--sidebar-w); min-width: var(--sidebar-w);
             background: #1e1e2e; color: #cdd6f4; overflow-y: auto; padding: 1rem 0.5rem;
             font-size: 0.8rem; border-right: 1px solid #313244; flex-shrink: 0; }
  .sidebar h2 { font-size: 0.9rem; padding: 0 0.5rem 0.5rem; border-bottom: 1px solid #313244; margin-bottom: 0.5rem; color: #cdd6f4; }
  .sidebar .toc-item { display: block; padding: 0.25rem 0.5rem; border-radius: 4px; text-decoration: none;
                       color: #bac2de; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sidebar .toc-item:hover { background: #313244; color: #cdd6f4; }
  .sidebar .toc-item.toc-structural { color: #89b4fa; }
  .sidebar .toc-item.toc-substantive { color: #fab387; }
  .sidebar .toc-item.toc-cosmetic { color: #a6adc8; }
  .sidebar-filters { padding: 0.5rem; margin-bottom: 0.5rem; border-bottom: 1px solid #313244; }
  .sidebar-filters label { display: flex; align-items: center; gap: 0.3rem; padding: 0.15rem 0; cursor: pointer; font-size: 0.78rem; }
  .sidebar-filters input[type="checkbox"] { accent-color: var(--blue); }
  .search-bar { padding: 0.5rem; border-bottom: 1px solid #313244; }
  .search-bar input { width: 100%; padding: 0.3rem 0.5rem; border: 1px solid #45475a; border-radius: 4px;
                      background: #313244; color: #cdd6f4; font-size: 0.8rem; outline: none; }
  .search-bar input::placeholder { color: #6c7086; }
  .search-bar input:focus { border-color: var(--blue); }
  .search-count { font-size: 0.7rem; color: #6c7086; padding: 0.2rem 0.5rem; }
  .main { flex: 1; padding: 2rem; max-width: calc(100% - var(--sidebar-w)); overflow-x: hidden; }
  .container { max-width: 1000px; margin: 0 auto; }
  h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
  h2 { font-size: 1.25rem; margin: 1.5rem 0 0.75rem; border-bottom: 2px solid var(--border); padding-bottom: 0.4rem; }
  h3 { font-size: 1.1rem; margin: 1rem 0 0.5rem; }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 1.25rem; margin-bottom: 1.25rem; }
  .status { display: inline-block; padding: 0.3rem 0.8rem; border-radius: 4px; font-weight: 600; font-size: 0.95rem; }
  .status.identical { background: #d1e7dd; color: var(--green); }
  .status.different { background: #f8d7da; color: var(--red); }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 2rem; font-size: 0.9rem; margin-top: 0.75rem; }
  .meta-grid dt { font-weight: 600; color: var(--gray); }
  .meta-grid dd { margin: 0; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  th, td { padding: 0.5rem 0.75rem; text-align: left; border-bottom: 1px solid var(--border); }
  th { background: var(--bg); font-weight: 600; position: sticky; top: 0; z-index: 1; }
  tr.row-changed { background: #fff3cd; }
  tr:hover { background: #e9ecef; }
  .changed { color: var(--red); font-weight: 600; }
  .unchanged { color: var(--green); }
  .skipped { color: var(--gray); }
  .ins { color: var(--green); font-weight: 600; }
  .del { color: var(--red); font-weight: 600; }
  .score { color: var(--gray); font-size: 0.85rem; margin-left: 0.5rem; }
  .badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 3px; font-size: 0.8rem; font-weight: 500; }
  .badge-matched { background: #d1e7dd; color: var(--green); }
  .badge-inserted { background: #cff4fc; color: #055160; }
  .badge-deleted { background: #f8d7da; color: var(--red); }
  .badge-replaced { background: #fff3cd; color: #664d03; }
  .badge-triage-structural { background: #cff4fc; color: #055160; }
  .badge-triage-substantive { background: #fff3cd; color: #664d03; }
  .badge-triage-cosmetic { background: #e9ecef; color: var(--gray); }
  .badge-triage-unchanged { background: #d1e7dd; color: var(--green); }
  .triage-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1rem 0; }
  .triage-card { padding: 1rem; border-radius: 8px; border: 1px solid var(--border); }
  .triage-card h4 { font-size: 0.9rem; margin-bottom: 0.5rem; }
  .triage-card .count { font-size: 2rem; font-weight: 700; }
  .triage-card.structural { background: #cff4fc; border-color: #9eeaf9; }
  .triage-card.substantive { background: #fff3cd; border-color: #ffe69c; }
  .triage-card.cosmetic { background: #f0f0f0; border-color: #ddd; }
  .triage-card ul { list-style: none; padding: 0; margin: 0.5rem 0 0; font-size: 0.85rem; }
  .triage-card li { padding: 0.15rem 0; }
  .global-patterns { margin: 1rem 0; }
  .global-patterns .pattern { background: #f0f0f0; padding: 0.5rem 0.75rem; border-radius: 4px; margin: 0.3rem 0; font-size: 0.85rem; }
  .page-section { scroll-margin-top: 1rem; }
  .page-section.hidden, .page-section.search-hidden { display: none; }
  .diff-image-section { margin: 1rem 0; }
  .diff-image-section img { max-width: 100%; border: 1px solid var(--border); border-radius: 4px; }
  .change-list { list-style: none; padding: 0; margin: 0.5rem 0; }
  .change-list li { padding: 0.3rem 0.6rem; margin: 0.2rem 0; background: #f0f0f0; border-radius: 0 4px 4px 0; font-size: 0.85rem; }
  .change-list.visual li { border-left: 3px solid var(--blue); }
  .change-list.text-area li { border-left: 3px solid var(--gray); opacity: 0.7; }
  .change-group { margin: 0.5rem 0; }
  .change-group h4 { font-size: 0.9rem; margin-bottom: 0.3rem; color: var(--gray); }
  .text-diff-section { margin: 1rem 0; }
  .text-diff-section summary { cursor: pointer; padding: 0.5rem 0; }
  .diff-block { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px;
                font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; font-size: 0.82rem;
                line-height: 1.6; overflow-x: auto; white-space: pre; }
  .diff-block .diff-add { color: #4ec369; background: rgba(78, 195, 105, 0.1); display: block; }
  .diff-block .diff-del { color: #f14c4c; background: rgba(241, 76, 76, 0.1); display: block; }
  .diff-block .diff-hunk { color: #6cb6ff; display: block; margin-top: 0.25rem; }
  .page-text-section { margin: 1rem 0; }
  .page-text-section h4 { color: var(--blue); font-size: 0.95rem; margin-bottom: 0.5rem; }
  .page-text-block { background: #f0f7ff; color: var(--text); padding: 1rem; border-radius: 6px;
                     border: 1px solid #b6d4fe; font-family: 'SF Mono', monospace; font-size: 0.82rem;
                     line-height: 1.6; overflow-x: auto; white-space: pre-wrap; word-break: break-word; }
  mark.search-hit { background: #ffc107; color: #000; padding: 0 2px; border-radius: 2px; }
  .footer { margin-top: 2rem; font-size: 0.8rem; color: var(--gray); text-align: center; }
  code { background: #e9ecef; padding: 0.15rem 0.4rem; border-radius: 3px; font-size: 0.85rem; }
  a { color: var(--blue); }
  @media (max-width: 768px) {
    .layout { flex-direction: column; }
    .sidebar { position: relative; width: 100%; height: auto; min-width: 100%; max-height: 200px; }
    .main { max-width: 100%; padding: 1rem; }
    .meta-grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
<div class="layout">
  <nav class="sidebar" id="sidebar">
    <h2>Pages</h2>
    <div class="search-bar">
      <input type="text" id="searchInput" placeholder="Search diffs..." />
      <div class="search-count" id="searchCount"></div>
    </div>
    <div class="sidebar-filters">
      <label><input type="checkbox" class="filter-cb" value="structural" checked /> 🔧 Structural</label>
      <label><input type="checkbox" class="filter-cb" value="substantive" checked /> ⚠️ Substantive</label>
      <label><input type="checkbox" class="filter-cb" value="cosmetic" checked /> ✏️ Cosmetic</label>
    </div>
    <div id="tocList">
      ${tocEntries.join('\n      ')}
    </div>
  </nav>
  <div class="main">
    <div class="container">
      <h1>PDF Comparison Report</h1>
      <div class="card">
        <span class="status ${statusClass}">${statusEmoji} ${statusText}</span>
        <dl class="meta-grid">
          <dt>Left</dt><dd><code>${esc(path.basename(report.left))}</code></dd>
          <dt>Right</dt><dd><code>${esc(path.basename(report.right))}</code></dd>
          <dt>Left pages</dt><dd>${s.left_page_count}</dd>
          <dt>Right pages</dt><dd>${s.right_page_count}</dd>
          <dt>Changed pages</dt><dd>${s.total_changed}</dd>
          <dt>Generated</dt><dd>${report.generated_at}</dd>
        </dl>
      </div>
      ${triageSummaryHtml}
${metaDiffRows
? `      <div class="card">
        <h2>Metadata Differences</h2>
        <table><thead><tr><th>Field</th><th>Left</th><th>Right</th></tr></thead><tbody>${metaDiffRows}</tbody></table>
      </div>`
: ''}
      <div class="card">
        <h2>Per-Page Breakdown</h2>
        <table id="pageTable">
          <thead><tr><th>Page</th><th>Text</th><th>Visual</th><th>Score</th><th>Triage</th><th>Details</th></tr></thead>
          <tbody>${pageRows}</tbody>
        </table>
      </div>
      <h2 id="details-heading">Page Details</h2>
      ${pageDetailSections.join('\n')}
      <div class="footer">Generated by pdf-compare skill · Schema v${report.schema_version}</div>
    </div>
  </div>
</div>
<script>
const filterCbs = document.querySelectorAll('.filter-cb');
const tocItems = document.querySelectorAll('.toc-item');
const pageSecs = document.querySelectorAll('.page-section');
const tblRows = document.querySelectorAll('#pageTable tbody tr');
function applyFilters() {
  const active = new Set([...filterCbs].filter(c => c.checked).map(c => c.value));
  tocItems.forEach(i => { i.style.display = active.has(i.dataset.category) ? '' : 'none'; });
  pageSecs.forEach(s => { s.classList.toggle('hidden', !active.has(s.dataset.category)); });
  tblRows.forEach(r => { if (r.dataset.category) r.style.display = active.has(r.dataset.category) ? '' : 'none'; });
}
filterCbs.forEach(cb => cb.addEventListener('change', applyFilters));
const searchInput = document.getElementById('searchInput');
const searchCount = document.getElementById('searchCount');
function clearHL() {
  document.querySelectorAll('mark.search-hit').forEach(m => {
    const p = m.parentNode; p.replaceChild(document.createTextNode(m.textContent), m); p.normalize();
  });
}
function hlText(el, q) {
  if (!q) return 0;
  let count = 0;
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  while (w.nextNode()) nodes.push(w.currentNode);
  const lq = q.toLowerCase();
  for (const n of nodes) {
    const t = n.textContent, idx = t.toLowerCase().indexOf(lq);
    if (idx === -1) continue;
    const mk = document.createElement('mark');
    mk.className = 'search-hit'; mk.textContent = t.substring(idx, idx + q.length);
    const frag = document.createDocumentFragment();
    if (idx > 0) frag.appendChild(document.createTextNode(t.substring(0, idx)));
    frag.appendChild(mk);
    if (idx + q.length < t.length) frag.appendChild(document.createTextNode(t.substring(idx + q.length)));
    n.parentNode.replaceChild(frag, n);
    count++;
  }
  return count;
}
let sTo;
searchInput.addEventListener('input', () => {
  clearTimeout(sTo);
  sTo = setTimeout(() => {
    clearHL();
    const q = searchInput.value.trim();
    if (!q) { searchCount.textContent = ''; pageSecs.forEach(s => s.classList.remove('search-hidden')); return; }
    let tot = 0;
    pageSecs.forEach(s => { const h = hlText(s, q); h > 0 ? s.classList.remove('search-hidden') : s.classList.add('search-hidden'); tot += h; });
    searchCount.textContent = tot ? tot + ' match' + (tot !== 1 ? 'es' : '') : 'No matches';
  }, 250);
});
</script>
</body>
</html>`

  fs.mkdirSync(outdir, { recursive: true })
  const filePath = path.join(outdir, 'report.html')
  fs.writeFileSync(filePath, html, 'utf-8')
  return filePath
}

function buildTriageSummary (triage) {
  const { structural, substantive, cosmetic, global_patterns } = triage
  let html = '<div class="card"><h2>Change Triage</h2><div class="triage-summary">'
  html += `<div class="triage-card structural"><div class="count">${structural.length}</div><h4>🔧 Structural</h4>
    <ul>${structural.map(s => `<li>${esc(s.reason)}</li>`).join('')}</ul></div>`
  html += `<div class="triage-card substantive"><div class="count">${substantive.length}</div><h4>⚠️ Substantive</h4>
    <ul>${substantive.slice(0, 10).map(s => `<li>Page ${s.page}: ${esc(s.reason)}</li>`).join('')}${substantive.length > 10 ? `<li>...and ${substantive.length - 10} more</li>` : ''}</ul></div>`
  html += `<div class="triage-card cosmetic"><div class="count">${cosmetic.length}</div><h4>✏️ Cosmetic</h4>
    <p style="font-size:0.85rem">Pages: ${cosmetic.join(', ') || 'none'}</p></div>`
  html += '</div>'
  if (global_patterns && global_patterns.length > 0) {
    html += '<div class="global-patterns"><h4>Repeating patterns across pages</h4>'
    for (const gp of global_patterns) {
      html += `<div class="pattern"><strong>${gp.count} pages:</strong> ${esc(gp.pattern.join(' / '))}</div>`
    }
    html += '</div>'
  }
  html += '</div>'
  return html
}

function esc (str) {
  if (!str) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
