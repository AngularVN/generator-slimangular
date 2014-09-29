// Declare app level module which depends on filters, and services
angular.module('<%= baseName %>', [
	'ngResource',
	'ngRoute',
	'ngCookies',
	"<%= baseName %>.filters",
	"<%= baseName %>.services",
	"<%= baseName %>.directives",
	"<%= baseName %>.controllers",
	'ui.bootstrap',
	'ui.date'
])
	.constant("DOMAIN", "")
	.constant("API_KEY", "1234567890")
	.constant("SESSION_COOKIE_NAME", "session")
	.constant("DELAY", 5000)
	.constant("DEFAULT_ROUTE", "/")
	.constant("REQUIRE_AUTH", "/signin")
	.constant("VERSION", "© 2014 beesightsoft.com")

/**
 * [description]
 */
.config([
	"$httpProvider",
	function($httpProvider) {
		$httpProvider.defaults.headers.common = {
			"Accept": "application/json, text/plain, */*",
			"Content-Type": "application/json;charset=utf-8",
			"X-Requested-With": "XMLHttpRequest"
		};
		return $httpProvider.responseInterceptors.push(function($q, $location, $rootScope, DEFAULT_ROUTE) {
			return function(promise) {
				return promise.then((function(response) {
					var currentPath, payloadData, ref;
					if (response.headers()["content-type"] === "application/json; charset=utf-8" || response.headers()["content-type"] === "application/json" || response.headers()["content-type"] === "text/html") {
						if (response.data.code === 200 || response.data.code === 302) {
							payloadData = response.data.payload;
							response.data = payloadData;
							return response;
						} else {
							if (response.data.code === 400) {
								$rootScope.$broadcast("error", response.data.message || "Error. Bad Request.");
							} else if (response.data.code === 401) {
								$rootScope.$broadcast('error', response.data.message || 'Error. Unauthorized');
								currentPath = $location.path();
								if (currentPath !== "/signout" && $location.path() !== "/signin" && $location.path() !== "/signup") {
									ref = $location.$$url;
									$location.path("/signout").search({
										ref: ref
									});
								}
							} else if (response.data.code === 403) {
								if ($location.path() !== DEFAULT_ROUTE) {
									$rootScope.$broadcast("error", response.data.message || "Error. Forbidden.");
									$location.path(DEFAULT_ROUTE);
								}
							} else if (response.data.code === 404) {
								if ($location.path() !== DEFAULT_ROUTE) {
									$rootScope.$broadcast("error", response.data.message || "Error. Not Found.");
									$location.path(DEFAULT_ROUTE);
								}
							} else {
								$rootScope.$broadcast("error", response.data.message || "Error. Server is having a problem");
							}
							return $q.reject(response);
						}
					}
					return response;
				}), function(response) {
					$rootScope.$broadcast("error", "Error. Your connection is having a problem");
					return $q.reject(response);
				});
			};
		});
	}
])

/**
 * [description]
 * @return {[type]}                   [description]
 */
.config([
	"$compileProvider",
	function($compileProvider) {
		return $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto|tel|sms):/);
	}
])

/**
 * [description]
 * @return {[type]}                               [description]
 */
.run([
	"$rootScope", "$location", "securityService", "REQUIRE_AUTH",
	function($rootScope, $location, securityService, REQUIRE_AUTH) {
		var skipAuth;
		skipAuth = ["/signin", "/signout", "/lock"];
		$rootScope.isPath = null;
		securityService.init();
		return $rootScope.$on("$routeChangeStart", function(event, next, current) {
			var isAuthenticated, query;
			isAuthenticated = void 0;
			query = void 0;
			$rootScope.isPath = $location.path();
			isAuthenticated = securityService.isAuthenticated();
			if (isAuthenticated) {
				query = $location.search();
				if (query.ref) {
					$location.search({}).path(query.ref);
				}
			} else {
				if (!_(skipAuth).contains($rootScope.isPath)) {
					$location.path(REQUIRE_AUTH);
				}
			}
		});
	}
])


/**
 * route homepage
 */
.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'views/home/home.html',
				controller: 'HomeCtrl'
			})
			.when('/signin', {
				templateUrl: 'views/signin.html',
			})
			.when("/signout", {
				resolve: resolve = {
					logout: function($location, securityService) {
						securityService.destroySession();
						$location.path("/signin");
					}
				}
			})
			.otherwise({
				redirectTo: '/'
			});
	}
]);