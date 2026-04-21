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
 * High-level: given page texts, compute the best alignment.
 * @param {string[]} leftTexts
 * @param {string[]} rightTexts
 * @param {object} options
 * @returns {PageAlignment[]}
 */
export function matchPages (leftTexts, rightTexts, options = {}) {
  const simMatrix = buildSimilarityMatrix(leftTexts, rightTexts)
  return alignPages(simMatrix, options)
}
