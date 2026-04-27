/**
 * Smart page matching for PDFs with differing page counts.
 *
 * Uses text similarity + sequence alignment to find the best mapping
 * between left and right pages, handling inserted/deleted pages anywhere
 * in the document.
 */

/**
 * Compute word-level Jaccard similarity between two texts.
 * Returns 0.0 (completely different) to 1.0 (identical).
 */
export function textSimilarity (a, b) {
  if (!a && !b) return 1.0 // both empty = match
  if (!a || !b) return 0.0 // one empty = no match

  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(Boolean))
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(Boolean))

  if (wordsA.size === 0 && wordsB.size === 0) return 1.0
  if (wordsA.size === 0 || wordsB.size === 0) return 0.0

  let intersection = 0
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++
  }

  const union = wordsA.size + wordsB.size - intersection
  return union > 0 ? intersection / union : 0
}

/**
 * Build a similarity matrix between all left and right pages.
 * @param {string[]} leftTexts - Text content per page from left PDF.
 * @param {string[]} rightTexts - Text content per page from right PDF.
 * @returns {number[][]} Matrix[i][j] = similarity between left page i and right page j.
 */
export function buildSimilarityMatrix (leftTexts, rightTexts) {
  const matrix = []
  for (let i = 0; i < leftTexts.length; i++) {
    matrix[i] = []
    for (let j = 0; j < rightTexts.length; j++) {
      matrix[i][j] = textSimilarity(leftTexts[i], rightTexts[j])
    }
  }
  return matrix
}

/**
 * @typedef {object} PageAlignment
 * @property {'matched'|'deleted'|'inserted'} type
 * @property {number|null} leftIndex - 0-based index in left PDF (null if inserted)
 * @property {number|null} rightIndex - 0-based index in right PDF (null if deleted)
 * @property {number} similarity - Text similarity score for matched pages
 */

/**
 * Find optimal page alignment using Needleman-Wunsch global sequence alignment.
 *
 * This treats the left and right page sequences like DNA sequences and finds the
 * best global alignment, allowing for gaps (insertions/deletions) anywhere in
 * the document — not just at the end.
 *
 * @param {number[][]} simMatrix - Similarity matrix from buildSimilarityMatrix.
 * @param {object} options
 * @param {number} [options.matchThreshold=0.3] - Minimum similarity to consider pages as potential matches.
 * @param {number} [options.gapPenalty=-0.5] - Penalty for gaps (inserted/deleted pages).
 * @returns {PageAlignment[]} Ordered alignment of pages.
 */
export function alignPages (simMatrix, { matchThreshold = 0.3, gapPenalty = -0.5 } = {}) {
  const m = simMatrix.length      // left pages
  const n = simMatrix[0]?.length ?? 0 // right pages

  if (m === 0 && n === 0) return []
  if (m === 0) {
    return Array.from({ length: n }, (_, j) => ({
      type: 'inserted', leftIndex: null, rightIndex: j, similarity: 0,
    }))
  }
  if (n === 0) {
    return Array.from({ length: m }, (_, i) => ({
      type: 'deleted', leftIndex: i, rightIndex: null, similarity: 0,
    }))
  }

  // Needleman-Wunsch DP
  // Score matrix: dp[i][j] = best score aligning left[0..i-1] with right[0..j-1]
  const dp = Array.from({ length: m + 1 }, () => new Float64Array(n + 1))

  // Initialize gaps
  for (let i = 1; i <= m; i++) dp[i][0] = i * gapPenalty
  for (let j = 1; j <= n; j++) dp[0][j] = j * gapPenalty

  // Fill
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const matchScore = simMatrix[i - 1][j - 1] // similarity as score
      const diag = dp[i - 1][j - 1] + matchScore // match/mismatch
      const up = dp[i - 1][j] + gapPenalty        // delete (left page has no match)
      const left = dp[i][j - 1] + gapPenalty      // insert (right page has no match)
      dp[i][j] = Math.max(diag, up, left)
    }
  }

  // Traceback
  const alignment = []
  let i = m; let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const matchScore = simMatrix[i - 1][j - 1]
      const diag = dp[i - 1][j - 1] + matchScore
      if (Math.abs(dp[i][j] - diag) < 1e-9) {
        alignment.unshift({
          type: 'matched',
          leftIndex: i - 1,
          rightIndex: j - 1,
          similarity: matchScore,
        })
        i--; j--
        continue
      }
    }
    if (i > 0) {
      const up = dp[i - 1][j] + gapPenalty
      if (Math.abs(dp[i][j] - up) < 1e-9) {
        alignment.unshift({
          type: 'deleted',
          leftIndex: i - 1,
          rightIndex: null,
          similarity: 0,
        })
        i--
        continue
      }
    }
    if (j > 0) {
      alignment.unshift({
        type: 'inserted',
        leftIndex: null,
        rightIndex: j - 1,
        similarity: 0,
      })
      j--
    }
  }

  // Post-process: reclassify very low similarity matches as mismatches
  for (const entry of alignment) {
    if (entry.type === 'matched' && entry.similarity < matchThreshold) {
      entry.type = 'replaced' // pages exist at same position but are entirely different
    }
  }

  return alignment
}

/**
 * Find mutual best-match anchor pairs from the similarity matrix.
 *
 * An anchor is a pair (i, j) where left page i's best match is right page j
 * AND right page j's best match is left page i, with similarity >= threshold.
 * These are high-confidence matches that should be locked in before running
 * the sequential alignment.
 *
 * @param {number[][]} simMatrix
 * @param {number} threshold - Minimum similarity for an anchor (default 0.75)
 * @returns {{ leftIndex: number, rightIndex: number, similarity: number }[]}
 */
export function findAnchors (simMatrix, threshold = 0.75) {
  const m = simMatrix.length
  const n = simMatrix[0]?.length ?? 0
  if (m === 0 || n === 0) return []

  // Best right match for each left page
  const bestRight = Array.from({ length: m }, (_, i) => {
    let best = { j: -1, sim: -1 }
    for (let j = 0; j < n; j++) {
      if (simMatrix[i][j] > best.sim) best = { j, sim: simMatrix[i][j] }
    }
    return best
  })

  // Best left match for each right page
  const bestLeft = Array.from({ length: n }, (_, j) => {
    let best = { i: -1, sim: -1 }
    for (let i = 0; i < m; i++) {
      if (simMatrix[i][j] > best.sim) best = { i, sim: simMatrix[i][j] }
    }
    return best
  })

  // Collect mutual best matches above threshold
  const candidates = []
  for (let i = 0; i < m; i++) {
    const j = bestRight[i].j
    if (j >= 0 && bestLeft[j].i === i && bestRight[i].sim >= threshold) {
      candidates.push({ leftIndex: i, rightIndex: j, similarity: bestRight[i].sim })
    }
  }

  // Filter to monotonically increasing sequence (both indices must increase)
  // to respect document order
  const anchors = []
  for (const c of candidates) {
    if (anchors.length === 0 ||
        (c.leftIndex > anchors[anchors.length - 1].leftIndex &&
         c.rightIndex > anchors[anchors.length - 1].rightIndex)) {
      anchors.push(c)
    }
  }

  return anchors
}

/**
 * Align pages using high-confidence anchors + NW for gaps between.
 *
 * 1. Find mutual best-match anchors (locked in, not subject to gap penalty trade-offs)
 * 2. Run NW on each segment between consecutive anchors
 * 3. Concatenate: segment alignment + anchor + segment alignment + anchor + ...
 *
 * @param {number[][]} simMatrix
 * @param {{ leftIndex: number, rightIndex: number, similarity: number }[]} anchors
 * @param {object} options - Passed through to alignPages for each segment
 * @returns {PageAlignment[]}
 */
export function alignWithAnchors (simMatrix, anchors, options = {}) {
  const m = simMatrix.length
  const n = simMatrix[0]?.length ?? 0
  const result = []

  let prevLeft = -1
  let prevRight = -1

  // Process each anchor (plus a virtual "end" anchor)
  const endpoints = [...anchors, { leftIndex: m, rightIndex: n, similarity: 0, _end: true }]

  for (const anchor of endpoints) {
    const segLeftStart = prevLeft + 1
    const segRightStart = prevRight + 1
    const segLeftEnd = anchor.leftIndex
    const segRightEnd = anchor.rightIndex
    const segLeftLen = segLeftEnd - segLeftStart
    const segRightLen = segRightEnd - segRightStart

    if (segLeftLen > 0 || segRightLen > 0) {
      let segAlignment

      if (segLeftLen === 0) {
        // Only right pages in this segment — all insertions
        segAlignment = Array.from({ length: segRightLen }, (_, j) => ({
          type: 'inserted', leftIndex: null, rightIndex: j, similarity: 0,
        }))
      } else if (segRightLen === 0) {
        // Only left pages in this segment — all deletions
        segAlignment = Array.from({ length: segLeftLen }, (_, i) => ({
          type: 'deleted', leftIndex: i, rightIndex: null, similarity: 0,
        }))
      } else {
        // Build sub-matrix for this segment
        const subMatrix = []
        for (let i = 0; i < segLeftLen; i++) {
          subMatrix[i] = new Float64Array(segRightLen)
          for (let j = 0; j < segRightLen; j++) {
            subMatrix[i][j] = simMatrix[segLeftStart + i][segRightStart + j]
          }
        }
        segAlignment = alignPages(subMatrix, options)
      }

      // Remap indices back to original matrix coordinates
      for (const entry of segAlignment) {
        if (entry.leftIndex != null) entry.leftIndex += segLeftStart
        if (entry.rightIndex != null) entry.rightIndex += segRightStart
        if (entry.leftIndex != null && entry.rightIndex != null) {
          entry.similarity = simMatrix[entry.leftIndex][entry.rightIndex]
        }
        result.push(entry)
      }
    }

    // Add the anchor itself (unless it's the virtual end marker)
    if (!anchor._end) {
      result.push({
        type: 'matched',
        leftIndex: anchor.leftIndex,
        rightIndex: anchor.rightIndex,
        similarity: anchor.similarity,
      })
      prevLeft = anchor.leftIndex
      prevRight = anchor.rightIndex
    }
  }

  // Post-process: reclassify very low similarity matches
  const matchThreshold = options.matchThreshold || 0.3
  for (const entry of result) {
    if (entry.type === 'matched' && entry.similarity < matchThreshold) {
      entry.type = 'replaced'
    }
  }

  return result
}

/**
 * Extract a discriminative tag from a page's text content.
 *
 * Map pages in EA flood reports have titles like "Defended modelled fluvial
 * extent" or "modelled tidal extent". Pages with different tags (e.g.
 * "fluvial" vs "tidal") should never be matched together — the tag acts as
 * a hard discriminator even when boilerplate text inflates Jaccard similarity.
 *
 * Returns a normalised lowercase string (e.g. "defended modelled fluvial extent")
 * or null if no recognisable title is found.
 *
 * @param {string} text - Raw page text
 * @returns {string|null}
 */
export function extractPageTag (text) {
  if (!text) return null

  // Collapse whitespace (including newlines) for easier matching
  const norm = text.replace(/\s+/g, ' ')

  // Try most specific pattern first, then broader ones
  const m =
    norm.match(/(?:Defended|Undefended)\s+modelled\s+(?:fluvial|tidal|pluvial|coastal|surface water)\s+extent/i) ||
    norm.match(/modelled\s+(?:fluvial|tidal|pluvial|coastal|surface water)\s+extent/i) ||
    norm.match(/(?:fluvial|tidal|pluvial|coastal|surface water)\s+extent/i) ||
    norm.match(/flood\s+zone\s+\d[a-z]?/i) ||
    norm.match(/flood\s+zone/i) ||
    norm.match(/flood\s+map\s+for\s+planning/i) ||
    norm.match(/risk\s+of\s+flooding\s+from\s+\w+/i) ||
    norm.match(/risk\s+of\s+flooding/i) ||
    norm.match(/surface\s+water\s+extent/i)

  return m ? m[0].toLowerCase().replace(/\s+/g, ' ').trim() : null
}

/**
 * Apply tag-based penalty to a similarity matrix.
 *
 * When both pages have a tag and the tags differ, the similarity is multiplied
 * by `penalty` (default 0.4) to make cross-type matches very unattractive
 * to the alignment algorithm.
 *
 * @param {number[][]} simMatrix - Original similarity matrix (modified in place).
 * @param {(string|null)[]} leftTags - Tag per left page.
 * @param {(string|null)[]} rightTags - Tag per right page.
 * @param {number} penalty - Multiplier for mismatched tags (default 0.4).
 */
export function applyTagPenalty (simMatrix, leftTags, rightTags, penalty = 0.4) {
  for (let i = 0; i < simMatrix.length; i++) {
    for (let j = 0; j < (simMatrix[0]?.length ?? 0); j++) {
      if (leftTags[i] && rightTags[j] && leftTags[i] !== rightTags[j]) {
        simMatrix[i][j] *= penalty
      }
    }
  }
}

/**
 * High-level: given page texts, compute the best alignment.
 *
 * Uses title-tag discrimination + anchor-first alignment + reorder detection:
 * 1. Extract page tags (e.g. "fluvial extent" vs "tidal extent") from each page
 * 2. Build Jaccard similarity matrix, then penalise tag mismatches
 * 3. Identify high-confidence mutual best-match anchors
 * 4. Run Needleman-Wunsch on segments between anchors
 * 5. Cross-match any leftover inserted/deleted pages to detect reorderings
 *
 * @param {string[]} leftTexts
 * @param {string[]} rightTexts
 * @param {object} options
 * @param {number} [options.anchorThreshold=0.75] - Minimum similarity for anchor pairs
 * @param {number} [options.tagPenalty=0.4] - Similarity multiplier for tag mismatches
 * @param {number} [options.reorderThreshold=0.75] - Min similarity to reclassify as reordered
 * @returns {PageAlignment[]}
 */
export function matchPages (leftTexts, rightTexts, options = {}) {
  const simMatrix = buildSimilarityMatrix(leftTexts, rightTexts)

  // Apply tag-based penalty so e.g. fluvial pages never match tidal pages
  const leftTags = leftTexts.map(extractPageTag)
  const rightTags = rightTexts.map(extractPageTag)
  const tagPenalty = options.tagPenalty ?? 0.4
  applyTagPenalty(simMatrix, leftTags, rightTags, tagPenalty)

  const anchorThreshold = options.anchorThreshold ?? 0.75
  const anchors = findAnchors(simMatrix, anchorThreshold)

  let alignment
  if (anchors.length === 0) {
    alignment = alignPages(simMatrix, options)
  } else {
    alignment = alignWithAnchors(simMatrix, anchors, options)
  }

  // Post-alignment: detect reordered pages among unmatched inserted/deleted
  const reorderThreshold = options.reorderThreshold ?? 0.75
  return detectReorderedPages(alignment, simMatrix, reorderThreshold)
}

/**
 * Detect reordered pages by cross-matching inserted, deleted, and
 * low-confidence matched entries.
 *
 * When documents reorder sections (e.g. data tables moved earlier), the
 * monotonic alignment marks them as separate insertions and deletions.
 * This function:
 * 1. Breaks apart low-confidence matches (sim < breakThreshold) into
 *    separate deleted + inserted entries
 * 2. Finds high-similarity pairs among all unmatched pages
 * 3. Reclassifies those pairs as 'reordered'
 *
 * @param {PageAlignment[]} alignment - The initial alignment
 * @param {number[][]} simMatrix - Full similarity matrix
 * @param {number} threshold - Minimum similarity to consider a reorder match
 * @returns {PageAlignment[]} Updated alignment with reordered entries
 */
export function detectReorderedPages (alignment, simMatrix, threshold = 0.75) {
  // Phase 1: Identify low-confidence matches that might be better served
  // by reorder matching. Only break them if a better match exists in the
  // current deleted/inserted pools.
  const breakThreshold = 0.5

  // First, collect existing deleted/inserted entries
  const existingDeleted = new Set()
  const existingInserted = new Set()
  for (const e of alignment) {
    if (e.type === 'deleted') existingDeleted.add(e.leftIndex)
    else if (e.type === 'inserted') existingInserted.add(e.rightIndex)
  }

  // Check if breaking a low-sim match would enable a better reorder match
  const toBreak = new Set()
  for (let idx = 0; idx < alignment.length; idx++) {
    const e = alignment[idx]
    if (e.type !== 'matched' || e.similarity >= breakThreshold ||
        e.leftIndex == null || e.rightIndex == null) continue

    // Would either side get a better match from the unmatched pool?
    let leftHasBetter = false
    let rightHasBetter = false

    for (const ri of existingInserted) {
      if (simMatrix[e.leftIndex][ri] >= threshold) { leftHasBetter = true; break }
    }
    for (const li of existingDeleted) {
      if (simMatrix[li][e.rightIndex] >= threshold) { rightHasBetter = true; break }
    }

    if (leftHasBetter || rightHasBetter) {
      toBreak.add(idx)
    }
  }

  const expanded = []
  for (let idx = 0; idx < alignment.length; idx++) {
    const e = alignment[idx]
    if (toBreak.has(idx)) {
      expanded.push({
        type: 'deleted', leftIndex: e.leftIndex, rightIndex: null, similarity: 0,
      })
      expanded.push({
        type: 'inserted', leftIndex: null, rightIndex: e.rightIndex, similarity: 0,
      })
    } else {
      expanded.push(e)
    }
  }

  // Phase 2: Collect all unmatched pages
  const deleted = []
  const inserted = []

  for (let idx = 0; idx < expanded.length; idx++) {
    const e = expanded[idx]
    if (e.type === 'deleted') deleted.push({ idx, leftIndex: e.leftIndex })
    else if (e.type === 'inserted') inserted.push({ idx, rightIndex: e.rightIndex })
  }

  if (deleted.length === 0 || inserted.length === 0) return expanded

  // Phase 3: Build cross-match candidates
  const candidates = []
  for (const d of deleted) {
    let best = { ins: null, sim: 0 }
    for (const ins of inserted) {
      const sim = simMatrix[d.leftIndex][ins.rightIndex]
      if (sim > best.sim) best = { ins, sim }
    }
    if (best.ins && best.sim >= threshold) {
      candidates.push({
        deletedIdx: d.idx,
        insertedIdx: best.ins.idx,
        leftIndex: d.leftIndex,
        rightIndex: best.ins.rightIndex,
        similarity: best.sim,
      })
    }
  }

  // Resolve conflicts: each page can only match once
  // Sort by similarity descending, then greedily assign
  candidates.sort((a, b) => b.similarity - a.similarity)
  const usedDeleted = new Set()
  const usedInserted = new Set()
  const matches = []

  for (const c of candidates) {
    if (!usedDeleted.has(c.deletedIdx) && !usedInserted.has(c.insertedIdx)) {
      matches.push(c)
      usedDeleted.add(c.deletedIdx)
      usedInserted.add(c.insertedIdx)
    }
  }

  if (matches.length === 0) return expanded

  // Phase 4: Apply reorder reclassification
  const result = [...expanded]
  const removeIndices = new Set()

  for (const m of matches) {
    result[m.deletedIdx] = {
      type: 'reordered',
      leftIndex: m.leftIndex,
      rightIndex: m.rightIndex,
      similarity: m.similarity,
    }
    removeIndices.add(m.insertedIdx)
  }

  // Remove the consumed inserted entries
  return result.filter((_, idx) => !removeIndices.has(idx))
}
