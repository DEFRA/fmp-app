/**
 * Analyze visual differences between two page images and produce
 * human-readable descriptions of what changed.
 *
 * Separates text-area changes (already covered by text diff) from
 * true visual changes (color, image, layout, background).
 */

// ── Color naming ────────────────────────────────────────────────────

function rgbToHsl (r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b); const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return { h: h * 360, s, l }
}

/**
 * Map an RGB triple to a descriptive color name using HSL.
 */
function colorName (r, g, b) {
  const { h, s, l } = rgbToHsl(r, g, b)

  // Achromatic
  if (s < 0.08) {
    if (l < 0.12) return 'black'
    if (l < 0.35) return 'dark gray'
    if (l < 0.65) return 'gray'
    if (l < 0.88) return 'light gray'
    return 'white'
  }

  // Low lightness
  if (l < 0.12) return 'black'
  if (l > 0.92) return 'white'

  // Determine shade prefix
  let shade = ''
  if (l < 0.3) shade = 'dark '
  else if (l > 0.7) shade = 'light '

  // Hue-based naming (0-360)
  if (h < 15 || h >= 345) return `${shade}red`
  if (h < 30) return `${shade}red-orange`
  if (h < 45) return `${shade}orange`
  if (h < 65) return `${shade}yellow`
  if (h < 80) return `${shade}yellow-green`
  if (h < 150) return `${shade}green`
  if (h < 175) return `${shade}teal`
  if (h < 200) return `${shade}cyan`
  if (h < 250) return `${shade}blue`
  if (h < 280) return `${shade}purple`
  if (h < 320) return `${shade}magenta`
  return `${shade}pink`
}

/**
 * Produce a hex color string from RGB.
 */
function hexColor (r, g, b) {
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
}

// ── Page zone labelling ─────────────────────────────────────────────

function zoneLabel (nx, ny) {
  const row = ny < 0.12 ? 'top' : ny > 0.88 ? 'bottom' : 'middle'
  const col = nx < 0.3 ? 'left' : nx > 0.7 ? 'right' : 'center'
  if (row === 'top' && col === 'center') return 'header area'
  if (row === 'bottom' && col === 'center') return 'footer area'
  if (row === 'middle' && col === 'center') return 'center of page'
  return `${row}-${col}`
}

// ── Region detection ────────────────────────────────────────────────

function findChangedRegions (diffMask, w, h, gridSize = 24) {
  const cols = Math.ceil(w / gridSize)
  const rows = Math.ceil(h / gridSize)
  const grid = new Uint8Array(cols * rows)

  for (let y = 0; y < h; y++) {
    const gy = Math.min(Math.floor(y / gridSize), rows - 1)
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4
      if (diffMask[idx] > 100 && diffMask[idx + 1] < 150) {
        const gx = Math.min(Math.floor(x / gridSize), cols - 1)
        grid[gy * cols + gx] = 1
      }
    }
  }

  const visited = new Uint8Array(cols * rows)
  const regions = []

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const gi = gy * cols + gx
      if (!grid[gi] || visited[gi]) continue

      const queue = [{ gx, gy }]
      visited[gi] = 1
      let minGx = gx; let maxGx = gx; let minGy = gy; let maxGy = gy

      while (queue.length > 0) {
        const { gx: cx, gy: cy } = queue.shift()
        if (cx < minGx) minGx = cx
        if (cx > maxGx) maxGx = cx
        if (cy < minGy) minGy = cy
        if (cy > maxGy) maxGy = cy

        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
          const nx = cx + dx; const ny = cy + dy
          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
            const ni = ny * cols + nx
            if (grid[ni] && !visited[ni]) {
              visited[ni] = 1
              queue.push({ gx: nx, gy: ny })
            }
          }
        }
      }

      regions.push({
        x: minGx * gridSize,
        y: minGy * gridSize,
        x2: Math.min((maxGx + 1) * gridSize, w),
        y2: Math.min((maxGy + 1) * gridSize, h),
      })
    }
  }

  return regions
}

// ── Color sampling ──────────────────────────────────────────────────

/**
 * Sample the dominant non-white color and average color in a region.
 */
function sampleRegionColors (rgba, w, regionBox) {
  const { x, y, x2, y2 } = regionBox
  let totalR = 0; let totalG = 0; let totalB = 0; let count = 0
  // Track non-white pixel colors separately
  let cwR = 0; let cwG = 0; let cwB = 0; let cwCount = 0

  const step = 3
  for (let py = y; py < y2; py += step) {
    for (let px = x; px < x2; px += step) {
      const idx = (py * w + px) * 4
      const r = rgba[idx]; const g = rgba[idx + 1]; const b = rgba[idx + 2]
      totalR += r; totalG += g; totalB += b; count++
      if (r < 240 || g < 240 || b < 240) {
        cwR += r; cwG += g; cwB += b; cwCount++
      }
    }
  }

  const avg = count > 0
    ? { r: Math.round(totalR / count), g: Math.round(totalG / count), b: Math.round(totalB / count) }
    : { r: 255, g: 255, b: 255 }

  const dominant = cwCount > 0
    ? { r: Math.round(cwR / cwCount), g: Math.round(cwG / cwCount), b: Math.round(cwB / cwCount) }
    : avg

  return { avg, dominant, nonWhiteRatio: count > 0 ? cwCount / count : 0 }
}

function isBlank (c) {
  return c.r > 240 && c.g > 240 && c.b > 240
}

// ── Text-region overlap ─────────────────────────────────────────────

/**
 * Check what fraction of a changed region overlaps with text bounding boxes.
 * Text bounds are in PDF points; region coords are in pixels.
 * @param {object} region - { x, y, x2, y2 } in pixels
 * @param {Array<{x,y,w,h}>} textBounds - Text blocks in PDF points
 * @param {number} scale - PDF points to pixels scale (dpi/72)
 * @returns {number} Overlap fraction 0-1
 */
function textOverlapFraction (region, textBounds, scale) {
  if (!textBounds || textBounds.length === 0) return 0

  const regionArea = (region.x2 - region.x) * (region.y2 - region.y)
  if (regionArea === 0) return 0

  let overlapArea = 0
  for (const tb of textBounds) {
    // Convert text bounds from PDF points to pixels
    const tx = tb.x * scale
    const ty = tb.y * scale
    const tx2 = (tb.x + tb.w) * scale
    const ty2 = (tb.y + tb.h) * scale

    // Intersection
    const ix = Math.max(region.x, tx)
    const iy = Math.max(region.y, ty)
    const ix2 = Math.min(region.x2, tx2)
    const iy2 = Math.min(region.y2, ty2)

    if (ix < ix2 && iy < iy2) {
      overlapArea += (ix2 - ix) * (iy2 - iy)
    }
  }

  return Math.min(overlapArea / regionArea, 1)
}

// ── Main analysis ───────────────────────────────────────────────────

/**
 * Analyze visual differences and return human-readable descriptions.
 * Separates text-area changes from true visual (color/layout/image) changes.
 *
 * @param {Uint8Array} leftRgba - Left page RGBA pixels
 * @param {Uint8Array} rightRgba - Right page RGBA pixels
 * @param {Uint8Array} diffMask - Diff mask RGBA from pixelmatch
 * @param {number} w - Image width
 * @param {number} h - Image height
 * @param {object} [options]
 * @param {Array<{x,y,w,h}>} [options.leftTextBounds] - Text block boxes for left page (PDF points)
 * @param {Array<{x,y,w,h}>} [options.rightTextBounds] - Text block boxes for right page (PDF points)
 * @param {number} [options.dpi=150] - Render DPI (for coordinate conversion)
 * @returns {{ visualChanges: string[], textAreaChanges: string[] }}
 */
export function analyzeVisualChanges (leftRgba, rightRgba, diffMask, w, h, options = {}) {
  const { leftTextBounds = null, rightTextBounds = null, dpi = 150 } = options
  const scale = dpi / 72
  const hasTextBounds = leftTextBounds || rightTextBounds
  // Merge both sides' text bounds for overlap detection
  const allTextBounds = [...(leftTextBounds || []), ...(rightTextBounds || [])]

  const regions = findChangedRegions(diffMask, w, h)

  if (regions.length === 0) return { visualChanges: [], textAreaChanges: [] }

  // Sort by area (largest first)
  regions.sort((a, b) => {
    const areaA = (a.x2 - a.x) * (a.y2 - a.y)
    const areaB = (b.x2 - b.x) * (b.y2 - b.y)
    return areaB - areaA
  })

  const visualChanges = []
  const textAreaChanges = []
  let textRegionCount = 0
  let visualRegionCount = 0

  for (const region of regions) {
    const cx = ((region.x + region.x2) / 2) / w
    const cy = ((region.y + region.y2) / 2) / h
    const zone = zoneLabel(cx, cy)
    const regionW = region.x2 - region.x
    const regionH = region.y2 - region.y
    const areaPercent = ((regionW * regionH) / (w * h) * 100)

    // Check text overlap
    const textOverlap = hasTextBounds ? textOverlapFraction(region, allTextBounds, scale) : 0
    const isTextRegion = textOverlap > 0.6

    const leftColors = sampleRegionColors(leftRgba, w, region)
    const rightColors = sampleRegionColors(rightRgba, w, region)

    const leftDom = leftColors.dominant
    const rightDom = rightColors.dominant
    const leftName = colorName(leftDom.r, leftDom.g, leftDom.b)
    const rightName = colorName(rightDom.r, rightDom.g, rightDom.b)
    const leftHex = hexColor(leftDom.r, leftDom.g, leftDom.b)
    const rightHex = hexColor(rightDom.r, rightDom.g, rightDom.b)
    const leftBlank = isBlank(leftColors.avg)
    const rightBlank = isBlank(rightColors.avg)

    let desc
    if (leftBlank && !rightBlank) {
      desc = `Content added in ${zone}: ${rightName} (${rightHex}), ~${areaPercent.toFixed(1)}% of page`
    } else if (!leftBlank && rightBlank) {
      desc = `Content removed from ${zone}: was ${leftName} (${leftHex}), ~${areaPercent.toFixed(1)}% of page`
    } else if (leftName !== rightName) {
      desc = `Color change in ${zone}: ${leftName} (${leftHex}) → ${rightName} (${rightHex}), ~${areaPercent.toFixed(1)}% of page`
    } else {
      // Same color name — check if hex values differ noticeably
      const colorDist = Math.abs(leftDom.r - rightDom.r) + Math.abs(leftDom.g - rightDom.g) + Math.abs(leftDom.b - rightDom.b)
      if (colorDist > 30) {
        desc = `Subtle color shift in ${zone}: ${leftHex} → ${rightHex}, ~${areaPercent.toFixed(1)}% of page`
      } else if (areaPercent > 30) {
        desc = `Major layout change in ${zone}, ~${areaPercent.toFixed(1)}% of page`
      } else {
        desc = `Content modified in ${zone}, ~${areaPercent.toFixed(1)}% of page`
      }
    }

    if (isTextRegion) {
      textRegionCount++
      textAreaChanges.push(desc)
    } else {
      visualRegionCount++
      visualChanges.push(desc)
    }
  }

  // Add summaries at the start
  if (visualChanges.length > 0) {
    visualChanges.unshift(`${visualRegionCount} visual change${visualRegionCount !== 1 ? 's' : ''} (non-text)`)
  }
  if (textAreaChanges.length > 0) {
    textAreaChanges.unshift(`${textRegionCount} text-area change${textRegionCount !== 1 ? 's' : ''} (see text diff for details)`)
  }

  return { visualChanges, textAreaChanges }
}
