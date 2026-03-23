import polyline from '@mapbox/polyline'

/*
  TO Use this - from the command line in the project root type:
  node utils/decodePolygon.js 'ogt}qzhAomugdxO~ja{MopojGo~wd@_eznN_|hnJ_auiBon~eAnx`eZ'
  -- where 'ogt}qzhAomugdxO~ja{MopojGo~wd@_eznN_|hnJ_auiBon~eAnx`eZ' is the encodedPolygon parameter from the querystring
  - It must be in quotes.
*/

const { decode } = polyline
const encodedPolyon = process.argv[2]
console.log(decode(encodedPolyon))
