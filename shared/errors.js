if (typeof exports === 'undefined') {
  exports = window
}


function BlockError(message, constr) {
  Error.captureStackTrace(this, constr || this)

  this.message = message
}
BlockError.prototype.__proto__ = Error.prototype
BlockError.prototype.name = 'BlockError'
BlockError.prototype.reason = 'block'




function SpamError(message) {
  BlockError.call(this, message, SpamError)
}
SpamError.prototype.__proto__ = BlockError.prototype
BlockError.prototype.name = 'SpamError'
BlockError.prototype.reason = 'spam'


exports.BlockError = BlockError
exports.SpamError = SpamError