/**
 * Compare rendered page images and produce difference scores and highlight images.
 * Uses pixelmatch for pixel-level comparison and pngjs for PNG encoding.
 */

import fs from 'node:fs'
import path from 'node:path'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

/**
 * Convert RGB pixel data (3 bytes/pixel) to RGBA (4 bytes/pixel) with alpha=255.
 */
function rgbToRgba (rgb, width, height) {
  const rgba = new Uint8Array(width * height * 4)
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = rgb[i * 3]
    rgba[i * 4 + 1] = rgb[i * 3 + 1]
    rgba[i * 4 + 2] = rgb[i * 3 + 2]
    rgba[i * 4 + 3] = 255
  }
  return rgba
}

/**
 * Pad an RGBA image to a target size with white fill.
 */
function padToSize (rgba, srcWidth, srcHeight, targetWidth, targetHeight) {
  if (srcWidth === targetWidth && srcHeight === targetHeight) return rgba

  const out = new Uint8Array(targetWidth * targetHeight * 4)
  // Fill with white (255, 255, 255, 255)
  out.fill(255)

  for (let y = 0; y < srcHeight; y++) {
    const srcOffset = y * srcWidth * 4
    const dstOffset = y * targetWidth * 4
    out.set(rgba.subarray(srcOffset, srcOffset + srcWidth * 4), dstOffset)
  }
  return out
}

/**
 * Compare two rendered page images.
 * @param {import('./render_pages.js').RenderedPage} left
 * @param {import('./render_pages.js').RenderedPage} right
 * @param {object} options
 * @param {number} [options.threshold=0.01] - Overall score threshold to consider changed.
 * @returns {{ score: number, changed: boolean, diffPng: Buffer|null, width: number, height: number }}
 */
export function compareImages (left, right, { threshold = 0.01 } = {}) {
  const w = Math.max(left.width, right.width)
  const h = Math.max(left.height, right.height)

  // Convert RGB to RGBA and pad to matching dimensions
  let leftRgba = rgbToRgba(left.pixels, left.width, left.height)
  let rightRgba = rgbToRgba(right.pixels, right.width, right.height)
  leftRgba = padToSize(leftRgba, left.width, left.height, w, h)
  rightRgba = padToSize(rightRgba, right.width, right.height, w, h)

  const diffBuffer = new Uint8Array(w * h * 4)

  // pixelmatch threshold is per-pixel color distance sensitivity (0–1);
  // we use 0.1 as a reasonable per-pixel tolerance
  const numDiffPixels = pixelmatch(leftRgba, rightRgba, diffBuffer, w, h, {
    threshold: 0.1,
    includeAA: false,
  })

  const totalPixels = w * h
  const score = totalPixels > 0 ? numDiffPixels / totalPixels : 0
  const changed = score > threshold

  let diffPng = null
  if (changed) {
    const png = new PNG({ width: w, height: h })
    png.data = Buffer.from(diffBuffer)
    diffPng = PNG.sync.write(png)
  }

  return { score: Math.round(score * 1e6) / 1e6, changed, diffPng, width: w, height: h, leftRgba: changed ? leftRgba : null, rightRgba: changed ? rightRgba : null, diffMask: changed ? diffBuffer : null }
}

/**
 * Compare corresponding rendered pages and return per-page visual diff results.
 * @param {import('./render_pages.js').RenderedPage[]} leftPages
 * @param {import('./render_pages.js').RenderedPage[]} rightPages
 * @param {object} options
 * @param {number} [options.threshold=0.01]
 * @param {string|null} [options.outdir=null] - If provided, save diff highlight PNGs here.
 * @returns {Array<{ page: number, visual_score: number, visual_changed: boolean, diff_image_path: string|null, notes?: string }>}
 */
export function diffPageImages (leftPages, rightPages, { threshold = 0.01, outdir = null } = {}) {
  const leftDict = new Map(leftPages.map(p => [p.index, p]))
  const rightDict = new Map(rightPages.map(p => [p.index, p]))
  const allIndices = [...new Set([...leftDict.keys(), ...rightDict.keys()])].sort((a, b) => a - b)

  const results = []

  for (const idx of allIndices) {
    const leftImg = leftDict.get(idx)
    const rightImg = rightDict.get(idx)

    if (!leftImg || !rightImg) {
      results.push({
        page: idx + 1,
        visual_score: 1.0,
        visual_changed: true,
        diff_image_path: null,
        notes: 'Page missing in one document',
      })
      continue
    }

    const { score, changed, diffPng } = compareImages(leftImg, rightImg, { threshold })

    let diffImagePath = null
    if (changed && diffPng && outdir) {
      fs.mkdirSync(outdir, { recursive: true })
      const filePath = path.join(outdir, `diff_page_${String(idx + 1).padStart(4, '0')}.png`)
      fs.writeFileSync(filePath, diffPng)
      diffImagePath = filePath
    }

    results.push({
      page: idx + 1,
      visual_score: score,
      visual_changed: changed,
      diff_image_path: diffImagePath,
    })
  }

  return results
}
