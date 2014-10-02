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
])

/**
 * [description]
 * SigninCtrl
 * @return {[type]}                 [description]
 */
.controller("SigninCtrl", [
	"$scope", "$rootScope", "$location", "userResource", "securityService", "DEFAULT_ROUTE", "REQUIRE_AUTH",
	function($scope, $rootScope, $location, userResource, securityService, DEFAULT_ROUTE, REQUIRE_AUTH) {
		$scope.username = "admin@example.com";
		$scope.password = "password";
		$scope.submit = function() {
			$scope.form.$setDirty();
			if ($scope.form.$valid) {
				userResource.login({
					username: $scope.username,
					password: $scope.password
				}).success(function(payload) {
					var path;
					securityService.init(payload);
					$rootScope.$broadcast("success", "Welcome!");
					if ($rootScope.isPath && $rootScope.isPath !== REQUIRE_AUTH) {
						path = $rootScope.isPath;
					} else {
						path = DEFAULT_ROUTE;
					}
					$location.path(path);
				});
			}
		};
	}
])

/**
 * [description]
 * SignupCtrl
 * @return {[type]}                 [description]
 */
.controller("SignupCtrl", [
	"$scope", "$rootScope", "$location", "userResource", "securityService", "DEFAULT_ROUTE",
	function($scope, $rootScope, $location, userResource, authResource, securityService, DEFAULT_ROUTE) {
		$scope.user = userResource.defaults;
		$scope.submit = function() {
			$scope.form.$setDirty();
			if ($scope.form.$valid) {
				userResource.register($scope.user).success(function(payload) {
					securityService.init(payload);
					$rootScope.$broadcast("success", "Welcome!");
					$location.path(DEFAULT_ROUTE);
				});
			} else {
				$rootScope.$broadcast("danger", "Error: Form Require!");
				return;
			}
		};
	}
])

/**
 * [description]
 * PasswordCtrl
 *
 * @return {[type]}                 [description]
 */
.controller("PasswordCtrl", [
	"$rootScope", "$scope", "$location", "userResource", "securityService", "REQUIRE_AUTH",
	function($rootScope, $scope, $location, userResource, securityService, REQUIRE_AUTH) {
		$scope.currentUser = securityService.requestCurrentUser();
		if (securityService.isAuthenticated()) {
			userResource.getMe().success(function(payload) {
				$scope.user = payload;
			});
		} else {
			$rootScope.$broadcast("danger", "Error: You must login again!");
			$location.path(REQUIRE_AUTH);
			return;
		}
		$scope.save = function() {
			$scope.form.$setDirty();
			if ($scope.form.$valid) {
				if ($scope.user.id) {
					userResource.updateMe($scope.user).success(function(payload) {
						$rootScope.$broadcast("success", "User has been changed password successfully!");
					});
				} else {
					$rootScope.$broadcast("danger", "Error: User is not found!");
					return;
				}
			} else {
				$rootScope.$broadcast("danger", "Error: Not changed password!");
				return;
			}
		};
	}
]);