import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { PDFParse } from 'pdf-parse'
import { expect } from '@playwright/test'

const downloadsDir = path.resolve(process.cwd(), '_results_', 'downloads')

// eslint-disable-next-line no-control-regex
const sanitizeFileName = (name = '') => name.replaceAll(/[<>:"/\\|?*\x00-\x1F]/g, '_')

const fileNameFromContentDisposition = (header = '') => {
  const value = header
  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(value)
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }
  const plainMatch = /filename="?([^";]+)"?/i.exec(value)
  return plainMatch?.[1]
}

export class PdfDriver {
  constructor (page) {
    this.page = page
  }

  // ----FILE HELPERS---- //

  async clearPdfFiles () {
    await fs.mkdir(downloadsDir, { recursive: true })
    const files = await this.listPdfFiles()
    await Promise.all(files.map(async (filePath) => fs.unlink(filePath).catch(() => {})))
  }

  async listPdfFiles () {
    try {
      const files = await fs.readdir(downloadsDir)
      return files
        .filter((fileName) => fileName.toLowerCase().endsWith('.pdf'))
        .map((fileName) => path.join(downloadsDir, fileName))
    } catch {
      return []
    }
  }

  // ----DOWNLOAD HELPERS---- //

  async waitForDownload (triggerDownload, timeout = 20000) {
    // Both promises race to collect their data into a normalised shape.
    // Only the winner's saveAs is called, so exactly one file is written.
    const downloadEventPromise = this.page.waitForEvent('download', { timeout })
      .then(async (download) => ({
        fileName: sanitizeFileName(download.suggestedFilename()),
        saveAs: async (dest) => download.saveAs(dest)
      }))

    const responsePdfPromise = this.page.waitForResponse((response) => {
      const contentType = response.headers()['content-type'] || ''
      return contentType.toLowerCase().includes('application/pdf')
    }, { timeout }).then(async (response) => {
      const body = await response.body()
      const headerFileName = fileNameFromContentDisposition(response.headers()['content-disposition'])
      const generatedName = headerFileName || `download-${Date.now()}-${randomUUID()}.pdf`
      return {
        fileName: sanitizeFileName(generatedName),
        saveAs: async (dest) => fs.writeFile(dest, body)
      }
    })

    await triggerDownload()
    const winner = await Promise.any([downloadEventPromise, responsePdfPromise])
    await fs.mkdir(downloadsDir, { recursive: true })
    const downloadPath = path.join(downloadsDir, winner.fileName)
    await winner.saveAs(downloadPath)
    return downloadPath
  }

  // ----PARSE HELPERS---- //

  async parsePdf (filePath) {
    const buffer = await fs.readFile(filePath)
    const parser = new PDFParse({ data: buffer })
    const parsedPdf = await parser.getText()
    const pdfInfo = await parser.getInfo({ parsePageInfo: true })
    await parser.destroy()

    const text = parsedPdf.text.replaceAll(/\s+/g, ' ').toLowerCase()
    const links = (pdfInfo.pages || [])
      .flatMap((page) => page.links || [])
      .map((link) => link?.url || link?.unsafeUrl || link?.href || '')
      .filter(Boolean)
    const normalizedLinks = links.map((url) => url.trim().replace(/\/$/, ''))

    return { text, links, normalizedLinks }
  }

  // ----ASSERTIONS---- //

  async expectCoreContent (pdf, { reference, scale }) {
    const normalizedPdfText = pdf.text
      .replaceAll(/\s+/g, '')
      .replaceAll(',', '')

    expect(pdf.text.length).toBeGreaterThan(100)
    expect(pdf.text).toContain('flood')
    expect(pdf.text).toContain('your reference')
    if (reference) {
      expect(pdf.text).toContain(reference.toLowerCase())
    } else {
      expect(pdf.text).toContain('unspecified')
    }
    expect(pdf.text).toContain('scale')
    expect(normalizedPdfText).toContain(`1:${scale}`)
  }

  async expectFloodZone (pdf, floodZone) {
    expect(pdf.text).toContain(`your selected location is in flood zone ${floodZone}`)
  }

  async expectLocation (pdf, polygonString) {
    const coordinates = JSON.parse(polygonString)
    const isClosed = JSON.stringify(coordinates[0]) === JSON.stringify(coordinates.at(-1))
    const points = isClosed ? coordinates.slice(0, -1) : coordinates
    const easting = Math.floor(points.reduce((sum, [x]) => sum + x, 0) / points.length)
    const northing = Math.floor(points.reduce((sum, [, y]) => sum + y, 0) / points.length)
    expect(pdf.text).toContain(`${easting}/${northing}`)
  }

  async expectRequiredLinks (pdf, expectedLinks) {
    expect(pdf.links.length).toBeGreaterThan(0)
    expectedLinks.forEach((expectedLink) => {
      expect(pdf.normalizedLinks).toContain(expectedLink)
    })
  }

  async expectAllLinksAreValid (pdf) {
    pdf.links.forEach((url) => {
      expect(URL.canParse(url)).toBe(true)
    })
  }
}
