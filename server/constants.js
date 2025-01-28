// Routes and Views
const HOME = 'home'
const TRIAGE = 'triage'
const ABOUT_MAP = 'about-map'
const LOCATION = 'location'
const ENGLAND_ONLY = 'england-only'
const MAP = 'map'
const RESULTS = 'results'
const CONTACT = 'contact'
const CHECK_YOUR_DETAILS = 'check-your-details'
const CONFIRMATION = 'confirmation'

const CYLTFRIURL = 'https://www.gov.uk/check-long-term-flood-risk'
const FLOOD_HISTORY_URL = 'https://www.gov.uk/request-flooding-history'
const FLOOD_EXTREME_WEATHER_URL = 'https://www.gov.uk/browse/environment-countryside/flooding-extreme-weather'

const views = {
  HOME,
  TRIAGE,
  ABOUT_MAP,
  LOCATION,
  ENGLAND_ONLY,
  MAP,
  RESULTS,
  CONTACT,
  CHECK_YOUR_DETAILS,
  CONFIRMATION
}

const routes = {
  ...views
}

for (const [key, value] of Object.entries(views)) {
  routes[key] = `/${value}`
}

const statusCodes = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  REDIRECT: 302,
  UNAUTHORIZED: 401,
  PAGE_NOT_FOUND: 404,
  REQUEST_TIMEOUT: 408,
  PAYLOAD_TOO_LARGE: 413,
  PROBLEM_WITH_SERVICE: 500,
  SERVICE_UNAVAILABLE: 503
}

const triageRoutes = {
  'about-map': '/about-map',
  'buy-sell': CYLTFRIURL,
  'flood-history': FLOOD_HISTORY_URL,
  insurance: CYLTFRIURL,
  other: FLOOD_EXTREME_WEATHER_URL
}

module.exports = Object.freeze({
  routes,
  views,
  statusCodes,
  triageRoutes
})
