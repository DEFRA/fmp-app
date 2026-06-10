import fs from 'node:fs/promises'
import path from 'node:path'
import { PDFParse } from 'pdf-parse'
import { expect } from '@playwright/test'

const downloadsDir = path.resolve(process.cwd(), '_results_', 'downloads')

export class PdfDriver {
  constructor (page) {
    this.page = page
  }

  // ----DOWNLOAD HELPERS---- //

  awaitDownload (timeout = 60000) {
    return this.page.waitForEvent('download', { timeout })
      .then(async (download) => {
        await fs.mkdir(downloadsDir, { recursive: true })
        const dest = path.join(downloadsDir, download.suggestedFilename())
        await download.saveAs(dest)
        return dest
      })
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
    return { text, links }
  }

  // ----ASSERTIONS---- //

  expectCoreContent (pdf, { reference, scale }) {
    const compactText = pdf.text
      .replaceAll(/\s+/g, '')
      .replaceAll(',', '')

    expect(pdf.text.length).toBeGreaterThan(100)
    expect(pdf.text).toContain('flood')
    expect(pdf.text).toContain('your reference')
    expect(pdf.text).toContain(reference ? reference.toLowerCase() : 'unspecified')
    expect(compactText).toContain(`1:${scale}`)
  }

  expectFloodZone (pdf, floodZone) {
    expect(pdf.text).toContain(`your selected location is in flood zone ${floodZone}`)
  }

  expectLocation (pdf, polygonString, tolerance = 1) {
    const coordinates = JSON.parse(polygonString)
    const isClosed = JSON.stringify(coordinates[0]) === JSON.stringify(coordinates.at(-1))
    const points = isClosed ? coordinates.slice(0, -1) : coordinates
    const expectedEasting = Math.floor(points.reduce((sum, [x]) => sum + x, 0) / points.length)
    const expectedNorthing = Math.floor(points.reduce((sum, [, y]) => sum + y, 0) / points.length)

    expect(pdf.text).toMatch(/\d{6}\/\d{6}/)

    const locationMatch = pdf.text.match(/(\d{6})\/(\d{6})/)
    expect(locationMatch).not.toBeNull()

    const actualEasting = Number(locationMatch[1])
    const actualNorthing = Number(locationMatch[2])

    expect(Math.abs(actualEasting - expectedEasting)).toBeLessThanOrEqual(tolerance)
    expect(Math.abs(actualNorthing - expectedNorthing)).toBeLessThanOrEqual(tolerance)
  }

  expectLinks (pdf, expectedLinks) {
    expect(pdf.links.length).toBeGreaterThan(0)
    const normalized = pdf.links.map((url) => url.trim().replace(/\/$/, ''))
    expectedLinks.forEach((link) => expect(normalized).toContain(link))
    pdf.links.forEach((url) => expect(URL.canParse(url)).toBe(true))
  }

  expectPdfContent (pdf, { reference, scale, floodZone, polygon, expectedLinks }) {
    this.expectCoreContent(pdf, { reference, scale })
    this.expectFloodZone(pdf, floodZone)
    this.expectLocation(pdf, polygon)
    this.expectLinks(pdf, expectedLinks)
  }
}
