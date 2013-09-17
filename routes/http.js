'use strict'

/**
 * Init Express routing
 *
 * @param {express} app
 */
module.exports = function(app) {
  app.get('/', function(req, res) {
    res.render('index')
  })

  // render settings page
  app.get('/admin', function(req, res) {
    res.render('settings')
  })
}