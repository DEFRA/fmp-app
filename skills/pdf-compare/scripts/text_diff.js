/**
 * Minimal unified diff implementation for text comparison.
 * Produces output similar to Python's difflib.unified_diff.
 */

/**
 * Compute a simple unified diff between two arrays of lines.
 * Returns an array of diff lines (with +/- prefixes).
 * @param {string[]} leftLines
 * @param {string[]} rightLines
 * @returns {string[]}
 */
export function difflib_unifiedDiff (leftLines, rightLines) {
  // Use a simple LCS-based diff
  const lcs = computeLCS(leftLines, rightLines)
  const result = []

  result.push('--- left')
  result.push('+++ right')

  let li = 0
  let ri = 0

  for (const [lIdx, rIdx] of lcs) {
    // Lines deleted from left (before this LCS match)
    while (li < lIdx) {
      result.push(`-${leftLines[li]}`)
      li++
    }
    // Lines added in right (before this LCS match)
    while (ri < rIdx) {
      result.push(`+${rightLines[ri]}`)
      ri++
    }
    // Common line
    result.push(` ${leftLines[li]}`)
    li++
    ri++
  }

  // Remaining lines
  while (li < leftLines.length) {
    result.push(`-${leftLines[li]}`)
    li++
  }
  while (ri < rightLines.length) {
    result.push(`+${rightLines[ri]}`)
    ri++
  }

  return result
}

/**
 * Compute Longest Common Subsequence indices.
 * Returns array of [leftIndex, rightIndex] pairs.
 */
function computeLCS (a, b) {
  const m = a.length
  const n = b.length

  // For very large documents, use a windowed approach
  if (m > 10000 || n > 10000) {
    return computeLCSGreedy(a, b)
  }

  // Standard DP approach
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack
  const result = []
  let i = m
  let j = n
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.unshift([i - 1, j - 1])
      i--
      j--
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }

  return result
}

/**
 * Greedy LCS for very large documents — trades accuracy for speed.
 */
function computeLCSGreedy (a, b) {
  const bIndex = new Map()
  for (let j = 0; j < b.length; j++) {
    if (!bIndex.has(b[j])) bIndex.set(b[j], [])
    bIndex.get(b[j]).push(j)
  }

  const result = []
  let lastJ = -1
  for (let i = 0; i < a.length; i++) {
    const positions = bIndex.get(a[i])
    if (!positions) continue
    // Find the first position in b that's after lastJ
    for (const j of positions) {
      if (j > lastJ) {
        result.push([i, j])
        lastJ = j
        break
      }
    }
  }
  return result
}
