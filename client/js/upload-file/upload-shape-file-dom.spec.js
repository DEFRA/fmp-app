const {
  locationFormatError,
  noFileSelected,
  invalidFileFormat,
  tooManyNodes,
  tooManyFilesSelected,
  fileCouldNotBeRead
} = require('./upload-file-errors.js')

describe('showError and clearError', () => {
  let errorSummary
  let errorSummaryText
  let formGroup
  let fileInput

  beforeEach(() => {
    jest.resetModules()
    errorSummary = document.createElement('div')
    errorSummary.id = 'errorSummary'
    errorSummary.style.display = 'none'
    errorSummaryText = document.createElement('a')
    errorSummaryText.id = 'errorSummaryText'
    formGroup = document.createElement('div')
    formGroup.className = 'govuk-form-group'
    fileInput = document.createElement('input')
    fileInput.id = 'boundary'
    fileInput.type = 'file'
    const dropZone = document.createElement('div')
    dropZone.className = 'govuk-drop-zone'
    formGroup.appendChild(fileInput)
    formGroup.appendChild(dropZone)
    document.body.appendChild(errorSummary)
    document.body.appendChild(errorSummaryText)
    document.body.appendChild(formGroup)
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('should display the error message', () => {
    const { showError } = require('./upload-shape-file-dom.js')
    showError('Something went wrong.')
    expect(errorSummary.style.display).toBe('block')
    expect(errorSummaryText.textContent).toBe('Something went wrong.')
    expect(document.getElementById('errorDetail').textContent).toContain('Something went wrong.')
  })

  it('should clear the previous error before showing a new one', () => {
    const { showError } = require('./upload-shape-file-dom.js')
    showError('First error.')
    showError('Second error.')
    expect(errorSummaryText.textContent).toBe('Second error.')
  })

  it('should hide the error summary and remove error state when cleared', () => {
    const { showError, clearError } = require('./upload-shape-file-dom.js')
    showError('An error.')
    clearError()
    expect(errorSummary.style.display).toBe('none')
    expect(errorSummaryText.textContent).toBe('')
    expect(document.getElementById('errorDetail')).toBeNull()
    expect(formGroup.classList.contains('govuk-form-group--error')).toBe(false)
  })

  it('should render location format error bullets when passed a structured message', () => {
    const { showError } = require('./upload-shape-file-dom.js')
    showError(locationFormatError)

    expect(errorSummaryText.textContent).toBe(locationFormatError.summary)
    const errorDetail = document.getElementById('errorDetail')
    const messageLines = errorDetail.querySelectorAll('span[style]')
    const bulletItems = errorDetail.querySelectorAll('ul.govuk-list--bullet li')
    expect(messageLines[0].textContent).toBe(`${locationFormatError.summary}.`)
    expect(messageLines[1].textContent).toBe('The file must:')
    expect(bulletItems.length).toBe(locationFormatError.bullets.length)
  })

  it('should render error with summary and text when passed a structured message without bullets', () => {
    const { showError } = require('./upload-shape-file-dom.js')
    showError(noFileSelected)

    expect(errorSummary.style.display).toBe('block')
    expect(errorSummaryText.textContent).toBe(noFileSelected.summary)
    const errorDetail = document.getElementById('errorDetail')
    expect(errorDetail).not.toBeNull()
    expect(errorDetail.textContent).toContain(noFileSelected.text)
    expect(errorDetail.querySelectorAll('ul').length).toBe(0)
    expect(formGroup.classList.contains('govuk-form-group--error')).toBe(true)
    expect(fileInput.classList.contains('govuk-file-upload--error')).toBe(true)
  })

  it('should render invalidFileFormat error with summary and text', () => {
    const { showError } = require('./upload-shape-file-dom.js')
    showError(invalidFileFormat)

    expect(errorSummary.style.display).toBe('block')
    expect(errorSummaryText.textContent).toBe(invalidFileFormat.summary)
    const errorDetail = document.getElementById('errorDetail')
    expect(errorDetail).not.toBeNull()
    expect(errorDetail.textContent).toContain(invalidFileFormat.text)
    expect(errorDetail.querySelectorAll('ul').length).toBe(0)
    expect(formGroup.classList.contains('govuk-form-group--error')).toBe(true)
    expect(fileInput.classList.contains('govuk-file-upload--error')).toBe(true)
  })

  it('should render tooManyNodes error', () => {
    const { showError } = require('./upload-shape-file-dom.js')
    showError(tooManyNodes)

    expect(errorSummaryText.textContent).toBe(tooManyNodes.summary)
    const errorDetail = document.getElementById('errorDetail')
    expect(errorDetail.textContent).toContain(tooManyNodes.text)
  })

  it('should render tooManyFilesSelected error', () => {
    const { showError } = require('./upload-shape-file-dom.js')
    showError(tooManyFilesSelected)

    expect(errorSummaryText.textContent).toBe(tooManyFilesSelected.summary)
    const errorDetail = document.getElementById('errorDetail')
    expect(errorDetail.textContent).toContain(tooManyFilesSelected.text)
  })

  it('should render fileCouldNotBeRead error', () => {
    const { showError } = require('./upload-shape-file-dom.js')
    showError(fileCouldNotBeRead)

    expect(errorSummaryText.textContent).toBe(fileCouldNotBeRead.summary)
    const errorDetail = document.getElementById('errorDetail')
    expect(errorDetail.textContent).toContain(fileCouldNotBeRead.text)
  })

  it('should reuse existing errorDetail element when called multiple times', () => {
    const { getOrCreateErrorDetail } = require('./upload-shape-file-dom.js')

    // First call creates the element
    const errorDetail1 = getOrCreateErrorDetail()
    expect(errorDetail1).not.toBeNull()
    expect(errorDetail1.id).toBe('errorDetail')

    // Second call should return the same element (not create a duplicate)
    const errorDetail2 = getOrCreateErrorDetail()
    expect(errorDetail2).toBe(errorDetail1)

    // Verify only one errorDetail element exists in the DOM
    const allErrorDetails = document.querySelectorAll('#errorDetail')
    expect(allErrorDetails.length).toBe(1)
  })
})
