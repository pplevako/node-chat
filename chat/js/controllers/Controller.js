'use strict'

define([], function() {
  var _slice = [].slice


  /**
   * Base controller prototype
   *
   * @constructor
   * @interface
   * @param {Scope} $scope Controller scope
   * @param {*} [services] Services, etc.
   */
  function Controller($scope, services) {
    var args = _slice.call(arguments, 0)

    this.addScopeProperties.apply(this, args)
    this.addScopeMethods.apply(this, args)
    this.registerScopeListeners.apply(this, args)
    this.applyServices.apply(this, args)
  }


  /**
   * Add methods, listeners to scope, etc.
   */
  Controller.prototype.addScopeMethods = function() {
    // $scope.buttonClick = function() { ... }
    // $scope.someMethod = function(args) { ... }
  }


  /**
   * Add properties to scope here
   */
  Controller.prototype.addScopeProperties = function() {
    // $scope.someProperty = 1
  }


  /**
   * Interaction with services should be implemented in this method
   */
  Controller.prototype.applyServices = function() {
    // $service.on('server push event', ...)
    // $service.emit('my cool event', arg1, arg2, ..., argN)
  }


  /**
   * Scope event listeners
   */
  Controller.prototype.registerScopeListeners = function() {
    // $scope.$on('event', function(event, arg1, arg2) { ... })
  }

  return Controller
})