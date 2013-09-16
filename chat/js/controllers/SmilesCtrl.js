'use strict'

define([
  'angular',
  'config',
  'css-emoticons'
], function(angular, config) {

  function SmilesCtrl($scope, $rootScope, $element) {
    $scope.show = false

    $scope.$on('toggle smiles popover', function() {
      $scope.show = !$scope.show
    })

    $(document).mouseup(function(e) {
      var container = angular.element();

      if (!container.is(e.target) && container.has(e.target).length === 0) {
        $rootScope.$apply(function() {
          $scope.show = false
        })
      }
    });

    this.initSmiles($rootScope, $element)
  }

  SmilesCtrl.prototype.initSmiles = function($rootScope, root) {
    var $root = angular.element(root)
      , $container = $root.find('.panel-body')

    config.smiles.forEach(function(smile) {
      var $smile = angular.element('<span></span>&nbsp;')
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