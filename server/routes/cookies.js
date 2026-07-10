const Joi = require('joi')
const { config } = require('../../config')
const { cookiesModel } = require('./models/cookies')
const { updatePolicy } = require('../cookies')
const { isSafeRedirect } = require('../common/utils/is-safe-redirect')
const urlCharLimit = 2000

module.exports = [
  {
    method: 'GET',
    path: '/cookies',
    options: {
      validate: {
        query: Joi.object({
          updated: Joi.boolean().default(false)
        })
      }
    },
    handler: function (request, h) {
      return h.view(
        'cookies',
        {
          pageTitle: 'Cookies',
          ...cookiesModel(
            request.query.updated,
            request.headers.referer,
            request.state[config.cookie.name]
          )
        }
      )
    }
  },
  {
    method: 'POST',
    path: '/cookies',
    options: {
      validate: {
        payload: Joi.object({
          analytics: Joi.boolean().required(),
          async: Joi.boolean().default(false),
          referer: Joi.string().allow(''),
          returnUrl: Joi.string().allow('').max(urlCharLimit).optional()
        })
      }
    },
    handler: function (request, h) {
      const payload = request.payload
      updatePolicy(request, h, payload.analytics)
      if (payload.async) {
        return h.response({ message: 'success' })
      }
      if (isSafeRedirect(payload.returnUrl)) {
        return h.redirect(payload.returnUrl)
      }
      // Synchronous mode from preferences page — redirect back with ?updated=true
      // so the browser lands on a GET, preventing the ERR_CACHE_MISS / form
      // resubmit dialog when the user later clicks Back.
      return h.redirect('/cookies?updated=true')
    }
  }
]
