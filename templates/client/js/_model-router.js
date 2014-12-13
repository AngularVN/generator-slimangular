'use strict';

angular.module('<%= baseName %>').config(['$routeProvider',
  function(a) {
    a.when('/<%= pluralize(name) %>', {
      templateUrl: 'views/<%= name %>/<%= pluralize(name) %>.html',
      controller: '<%= _.classify(name) %>Ctrl',
      resolve: {
        resolved<%= _.classify(name) %>: ['<%= _.classify(name) %>', function(b) {
          return b.search({});
        }]
      }
    })
  }
]);