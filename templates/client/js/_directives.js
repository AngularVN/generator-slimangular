/**
 * common Directives
 */
angular.module("<%= baseName %>.directives", [])

/**
 * [description]
 * [required] jquery maskinput
 * @return {[type]} [description]
 */
.directive("maskinput", function() {
	return {
		restrict: "A",
		link: function(scope, element, attr) {
			element.inputmask();
		}
	};
})

/**
 * [description]
 * Destroy Auth
 */
.directive("logOut", [
	"$location", "securityService", "DEFAULT_ROUTE",
	function($location, securityService, DEFAULT_ROUTE) {
		return function(scope, element, attrs) {
			element.bind("click", function() {
				securityService.destroySession();
				scope.$apply(function() {
					$location.path(DEFAULT_ROUTE);
				});
			});
		};
	}
])

/**
 * [description]
 * Lock Page
 */
.directive("lockPage", [
	"$location", "securityService", "DEFAULT_ROUTE",
	function($location, securityService, DEFAULT_ROUTE) {
		return function(scope, element, attrs) {
			var ref;
			ref = $location.$$url;
			element.bind("click", function() {
				securityService.destroySession();
				scope.$apply(function() {
					$location.path("/user/lock").search({
						ref: ref
					});
				});
			});
		};
	}
])

/**
 * [description]
 * @param  {[type]} link
 * Goto url link
 */
.directive("goClick", [
	"$location",
	function($location) {
		return function(scope, element, attrs) {
			var path;
			path = void 0;
			attrs.$observe("goClick", function(val) {
				path = val;
			});
			return element.bind("click", function() {
				scope.$apply(function() {
					$location.path(path);
				});
			});
		};
	}
])

/**
 * [description]
 * @return {[type]} [description]
 */
.directive("imgOnLoad", function() {
	return {
		restrict: "C",
		link: function(scope, element, attrs) {
			element.bind("load", function(e) {
				element.addClass("loaded");
			});
		}
	};
})

/**
 * [description]
 * imgHolder
 * @return {[type]}                  [description]
 */
.directive('imgHolder', [

	function() {
		return {
			restrict: 'A',
			link: function(scope, ele, attrs) {
				return Holder.run({
					images: ele[0]
				});
			}
		};
	}
])

/**
 * [description]
 * change background
 * @return {[type]} [description]
 */
.directive('customBackground', function() {
	return {
		restrict: "A",
		controller: [
			'$scope', '$element', '$location',
			function($scope, $element, $location) {
				var addBg, path;
				path = function() {
					return $location.path();
				};
				addBg = function(path) {
					$element.removeClass('body-home body-special body-tasks body-lock');
					switch (path) {
						case '/':
							return $element.addClass('body-home');
						case '/404':
						case '/500':
						case '/signin':
						case '/signup':
						case '/forgot':
							return $element.addClass('body-special');
						case '/lock':
							return $element.addClass('body-special body-lock');
						case '/tasks':
							return $element.addClass('body-tasks');
					}
				};
				addBg($location.path());
				return $scope.$watch(path, function(newVal, oldVal) {
					if (newVal === oldVal) {
						return;
					}
					return addBg($location.path());
				});
			}
		]
	};
})

/**
 * [description]
 * UI Color Switch
 * @return {[type]}                   [description]
 */
.directive('uiColorSwitch', [

	function() {
		return {
			restrict: 'A',
			link: function(scope, ele, attrs) {
				return ele.find('.color-option').on('click', function(event) {
					var $this, hrefUrl, style;
					$this = $(this);
					hrefUrl = void 0;
					style = $this.data('style');
					if (style === 'loulou') {
						hrefUrl = 'styles/main.css';
						$('link[href^="styles/main"]').attr('href', hrefUrl);
					} else if (style) {
						style = '-' + style;
						hrefUrl = 'styles/main' + style + '.css';
						$('link[href^="styles/main"]').attr('href', hrefUrl);
					} else {
						return false;
					}
					return event.preventDefault();
				});
			}
		};
	}
])

/**
 * [description]
 * toggleMinNav
 * @return {[type]}                      [description]
 */
.directive('toggleMinNav', [
	'$rootScope',
	function($rootScope) {
		return {
			restrict: 'A',
			link: function(scope, ele, attrs) {
				var $content, $nav, $window, Timer, app, updateClass;
				app = $('#app');
				$window = $(window);
				$nav = $('#nav-container');
				$content = $('#content');
				ele.on('click', function(e) {
					if (app.hasClass('nav-min')) {
						app.removeClass('nav-min');
					} else {
						app.addClass('nav-min');
						$rootScope.$broadcast('minNav:enabled');
					}
					return e.preventDefault();
				});
				Timer = void 0;
				updateClass = function() {
					var width;
					width = $window.width();
					if (width < 768) {
						return app.removeClass('nav-min');
					}
				};
				return $window.resize(function() {
					var t;
					clearTimeout(t);
					return t = setTimeout(updateClass, 300);
				});
			}
		};
	}
])

/**
 * [description]
 * collapse NAV
 * @return {[type]}                 [description]
 */
.directive('collapseNav', [

	function() {
		return {
			restrict: 'A',
			link: function(scope, ele, attrs) {
				var $a, $aRest, $lists, $listsRest, app;
				$lists = ele.find('ul').parent('li');
				$lists.append('<i class="fa fa-caret-right icon-has-ul"></i>');
				$a = $lists.children('a');
				$listsRest = ele.children('li').not($lists);
				$aRest = $listsRest.children('a');
				app = $('#app');
				$a.on('click', function(event) {
					var $parent, $this;
					if (app.hasClass('nav-min')) {
						return false;
					}
					$this = $(this);
					$parent = $this.parent('li');
					$lists.not($parent).removeClass('open').find('ul').slideUp();
					$parent.toggleClass('open').find('ul').slideToggle();
					return event.preventDefault();
				});
				$aRest.on('click', function(event) {
					return $lists.removeClass('open').find('ul').slideUp();
				});
				return scope.$on('minNav:enabled', function(event) {
					return $lists.removeClass('open').find('ul').slideUp();
				});
			}
		};
	}
])

/**
 * [description]
 * highlightActive
 * @return {[type]}                    [description]
 */
.directive('highlightActive', [

	function() {
		return {
			restrict: "A",
			controller: [
				'$scope', '$element', '$attrs', '$location',
				function($scope, $element, $attrs, $location) {
					var highlightActive, links, path;
					links = $element.find('a');
					path = function() {
						return $location.path();
					};
					highlightActive = function(links, path) {
						path = '#' + path;
						return angular.forEach(links, function(link) {
							var $li, $link, href;
							$link = angular.element(link);
							$li = $link.parent('li');
							href = $link.attr('href');
							if ($li.hasClass('active')) {
								$li.removeClass('active');
							}
							if (path.indexOf(href) === 0) {
								return $li.addClass('active');
							}
						});
					};
					highlightActive(links, $location.path());
					return $scope.$watch(path, function(newVal, oldVal) {
						if (newVal === oldVal) {
							return;
						}
						return highlightActive(links, $location.path());
					});
				}
			]
		};
	}
])

/**
 * [description]
 * @return {[type]}       [description]
 */
.directive('toggleOffCanvas', [

	function() {
		return {
			restrict: 'A',
			link: function(scope, ele, attrs) {
				return ele.on('click', function() {
					return $('#app').toggleClass('on-canvas');
				});
			}
		};
	}
])

/**
 * [description]
 * [required]
 * jQuery slim
 *
 * @return {[type]}                  [description]
 */
.directive('slimScroll', [

	function() {
		return {
			restrict: 'A',
			link: function(scope, ele, attrs) {
				return ele.slimScroll({
					height: attrs.scrollHeight || '100%'
				});
			}
		};
	}
])

/**
 * [description]
 * go back
 * @return {[type]}                           [description]
 */
.directive('goBack', [

	function() {
		return {
			restrict: "A",
			controller: [
				'$scope', '$element', '$window',
				function($scope, $element, $window) {
					return $element.on('click', function() {
						return $window.history.back();
					});
				}
			]
		};
	}
])

/**
 * [description]
 * show current time
 * @return {[type]}                            [description]
 */
.directive("myCurrentTime", [
	"$interval", "dateFilter",
	function($interval, dateFilter) {
		return function(scope, element, attrs) {
			var format, stopTime, updateTime;
			updateTime = function() {
				element.text(dateFilter(new Date(), format));
			};
			format = void 0;
			stopTime = void 0;
			scope.$watch(attrs.myCurrentTime, function(value) {
				format = value;
				updateTime();
			});
			stopTime = $interval(updateTime, 1000);
			element.on("$destroy", function() {
				$interval.cancel(stopTime);
			});
		};
	}
]);