'use strict';

angular.module('<%= baseName %>')
	.controller('<%= _.classify(name) %>Ctrl', ['$scope', '$modal', 'resolved<%= _.classify(name) %>', '<%= _.classify(name) %>',
		function ($scope, $modal, resolved<%= _.classify(name) %>, <%= _.classify(name) %>) {

			$scope.<%= pluralize(name) %> = resolved<%= _.classify(name) %>;

			$scope.create = function () {
				$scope.clear();
				$scope.open();
			};

			$scope.update = function (id) {
				$scope.<%= name %> = <%= _.classify(name) %>.get({id: id});
				$scope.open(id);
			};

			$scope.delete = function (id) {
				<%= _.classify(name) %>.delete({id: id},
					function () {
						$scope.<%= pluralize(name) %> = <%= _.classify(name) %>.search();
					});
			};

			$scope.save = function (id) {
				if (id) {
					<%= _.classify(name) %>.update({id: id}, $scope.<%= name %>,
						function () {
							$scope.<%= pluralize(name) %> = <%= _.classify(name) %>.search();
							$scope.clear();
						});
				} else {
					<%= _.classify(name) %>.save($scope.<%= name %>,
						function () {
							$scope.<%= pluralize(name) %> = <%= _.classify(name) %>.search();
							$scope.clear();
						});
				}
			};

			$scope.clear = function () {
				$scope.<%= name %> = <%= _.classify(name) %>.default;
			};

			$scope.open = function (id) {
				var <%= name %>Save = $modal.open({
					templateUrl: 'views/<%= name %>/<%= name %>-modal.html',
					controller: <%= _.classify(name) %>SaveCtrl,
					resolve: {
						<%= name %>: function () {
							return $scope.<%= name %>;
						}
					}
				});

		<%= name %> Save.result.then(function(entity) {
			$scope.<%= name %> = entity;
			$scope.save(id);
		});
	};
}]);

var <%= _.classify(name) %> SaveCtrl =
	function($scope, $modalInstance, <%= name %> ) {
		$scope.<%= name %> = <%= name %> ;
		<% _.each(attrs, function(attr) {
		if (attr.attrType === 'Date') { %>
				$scope.<%= attr.attrName %> DateOptions = {
					dateFormat: 'yy-mm-dd',
					<% if (attr.dateConstraint === 'Past') { %> maxDate: -1 <% } %>
					<% if (attr.dateConstraint === 'Future') { %> minDate: 1 <% } %>
				}; <% }
		}); %>
		$scope.submit = function() {
			$modalInstance.close($scope.<%= name %> );
		};

		$scope.dismiss = function() {
			$modalInstance.dismiss('dismiss');
		};
};