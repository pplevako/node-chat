'use strict'

define([], function() {
  return {
    toMessageObject: function(data) {
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
  }
})