module.exports = [{
  paths: ['client/**/*.js'],
  on: {
    all: ['npm run build:js']
  }
}, {
  paths: ['client/**/*.scss'],
  on: {
    all: ['npm run build:css']
  }
}]
