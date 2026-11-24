// Routes and Views
const HOME = 'home'
const LOCATION = 'location'
const ENGLAND_ONLY = 'england-only'
const MAP = 'map'
const MAP_HELP = 'map-help'
const RESULTS = 'results'
const CONTACT = 'contact'
const CHECK_YOUR_DETAILS = 'check-your-details'
const HOW_TO_USE_FLOOD_MAP_FOR_PLANNING_DATA = 'how-to-use-flood-map-for-planning-data'
const CONFIRMATION = 'confirmation'
const OS_ACCOUNT_NUMBER = 'AC0000807064'
const FLOOD_ZONE_RESULTS_EXPLAINED = 'flood-zone-results-explained'
const COOKIES = 'cookies'
const ACCESSIBILITY_STATEMENT = 'accessibility-statement'
const ERROR = 'error'
const FEEDBACK = 'feedback'
const ORDER_NOT_SUBMITTED = 'order-not-submitted'
const CANNOT_REQUEST_P4 = 'cannot-request-p4'
const OS_TERMS = 'os-terms'
const TERMS_AND_CONDITIONS = 'terms-and-conditions'
const UPLOAD = 'upload'

const views = {
  HOME,
  LOCATION,
  ENGLAND_ONLY,
  MAP,
  MAP_HELP,
  RESULTS,
  CONTACT,
  CHECK_YOUR_DETAILS,
  HOW_TO_USE_FLOOD_MAP_FOR_PLANNING_DATA,
  CONFIRMATION,
  FLOOD_ZONE_RESULTS_EXPLAINED,
  COOKIES,
  ACCESSIBILITY_STATEMENT,
  ERROR,
  FEEDBACK,
  ORDER_NOT_SUBMITTED,
  CANNOT_REQUEST_P4,
  OS_TERMS,
  TERMS_AND_CONDITIONS,
  UPLOAD
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

const esriStatusCodes = {
  INVALID_TOKEN_CODE: 498
}

const maxAreaInHectares = 300

module.exports = Object.freeze({
  routes,
  views,
  statusCodes,
  esriStatusCodes,
  OS_ACCOUNT_NUMBER,
  maxAreaInHectares
})
