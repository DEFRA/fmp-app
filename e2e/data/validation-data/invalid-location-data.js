// Version 2.0 MCC 2025/04/16
// This version of the file is used for the new FMFP application under FCRM-5513.
// It is a copy of the original file with the following changes:
// - The invalid location data has been updated to include new test cases.

const loremIpsum = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean ma'

export const invalidLocationData = {
  nonEnglandSearchData: [
    // must include Welsh, Scottish, NI and Rest of World searches
    { search: 'Cardiff' },
    { search: 'Edinburgh' },
    { search: 'Berlin' }
  ],

  invalidPostcodeSearchData: [ // Returns 'Enter a real place name or postcode' error
    { search: '' },
    { search: ':::JHDRNTY$W%' },
    { search: 'https://flood-k/' },
    { search: loremIpsum },
  ],

  noAddressFoundSearchData: [ // Returns 'No address found for that place name or postcode' error
    { search: 'ZZ1 1ZZ' },
    { search: 'ERRORPOSTCODE' },
    { search: 'FishandChips' },
  ],

  nonEnglandNGRData: [
    { search: 'SN 12345 67890' }, // Welsh NGR
    { search: 'NO 01513 83579' }, // Scottish NGR
    { search: 'NW 06562 73004' }, // Northern Irish NGR
    { search: 'SD 31848 60999' } // In the sea
  ],

  invalidNGRData: [ // Returns 'Enter a real National Grid Reference (NGR)' error
    { search: 'XX 12345 67890' }, // Non-geographic NGR
    { search: 'ERRORNRG' },
    { search: '' },
    { search: '12345678911111111' },
    { search: '123ER5^&&**(((' },
    { search: 'https://flood-/' },
    { search: loremIpsum }
  ],

  nonEnglandEastingData: [
    { searchEasting: '258100', searchNorthing: '256760' }, // Welsh NGR
    { searchEasting: '337850', searchNorthing: '593193' }, // Scottish NGR
    { searchEasting: '135957', searchNorthing: '564657' }, // Northern Irish NGR
    { searchEasting: '308256', searchNorthing: '474537' } // In the sea
  ],

  invalidEastingNorthingData: [
    { searchEasting: '12345678911111111', searchNorthing: '12345678911111111' },
    { searchEasting: '0', searchNorthing: '0' }
  ],

  invalidCharactersEastingNorthingData: [
    { searchEasting: '123ER5^&&**(((', searchNorthing: '123ER5^&&**(((' },
    { searchEasting: 'https://flood-/', searchNorthing: 'https://flood-/' },
    { searchEasting: loremIpsum, searchNorthing: loremIpsum },
    { searchEasting: '', searchNorthing: '' }
  ]
}
