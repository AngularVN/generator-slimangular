/**
 * common Service
 */
angular.module("<%= baseName %>.services", [])

/**
 * [description]
 * unique ID random
 * @return {[string]} UUID
 */
.factory("uniqueIdService", [

	function() {
		var exports, priv;
		priv = {
			maxTries: 5,
			defaultLen: 5,
			history: {},
			generate: function(len) {
				var i, id, possible;
				id = "";
				possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
				i = 0;
				while (i < len) {
					id += possible.charAt(Math.floor(Math.random() * possible.length));
					i++;
				}
				return id;
			}
		};
		exports = {
			generate: function(len) {
				var id, tries;
				if (!len) {
					len = priv.defaultLen;
				}
				id = void 0;
				tries = 0;
				while (true) {
					id = priv.generate(len);
					tries++;
					if (!(priv.history.hasOwnProperty(id) && tries < priv.maxTries)) {
						break;
					}
				}
				if (tries > priv.maxTries) {
					throw new Error("uniqueIdService unable generate a unique ID.");
				}
				priv.history[id] = true;
				return id;
			}
		};
		return exports;
	}
])

/**
 * [User Resource]
 */
.factory("userResource", [
	"$http", "uniqueIdService", "DOMAIN",
	function($http, uniqueIdService, DOMAIN) {
		var exports;
		exports = {
			defaults: {
				group_id: 3,
				role_id: 6,
				status: "pending",
				credential: {
					email: "",
					password: uniqueIdService.generate()
				},
				meta: {
					first_name: "",
					last_name: ""
				},
				register: true
			},
			find: function(params) {
				return $http.get(DOMAIN + "/<%= baseName %>/users", {
					params: params
				});
			},
			login: function(params) {
				return $http.post(DOMAIN + "/<%= baseName %>/auth/login", params);
			},
			create: function(params) {
				return $http.post(DOMAIN + "/<%= baseName %>/users", params);
			},
			getMe: function() {
				return $http.get(DOMAIN + "/<%= baseName %>/users/me");
			},
			get: function(id, params) {
				return $http.get(DOMAIN + "/<%= baseName %>/users/" + id, {
					params: params
				});
			},
			updateMe: function(params) {
				return $http.put(DOMAIN + "/<%= baseName %>/users/me", params);
			},
			update: function(id, params) {
				return $http.put(DOMAIN + "/<%= baseName %>/users/" + id, params);
			},
			"delete": function(id) {
				return $http["delete"](DOMAIN + "/<%= baseName %>/users/" + id);
			}
		};
		return exports;
	}
])

/**
 * [Security Service]
 * @return {[type]}                      [description]
 */
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
])