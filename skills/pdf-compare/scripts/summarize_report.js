#!/usr/bin/env node
// Quick analysis helper — extracts compact summary from report.json
import { readFileSync } from 'fs'

const file = process.argv[2] || 'inbox/output/report.json'
const r = JSON.parse(readFileSync(file, 'utf8'))

const out = {
  summary: r.summary,
  metadata_diff: r.metadata_diff,
  pages: r.pages.map(p => ({
    page: p.page,
    match_type: p.match_type,
    left_page: p.left_page,
    right_page: p.right_page,
    text_changed: p.text_changed,
    stats: p.text_diff_stats,
    visual_changed: p.visual_changed,
    visual_score: p.visual_score,
    visual_changes: p.visual_changes || [],
    text_area_visual_changes: p.text_area_visual_changes || [],
    key_diffs: (p.text_diff_lines || [])
      .filter(l => (l.startsWith('+') || l.startsWith('-')) && !l.startsWith('--- ') && !l.startsWith('+++ '))
      .slice(0, 10)
  }))
}

console.log(JSON.stringify(out, null, 2))
