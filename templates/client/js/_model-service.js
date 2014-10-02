'use strict';

angular.module('<%= baseName %>')
.factory("<%= _.classify(name) %>", [
	"$http", "DOMAIN",
	function($http, DOMAIN) {
		return {
			"default": {
			 	<% _.each(attrs, function (attr) { %>"<%= attr.attrName.replace(" ", "_").toLowerCase() %>": "",
      			<% }); %>"id": ""
			},
			create: function(params) {
				return $http.post(DOMAIN + "/<%= baseName %>/<%= pluralize(name) %>", params);
			},
			get: function(id, params) {
				return $http.get(DOMAIN + "/<%= baseName %>/<%= pluralize(name) %>/" + id, {params: params});
			},
			update: function(id, params) {
				return $http.put(DOMAIN + "/<%= baseName %>/<%= pluralize(name) %>/" + id, params);
			},
			"delete": function(id) {
				return $http["delete"](DOMAIN + "/<%= baseName %>/<%= pluralize(name) %>/" + id);
			},
			search: function(params) {
				return $http.get(DOMAIN + "/<%= baseName %>/<%= pluralize(name) %>", {params: params});
			}
		};
	}
]);