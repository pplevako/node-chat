'use strict'

/**
 * Init Express routing
 *
 * @param {express} app
 */
module.exports = function(app) {
  // render settings page
  app.get('/admin/', function(req, res) {
    res.render('settings')
  })
}