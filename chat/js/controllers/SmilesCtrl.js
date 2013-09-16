'use strict'

define([
  'config',
  'jquery',
  'css-emoticons'
], function(config, $) {

  function SmilesCtrl($scope, $rootScope, $element) {
    $scope.show = false

    $scope.$on('toggle smiles popover', function() {
      $scope.show = !$scope.show
    })

    this.initSmiles($rootScope, $element)
  }

  SmilesCtrl.prototype.initSmiles = function($rootScope, root) {
    var $root = angular.element(root)
      , $container = $root.find('.panel-body')

    config.smiles.forEach(function(smile) {
      var $smile = $('<span></span>&nbsp;')
      $container.append($smile)

      $smile.html(smile)
      $smile.attr('title', smile)
      $smile.emoticonize()
      $smile.click(function() {
        $rootScope.$broadcast('send smile', smile)
      })
    })
  }

  return SmilesCtrl
})