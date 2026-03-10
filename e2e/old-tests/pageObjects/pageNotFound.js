'use strict'

class PageNotFound {
  get pageNotFoundHeader () { return $('h1*=Page not found') }

  get assertPageNotFound () {
    return async () => {
      const h1 = await this.pageNotFoundHeader
      const h1Text = await h1.getText()
      expect(h1Text).toEqual('Page not found')
    }
  }
}

module.exports = new PageNotFound()
