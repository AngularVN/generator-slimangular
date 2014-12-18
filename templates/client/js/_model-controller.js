angular.module('<%= baseName %>')
  .controller('<%= _.classify(name) %>Ctrl', ['$scope', '$modal', 'PERPAGE', 'resolved<%= _.classify(name) %>', 'resource<%= _.classify(name) %>',
    function($scope, $modal, PERPAGE, resolved<%= _.classify(name) %>, resource<%= _.classify(name) %> ){
      $scope.perpage = PERPAGE;
      $scope.limit = 0;
      $scope.q = $scope.sort = $scope.order = '';
      $scope.items = resolved<%= _.classify(name) %>;

      $scope.create = function(){
        $scope.clear();
        $scope.open();
      };

      $scope.update = function(id){
        $scope.<%= name %> = resource<%= _.classify(name) %>.get({
          id: id
        });
        $scope.open(id);
      };

      $scope.delete = function(id){
        var x = confirm('Are you sure you want to delete <%= _.classify(name) %>?');
        if (x) {
          resource<%= _.classify(name) %>.delete({
            id: id
          }, function(){
            $scope.items = resource<%= _.classify(name) %>.query();
          });
        }        
      };

      $scope.save = function(id){
        if (id){ resource<%= _.classify(name) %>.update({
            id: id
          }, $scope.<%= name %> ,
          function(){
            $scope.items = resource<%= _.classify(name) %>.query();
            $scope.clear();
          });
        } else { resource<%= _.classify(name) %>.save($scope.<%= name %> ,
          function(){
            $scope.items = resource<%= _.classify(name) %>.query();
            $scope.clear();
          });
        }
      };

      $scope.clear = function(){
        $scope.<%= name %> = {<% _.each(attrs, function(attr){ %> '<%= _.underscored(attr.attrName) %>': '',<%}); %> id: ''};
      };

      $scope.open = function(id){
        var modal = $modal.open({
          templateUrl: 'views/<%= name %>/<%= name %>-modal.html',
          controller: <%= _.classify(name) %>SaveCtrl,
          resolve: { <%= name %> : function(){ return $scope.<%= name %>;}}
        });

        modal.result.then(function(entity){
          $scope.<%= name %> = entity;
          $scope.save(id);
        });
      };

      $scope.show = function(limit){
        $scope.limit = limit;
        $scope.items = resource<%= _.classify(name) %>.query({
          limit: limit,
          q: $scope.q || ''
        });
      };

      $scope.page = function(page){
        $scope.items = resource<%= _.classify(name) %>.query({
          page: page,
          limit: $scope.limit || 20,
          q: $scope.q || ''
        });
      };

      $scope.search = function(){
        $scope.items = resource<%= _.classify(name) %>.query({
          page: 1,
          limit: $scope.limit || 20,
          q: $scope.q || ''
        });
      };
    }
  ]);

var <%= _.classify(name) %>SaveCtrl = function($scope, $modalInstance, <%= name %>){
  $scope.<%= name %> = <%= name %>;
  $scope.submit = function(){
    $modalInstance.close($scope.<%= name %>);
  };
  $scope.dismiss = function(){
    $modalInstance.dismiss('dismiss');
  };
};