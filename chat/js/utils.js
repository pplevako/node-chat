'use strict'

define([], function() {
  var utils = {}
  utils.toMessageObject = function(data) {
    var type = data[0]
      , from = data[1]
      , message = {}

    if (type) {
      message.type = type
    }

    message.from = from
    message.text = data[2]
    message.date = data[3]

    if (type && data.length > 4) {
      message.extra = data[4]
    }

    return message
  }

  utils.inherits = function(child, parent) {
    /* Kindly copied Node.js util.inherits */
    child.super_ = parent;
    child.prototype = Object.create(parent.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    })
  }

  return utils
})