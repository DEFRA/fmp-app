module.exports = [{
  paths: ['assets/**/*.js'],
  on: {
    all: ['npm run build:js']
  }
}, {
  paths: ['client/**/*.scss'],
  on: {
    all: ['npm run build:css']
  }
}]
