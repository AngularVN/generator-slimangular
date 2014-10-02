'use strict';

angular.module('<%= baseName %>')
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/<%= pluralize(name) %>', {
        templateUrl: 'views/<%= name %>/<%= pluralize(name) %>.html',
        controller: '<%= _.classify(name) %>Ctrl',
        resolve:{
          resolved<%= _.classify(name) %>: ['<%= _.classify(name) %>', function (<%= _.classify(name) %>) {
            return <%= _.classify(name) %>.search({});
          }]
        }
      })
    }]);
