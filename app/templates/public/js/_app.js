// Declare app level module which depends on filters, and services
angular.module('<%= baseName %>', ['ngResource', 'ngRoute', 'ngCookies', 'ui.bootstrap', 'ui.date'])
	.constant("DOMAIN", "")
	.constant("API_KEY", "1234567890")
	.constant("SESSION_COOKIE_NAME", "session")
	.constant("DELAY", 5000)
	.constant("DEFAULT_ROUTE", "/")
	.constant("REQUIRE_AUTH", "/user/signin")
	.constant("VERSION", "© 2014 beesightsoft.com")
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
						if (response.headers()["content-type"] === "application/json; charset=utf-8" || response.headers()["content-type"] === "application/json") {
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
									if (currentPath !== "/user/signout" && $location.path() !== "/user/signin" && $location.path() !== "/user/signup") {
										ref = $location.$$url;
										$location.path("/user/signout").search({
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
	]).config([
		"$compileProvider",
		function($compileProvider) {
			return $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto|tel|sms):/);
		}
	]).run([
		"$rootScope", "$location", "securityService", "REQUIRE_AUTH",
		function($rootScope, $location, securityService, REQUIRE_AUTH) {
			var skipAuth;
			skipAuth = ["/user/signin", "/user/signout", "/user/lock"];
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
	]).config(['$routeProvider',
		function($routeProvider) {
			$routeProvider
				.when('/', {
					templateUrl: 'views/home/home.html',
					controller: 'HomeCtrl'
				})
				.otherwise({
					redirectTo: '/'
				});
		}
	])
	.controller('AppCtrl', [
		'$scope', '$location',
		function($scope, $location) {
			$scope.isHide = function() {
				var path;
				path = $location.path();
				return _.contains([
						'/404',
						'/500',
						'/user/lock',
						'/user/signin',
						'/user/signup',
						'/user/forgot'
					],
					path);
			};
			return $scope.main = {
				brand: 'Slim Management',
				name: 'Admin'
			};
		}
	]).controller('NavCtrl', [
		'$scope',
		function($scope) {
			return
		}
	])
	.factory("userResource", [
		"$http", "DOMAIN",
		function($http, DOMAIN) {
			var exports;
			exports = {
				defaults: {
					group_id: 3,
					role_id: 6,
					status: "pending",
					credential: {
						email: "",
						password: ""
					},
					meta: {
						first_name: "",
						last_name: ""
					},
					register: true
				},
				find: function(params) {
					return $http.get(DOMAIN + "/api/users", {
						params: params
					});
				},
				create: function(params) {
					return $http.post(DOMAIN + "/api/users", params);
				},
				getMe: function() {
					return $http.get(DOMAIN + "/api/users/me");
				},
				get: function(id, params) {
					return $http.get(DOMAIN + "/api/users/" + id, {
						params: params
					});
				},
				updateMe: function(params) {
					return $http.put(DOMAIN + "/api/users/me", params);
				},
				update: function(id, params) {
					return $http.put(DOMAIN + "/api/users/" + id, params);
				},
				"delete": function(id) {
					return $http["delete"](DOMAIN + "/api/users/" + id);
				}
			};
			return exports;
		}
	])
	.factory("securityService", [
		"userResource", "$http", "$cookieStore", "$rootScope", "SESSION_COOKIE_NAME",
		function(userResource, $http, $cookieStore, $rootScope, SESSION_COOKIE_NAME) {
			var exports, priv;
			priv = {
				session: null,
				currentUser: null,
				requestSent: false
			};
			exports = {
				init: function(session) {
					var authorization;
					priv.requestSent = false;
					if (!session) {
						if ($cookieStore.get(SESSION_COOKIE_NAME)) {
							session = angular.fromJson($cookieStore.get(SESSION_COOKIE_NAME)) || null;
						}
					} else {
						$cookieStore.put(SESSION_COOKIE_NAME, angular.toJson(session));
					}
					priv.session = session;
					if (priv.session && priv.session.id) {
						authorization = priv.session.id;
					}
					$http.defaults.headers.common["Authorization"] = authorization;
				},
				isAuthenticated: function() {
					return !!priv.session || !!priv.currentUser;
				},
				getSession: function() {
					return priv.session;
				},
				requestCurrentUser: function() {
					if (!priv.requestSent) {
						priv.requestSent = true;
						userResource.getMe().success(function(payload) {
							priv.currentUser = payload;
							$rootScope.$broadcast("authChange");
						});
					}
					return priv.currentUser;
				},
				setUser: function(user) {
					priv.currentUser = user;
				},
				destroySession: function() {
					priv.session = null;
					priv.currentUser = null;
					priv.requestSent = false;
					$cookieStore.remove(SESSION_COOKIE_NAME);
					$http.defaults.headers.common["Authorization"] = "";
					$rootScope.$broadcast("authChange");
				}
			};
			return exports;
		}
	]);