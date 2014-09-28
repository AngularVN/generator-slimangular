/**
 * common Controller
 */
angular.module("<%= baseName %>.controllers", [])
/**
 * [description]
 * AppCtrl
 */
.controller('AppCtrl', [
	'$scope', '$location',
	function($scope, $location) {
		$scope.isHide = function() {
			var path;
			path = $location.path();
			return _.contains(['/404', '/500', '/lock', '/signin', '/signup', '/forgot'], path);
		};
		return $scope.main = {
			brand: 'SlimAngular Management',
			name: 'Admin'
		};
	}
])

/**
 * [description]
 * NavCtrl
 */
.controller('NavCtrl', [
	'$scope',
	function($scope) {

		return;
	}
])

/**
 * [description]
 * HeaderCtrl
 */
.controller("HeaderCtrl", [
	"$scope", "$rootScope", "$location", "$interval", "securityService",
	function($scope, $rootScope, $location, $interval, securityService) {
		$scope.isAuthenticated = securityService.isAuthenticated();
		$scope.isActive = function(routePattern) {
			if ((new RegExp("^" + routePattern + ".*")).test($location.path())) {
				return true;
			}
			return false;
		};
		$scope.isAdmin = function() {
			if ($scope.isAuthenticated) {
				if ($scope.user.group.name === "admin") {
					return true;
				}
			}
			return false;
		};
		$scope.$on("authChange", function(event) {
			$scope.isAuthenticated = securityService.isAuthenticated();
			if ($scope.isAuthenticated) {
				$scope.user = securityService.requestCurrentUser();
			} else {
				$scope.user = null;
			}
		});
	}
])

/**
 * [description]
 * Message Flash
 */
.controller("FlashCtrl", [
	"$scope", "$location", "$rootScope", "DELAY", "uniqueIdService", "$sce",
	function($scope, $location, $rootScope, DELAY, uniqueIdService, $sce) {
		$scope.messages = {};
		$scope.$on("success", function(event, msg) {
			var id;
			id = uniqueIdService.generate();
			$scope.messages[id] = {
				"class": "alert-success",
				msg: $sce.trustAsHtml(msg)
			};
			setTimeout((function() {
				$scope.close(id);
			}), DELAY);
		});
		$scope.$on("notify", function(event, msg) {
			var id;
			id = uniqueIdService.generate();
			$scope.messages[id] = {
				"class": "alert-info",
				msg: $sce.trustAsHtml(msg)
			};
			setTimeout((function() {
				$scope.close(id);
			}), DELAY);
		});
		$scope.$on("warning", function(event, msg) {
			var id;
			id = uniqueIdService.generate();
			$scope.messages[id] = {
				"class": "alert-warning",
				msg: $sce.trustAsHtml(msg)
			};
			setTimeout((function() {
				$scope.close(id);
			}), DELAY);
		});
		$scope.$on("error", function(event, msg) {
			var id;
			id = uniqueIdService.generate();
			$scope.messages[id] = {
				"class": "alert-danger",
				msg: $sce.trustAsHtml(msg)
			};
			setTimeout((function() {
				$scope.close(id);
			}), DELAY);
		});
		$scope.close = function(id) {
			if ($scope.messages.hasOwnProperty(id)) {
				delete $scope.messages[id];
			}
		};
	}
]);