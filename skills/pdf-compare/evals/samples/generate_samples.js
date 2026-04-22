#!/usr/bin/env node
/**
 * Generate sample PDF pairs for testing the pdf-compare skill.
 * Uses pdf-lib (pure JavaScript, no system dependencies).
 *
 * Run: node evals/samples/generate_samples.js
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SAMPLES_DIR = __dirname

async function createPdf ({ pages, title = 'Sample', author = 'pdf-compare test' }) {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)

  doc.setTitle(title)
  doc.setAuthor(author)

  for (const { text, fontSize = 12, x = 50, y = 700 } of pages) {
    const page = doc.addPage([612, 792]) // US Letter
    const lines = text.split('\n')
    let currentY = y
    for (const line of lines) {
      page.drawText(line, { x, y: currentY, size: fontSize, font, color: rgb(0, 0, 0) })
      currentY -= fontSize * 1.4
    }
  }

  return doc.save()
}

async function generateIdenticalPair () {
  const pages = [
    { text: 'Page 1\n\nThis is the first page of the document.\nIt contains some sample text.' },
    { text: 'Page 2\n\nThis is the second page.\nMore content here for testing purposes.' },
    { text: 'Page 3\n\nFinal page with concluding remarks.\nThank you for reading.' },
  ]

  const pdfA = await createPdf({ pages, title: 'Identical Test A' })
  const pdfB = await createPdf({ pages, title: 'Identical Test A' }) // Same title to be truly identical metadata

  fs.writeFileSync(path.join(SAMPLES_DIR, 'identical_a.pdf'), pdfA)
  fs.writeFileSync(path.join(SAMPLES_DIR, 'identical_b.pdf'), pdfB)
  console.log('  Created identical_a.pdf and identical_b.pdf')
}

async function generateTextChangePair () {
  const pagesA = [
    { text: 'Page 1\n\nThis is the first page of the document.\nIt contains some sample text.' },
    { text: 'Page 2\n\nThis is the original second page.\nIt has specific content that will change.' },
    { text: 'Page 3\n\nFinal page with concluding remarks.\nThank you for reading.' },
  ]

  const pagesB = [
    { text: 'Page 1\n\nThis is the first page of the document.\nIt contains some sample text.' },
    { text: 'Page 2\n\nThis is the REVISED second page.\nIt has updated content with new information.\nAn extra line was added here.' },
    { text: 'Page 3\n\nFinal page with concluding remarks.\nThank you for reading.' },
  ]

  const pdfA = await createPdf({ pages: pagesA, title: 'Text Change Test A' })
  const pdfB = await createPdf({ pages: pagesB, title: 'Text Change Test B' })

  fs.writeFileSync(path.join(SAMPLES_DIR, 'text_change_a.pdf'), pdfA)
  fs.writeFileSync(path.join(SAMPLES_DIR, 'text_change_b.pdf'), pdfB)
  console.log('  Created text_change_a.pdf and text_change_b.pdf')
}

async function generateLayoutChangePair () {
  const bodyText = [
    'Report Heading',
    '',
    'Lorem ipsum dolor sit amet.',
    'Sed do eiusmod tempor incididunt.',
    'Ut enim ad minim veniam quis.',
    'Nisi ut aliquip ex ea commodo.',
    'Duis aute irure dolor in velit.',
    'Excepteur sint occaecat sunt.',
    'Officia deserunt mollit anim id.',
    '',
    'Second paragraph of content.',
    'More lines for visual coverage.',
    'Layout shifts are detected here.',
  ].join('\n')

  const pagesA = [
    { text: bodyText, x: 50, y: 700, fontSize: 14 },
    { text: bodyText, x: 50, y: 700, fontSize: 14 },
  ]

  // Same text and font size, but shifted position (text still fits on page)
  const pagesB = [
    { text: bodyText, x: 250, y: 450, fontSize: 14 },
    { text: bodyText, x: 250, y: 450, fontSize: 14 },
  ]

  const pdfA = await createPdf({ pages: pagesA, title: 'Layout Change Test' })
  const pdfB = await createPdf({ pages: pagesB, title: 'Layout Change Test' })

  fs.writeFileSync(path.join(SAMPLES_DIR, 'layout_change_a.pdf'), pdfA)
  fs.writeFileSync(path.join(SAMPLES_DIR, 'layout_change_b.pdf'), pdfB)
  console.log('  Created layout_change_a.pdf and layout_change_b.pdf')
}

async function generatePageCountMismatchPair () {
  const pagesA = [
    { text: 'Page 1\n\nFirst page content.' },
    { text: 'Page 2\n\nSecond page content.' },
    { text: 'Page 3\n\nThird page content.' },
  ]

  // Right has an extra page inserted
  const pagesB = [
    { text: 'Page 1\n\nFirst page content.' },
    { text: 'Page 2\n\nSecond page content.' },
    { text: 'Page 3\n\nThird page content.' },
    { text: 'Page 4\n\nThis is a newly added page.' },
  ]

  const pdfA = await createPdf({ pages: pagesA, title: 'Page Count Test' })
  const pdfB = await createPdf({ pages: pagesB, title: 'Page Count Test' })

  fs.writeFileSync(path.join(SAMPLES_DIR, 'pagecount_3_a.pdf'), pdfA)
  fs.writeFileSync(path.join(SAMPLES_DIR, 'pagecount_4_b.pdf'), pdfB)
  console.log('  Created pagecount_3_a.pdf and pagecount_4_b.pdf')
}

async function generateMetadataOnlyChangePair () {
  const pages = [
    { text: 'Page 1\n\nIdentical content on every page.' },
    { text: 'Page 2\n\nMore identical content here.' },
  ]

  const pdfA = await createPdf({ pages, title: 'Draft v1', author: 'Alice' })
  const pdfB = await createPdf({ pages, title: 'Final v2', author: 'Bob' })

  fs.writeFileSync(path.join(SAMPLES_DIR, 'metadata_only_a.pdf'), pdfA)
  fs.writeFileSync(path.join(SAMPLES_DIR, 'metadata_only_b.pdf'), pdfB)
  console.log('  Created metadata_only_a.pdf and metadata_only_b.pdf')
}

async function generateMiddleInsertPair () {
  // Original: 5 pages about different topics
  const pagesA = [
    { text: 'Chapter 1: Introduction\n\nThis chapter introduces the main concepts.\nWe cover background and motivation.' },
    { text: 'Chapter 2: Methods\n\nThis chapter describes our methodology.\nWe used a mixed-methods approach.' },
    { text: 'Chapter 3: Results\n\nHere we present the findings.\nThe data shows significant improvements.' },
    { text: 'Chapter 4: Discussion\n\nWe discuss the implications of our findings.\nSeveral limitations should be noted.' },
    { text: 'Chapter 5: Conclusion\n\nIn conclusion, the study demonstrates value.\nFuture work should explore further.' },
  ]

  // Revised: 2 new pages inserted after Chapter 2, and Chapter 3 has a text edit
  const pagesB = [
    { text: 'Chapter 1: Introduction\n\nThis chapter introduces the main concepts.\nWe cover background and motivation.' },
    { text: 'Chapter 2: Methods\n\nThis chapter describes our methodology.\nWe used a mixed-methods approach.' },
    { text: 'Chapter 2a: Additional Methods\n\nThis new section covers supplementary methods.\nStatistical analysis was performed using R.' },
    { text: 'Chapter 2b: Data Collection\n\nThis new section details the data collection process.\nSurveys were distributed to 500 participants.' },
    { text: 'Chapter 3: Results\n\nHere we present the updated findings.\nThe data shows very significant improvements.\nA new analysis was added.' },
    { text: 'Chapter 4: Discussion\n\nWe discuss the implications of our findings.\nSeveral limitations should be noted.' },
    { text: 'Chapter 5: Conclusion\n\nIn conclusion, the study demonstrates value.\nFuture work should explore further.' },
  ]

  const pdfA = await createPdf({ pages: pagesA, title: 'Research Paper v1' })
  const pdfB = await createPdf({ pages: pagesB, title: 'Research Paper v2' })

  fs.writeFileSync(path.join(SAMPLES_DIR, 'middle_insert_a.pdf'), pdfA)
  fs.writeFileSync(path.join(SAMPLES_DIR, 'middle_insert_b.pdf'), pdfB)
  console.log('  Created middle_insert_a.pdf and middle_insert_b.pdf')
}

async function generateMiddleDeletePair () {
  // Original: 5 pages
  const pagesA = [
    { text: 'Section 1: Overview\n\nProject overview and goals.\nTimeline and milestones.' },
    { text: 'Section 2: Budget\n\nDetailed budget breakdown.\nTotal cost estimate included.' },
    { text: 'Section 3: Obsolete Section\n\nThis section is no longer relevant.\nIt will be removed in the revision.' },
    { text: 'Section 4: Implementation\n\nImplementation plan and phases.\nResource allocation details.' },
    { text: 'Section 5: Summary\n\nProject summary and next steps.\nApproval requested by end of quarter.' },
  ]

  // Revised: Section 3 removed, Section 4 has minor edit
  const pagesB = [
    { text: 'Section 1: Overview\n\nProject overview and goals.\nTimeline and milestones.' },
    { text: 'Section 2: Budget\n\nDetailed budget breakdown.\nTotal cost estimate included.' },
    { text: 'Section 4: Implementation\n\nRevised implementation plan and phases.\nResource allocation details updated.' },
    { text: 'Section 5: Summary\n\nProject summary and next steps.\nApproval requested by end of quarter.' },
  ]

  const pdfA = await createPdf({ pages: pagesA, title: 'Proposal v1' })
  const pdfB = await createPdf({ pages: pagesB, title: 'Proposal v2' })

  fs.writeFileSync(path.join(SAMPLES_DIR, 'middle_delete_a.pdf'), pdfA)
  fs.writeFileSync(path.join(SAMPLES_DIR, 'middle_delete_b.pdf'), pdfB)
  console.log('  Created middle_delete_a.pdf and middle_delete_b.pdf')
}

async function main () {
  fs.mkdirSync(SAMPLES_DIR, { recursive: true })
  console.log('Generating sample PDFs...')

  await generateIdenticalPair()
  await generateTextChangePair()
  await generateLayoutChangePair()
  await generatePageCountMismatchPair()
  await generateMetadataOnlyChangePair()
  await generateMiddleInsertPair()
  await generateMiddleDeletePair()

  console.log(`\nAll samples written to ${SAMPLES_DIR}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
