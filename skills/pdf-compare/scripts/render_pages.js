/**
 * Render PDF pages to pixel data for visual comparison.
 * Uses the mupdf WASM package.
 */

import fs from 'node:fs'
import path from 'node:path'
import * as mupdf from 'mupdf'

/**
 * @typedef {object} RenderedPage
 * @property {number} index - 0-based page index.
 * @property {Uint8Array} pixels - RGB pixel data (3 bytes per pixel).
 * @property {number} width
 * @property {number} height
 */

/**
 * Render specified PDF pages to pixel data.
 * @param {string} pdfPath - Path to the PDF file.
 * @param {object} options
 * @param {number} [options.dpi=150] - Rendering resolution.
 * @param {number[]|null} [options.pages=null] - 0-based page indices. null = all pages.
 * @returns {RenderedPage[]}
 */
export function renderPages (pdfPath, { dpi = 150, pages = null } = {}) {
  const data = fs.readFileSync(pdfPath)
  const doc = mupdf.Document.openDocument(data, 'application/pdf')
  const results = []

  try {
    const totalPages = doc.countPages()
    const indices = pages ?? Array.from({ length: totalPages }, (_, i) => i)
    const zoom = dpi / 72
    const matrix = mupdf.Matrix.scale(zoom, zoom)

    for (const idx of indices) {
      const page = doc.loadPage(idx)
      // Render without alpha (RGB, 3 bytes/pixel) — we convert to RGBA for comparison
      const pixmap = page.toPixmap(matrix, mupdf.ColorSpace.DeviceRGB)
      const width = pixmap.getWidth()
      const height = pixmap.getHeight()
      const pixels = pixmap.getPixels() // Uint8ClampedArray, RGB

      results.push({
        index: idx,
        pixels: new Uint8Array(pixels),
        width,
        height,
      })

      // Free WASM-side pixmap immediately to avoid accumulating memory
      pixmap.destroy()

      // Periodically shrink the store to reclaim cached resources
      if (results.length % 20 === 0) {
        try { mupdf.shrinkStore() } catch { /* ignore */ }
      }
    }
  } finally {
    doc.destroy()
  }

  return results
}

/**
 * Save rendered pages as PNG files using mupdf's built-in PNG encoder.
 * @param {string} pdfPath - Path to the PDF.
 * @param {number[]} indices - 0-based page indices.
 * @param {string} outdir - Output directory.
 * @param {object} options
 * @param {number} [options.dpi=150]
 * @param {string} [options.prefix='page']
 * @returns {string[]} Output file paths.
 */
export function savePageImages (pdfPath, indices, outdir, { dpi = 150, prefix = 'page' } = {}) {
  fs.mkdirSync(outdir, { recursive: true })
  const data = fs.readFileSync(pdfPath)
  const doc = mupdf.Document.openDocument(data, 'application/pdf')
  const paths = []

  try {
    const zoom = dpi / 72
    const matrix = mupdf.Matrix.scale(zoom, zoom)

    for (const idx of indices) {
      const page = doc.loadPage(idx)
      const pixmap = page.toPixmap(matrix, mupdf.ColorSpace.DeviceRGB)
      const pngData = pixmap.asPNG()
      const filePath = path.join(outdir, `${prefix}_${String(idx + 1).padStart(4, '0')}.png`)
      fs.writeFileSync(filePath, pngData)
      paths.push(filePath)

      pixmap.destroy()
    }
  } finally {
    doc.destroy()
  }

  return paths
}
