
angular.module('<%= baseName %>')
  .factory('resource<%= _.classify(name) %>', ['$resource', function (a) {
    return a('<%= baseName %>/<%= pluralize(name) %>/:id', {}, {
      get: { method: 'GET'},
      update: { method: 'PUT'},
      query: { method: 'GET', isArray: true},
  }]);