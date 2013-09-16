'use strict'

var settingsManager = require('../models/settings')

/**
 * Init Express routing
 *
 * @param {express} app
 */
module.exports = function(app) {
  // render
  app.get('/chat', function(req, res) {
    res.render('index')
  })

  app.get('/partial/:view', function(req, res) {
    res.render(req.params.view)
  })

  // render settings page
  app.get('/admin', function(req, res) {
    res.render('settings')
  })
}