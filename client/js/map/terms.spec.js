const { terms } = require('./terms.js')

describe('terms', () => {
  it('should expose the expected top-level sections', () => {
    expect(Object.keys(terms)).toEqual(
      expect.arrayContaining(['keys', 'labels', 'chance', 'depth', 'depthBandKey', 'likelihoodchance'])
    )
  })

  it('should map flood zone keys', () => {
    expect(terms.keys).toEqual({
      fz2: 'FZ2',
      fz3: 'FZ3',
      fzCC: 'FZCC',
      fzNoData: 'FZNODATA'
    })
  })

  it('should have a label for every depth band key', () => {
    Object.keys(terms.depthBandKey).forEach((key) => {
      expect(terms.depth).toHaveProperty(key)
    })
  })

  it('should have matching chance and likelihood chance keys', () => {
    expect(Object.keys(terms.likelihoodchance)).toEqual(Object.keys(terms.chance))
  })
})
