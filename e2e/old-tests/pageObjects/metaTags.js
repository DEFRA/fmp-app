'use strict'

class MetaTags {
  get metaDescription () { return $('meta[property=description]') }
  get metaOGDescription () { return $('meta[property="og:description"]') }
  get metaRobots () { return $('meta[name=robots]') }

  async getMetaDescription () {
    const metaTag = await this.metaDescription
    return metaTag.getAttribute('content')
  }

  async getMetaOGDescription () {
    const metaTag = await this.metaOGDescription
    return metaTag.getAttribute('content')
  }

  async getMetaRobotsContent () {
    const metaTag = await this.metaRobots
    return await metaTag.getAttribute('content')
  }

  // TODO - update expectedMetaDescription when FCRM-4377 is done
  get expectedMetaDescription () {
    return 'Get flood risk information and maps for planning applications and planning permission in England, including flood zones and flood risk assessment data.'
  }

  get assertMetaDescription () {
    return async () => {
      const content = await this.getMetaDescription()
      expect(content).toEqual(this.expectedMetaDescription)
    }
  }

  get assertMetaOGDescription () {
    return async () => {
      const content = await this.getMetaOGDescription()
      expect(content).toEqual(this.expectedMetaDescription)
    }
  }

  get assertRobotsCanIndex () {
    return async () => {
      const content = await this.getMetaRobotsContent()
      expect(content).toEqual('all')
    }
  }

  get assertRobotsCantIndex () {
    return async () => {
      const content = await this.getMetaRobotsContent()
      expect(content).toEqual('noindex')
    }
  }
}

module.exports = new MetaTags()
