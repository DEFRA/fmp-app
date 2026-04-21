/**
 * Extract text from PDF pages with normalization options.
 * Uses the mupdf WASM package (no system dependencies required).
 */

import fs from 'node:fs'
import * as mupdf from 'mupdf'
import { normalizeText } from './utils.js'

/**
 * Extract text from each page of a PDF.
 * @param {string} pdfPath - Path to the PDF file.
 * @param {object} options
 * @param {boolean} [options.normalize=true] - Apply text normalization.
 * @param {boolean} [options.collapseWhitespace=true]
 * @param {boolean} [options.strip=true]
 * @returns {string[]} Array of strings, one per page. Empty string for pages with no extractable text.
 */
export function extractTextPerPage (pdfPath, { normalize: doNormalize = true, collapseWhitespace = true, strip = true } = {}) {
  const data = fs.readFileSync(pdfPath)
  const doc = mupdf.Document.openDocument(data, 'application/pdf')
  const pages = []

  try {
    const count = doc.countPages()
    for (let i = 0; i < count; i++) {
      const page = doc.loadPage(i)
      let text = ''
      try {
        const stext = page.toStructuredText('preserve-whitespace')
        text = stext.asText() || ''
      } catch {
        text = ''
      }
      if (doNormalize && text) {
        text = normalizeText(text, { collapseWhitespace, strip })
      }
      pages.push(text)
    }
  } finally {
    doc.destroy()
  }

  return pages
}

/**
 * Extract text block bounding boxes per page (in PDF points).
 * Returns an array (per page) of arrays of { x, y, w, h } rectangles
 * covering all text blocks on that page.
 * @param {string} pdfPath
 * @returns {Array<Array<{x: number, y: number, w: number, h: number}>>}
 */
export function extractTextBounds (pdfPath) {
  const data = fs.readFileSync(pdfPath)
  const doc = mupdf.Document.openDocument(data, 'application/pdf')
  const result = []

  try {
    const count = doc.countPages()
    for (let i = 0; i < count; i++) {
      const page = doc.loadPage(i)
      const blocks = []
      try {
        const stext = page.toStructuredText('preserve-whitespace')
        const parsed = JSON.parse(stext.asJSON())
        for (const block of (parsed.blocks || [])) {
          if (block.type === 'text' && block.bbox) {
            blocks.push({
              x: block.bbox.x,
              y: block.bbox.y,
              w: block.bbox.w,
              h: block.bbox.h,
            })
          }
        }
      } catch { /* skip pages that fail */ }
      result.push(blocks)
    }
  } finally {
    doc.destroy()
  }

  return result
}

/**
 * Return the number of pages in a PDF.
 */
export function getPageCount (pdfPath) {
  const data = fs.readFileSync(pdfPath)
  const doc = mupdf.Document.openDocument(data, 'application/pdf')
  try {
    return doc.countPages()
  } finally {
    doc.destroy()
  }
}

const METADATA_KEYS = [
  'info:Title',
  'info:Author',
  'info:Subject',
  'info:Keywords',
  'info:Creator',
  'info:Producer',
  'info:CreationDate',
  'info:ModDate',
]

/**
 * Extract PDF metadata as a flat object.
 */
export function getMetadata (pdfPath) {
  const data = fs.readFileSync(pdfPath)
  const doc = mupdf.Document.openDocument(data, 'application/pdf')
  const meta = {}
  try {
    for (const key of METADATA_KEYS) {
      const value = doc.getMetaData(key)
      if (value) {
        // Strip the 'info:' prefix for cleaner output
        const shortKey = key.replace('info:', '')
        meta[shortKey] = value
      }
    }
  } finally {
    doc.destroy()
  }
  return meta
}

/**
 * Return metadata fields that differ between left and right.
 */
export function diffMetadata (leftMeta, rightMeta) {
  const allKeys = new Set([...Object.keys(leftMeta), ...Object.keys(rightMeta)])
  const diff = {}
  for (const key of [...allKeys].sort()) {
    const lv = leftMeta[key] || ''
    const rv = rightMeta[key] || ''
    if (lv !== rv) {
      diff[key] = { left: lv, right: rv }
    }
  }
  return diff
}
