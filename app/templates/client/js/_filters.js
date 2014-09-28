/**
 * common Filter
 */
angular.module("<%= baseName %>.filters", [])

/**
 * [description]
 * @param  {[type]} $sce)
 * @return {[type]} [description]
 */
.filter("unsafe", [
	"$sce",
	function($sce) {
		return function(val) {
			return $sce.trustAsHtml(val);
		};
	}
])

/**
 * [example]
 * <img ng-src="url | getAvatar" alt=""/>
 * @return {[url]} [return url avatar]
 */
.filter("getAvatar", function() {
	return function(a) {
		if (!a) {
			a = "img/avatar.jpg";
		}
		return a;
	};
})

/**
 * [age for birthday]
 * @return {[int]} age
 */
.filter("age", function() {
	return function(arg) {
		var today;
		if (parseInt(arg)) {
			today = new Date();
			return parseInt(today.getFullYear() - parseInt(arg));
		}
		return arg;
	};
})

/**
 * [description]
 * @return {[type]} [description]
 */
.filter("fixbr", function() {
	return function(arg) {
		if (arg) {
			return arg.replace(/&lt;br(.*?)\/&gt;/g, "<br />");
		}
	};
})

/**
 * [description]
 * chunk characters
 * @return {[type]} [description]
 */
.filter("characters", function() {
	return function(input, chars, breakOnWord) {
		var lastspace;
		if (isNaN(chars)) {
			return input;
		}
		if (chars <= 0) {
			return "";
		}
		if (input && input.length >= chars) {
			input = input.substring(0, chars);
			if (!breakOnWord) {
				lastspace = input.lastIndexOf(" ");
				if (lastspace !== -1) {
					input = input.substr(0, lastspace);
				}
			} else {
				while (input.charAt(input.length - 1) === " ") {
					input = input.substr(0, input.length - 1);
				}
			}
			return input + "...";
		}
		return input;
	};
})

/**
 * [description]
 * chunk words
 * @return {[type]} [description]
 */
.filter("words", function() {
	return function(input, words) {
		var inputWords;
		if (isNaN(words)) {
			return input;
		}
		if (words <= 0) {
			return "";
		}
		if (input) {
			inputWords = input.split(/\s+/);
			if (inputWords.length > words) {
				input = inputWords.slice(0, words).join(" ") + "...";
			}
		}
		return input;
	};
})

/**
 * [description]
 * Time ago
 * @return {[type]} [description]
 */
.filter("timeago", function() {
	return function(time, local, raw) {
		var DAY, DECADE, HOUR, MINUTE, MONTH, WEEK, YEAR, offset, span;
		if (!time) {
			return "never";
		}
		if (!local) {
			local = Date.now();
		}
		if (angular.isDate(time)) {
			time = time.getTime();
		} else {
			if (typeof time === "string") {
				time = new Date(time).getTime();
			}
		}
		if (angular.isDate(local)) {
			local = local.getTime();
		} else {
			if (typeof local === "string") {
				local = new Date(local).getTime();
			}
		}
		if (typeof time !== "number" || typeof local !== "number") {
			return;
		}
		offset = Math.abs((local - time) / 1000);
		span = [];
		MINUTE = 60;
		HOUR = 3600;
		DAY = 86400;
		WEEK = 604800;
		MONTH = 2629744;
		YEAR = 31556926;
		DECADE = 315569260;
		if (offset <= MINUTE) {
			span = ["", (raw ? "now" : "less than a minute")];
		} else if (offset < (MINUTE * 60)) {
			span = [Math.round(Math.abs(offset / MINUTE)), "min"];
		} else if (offset < (HOUR * 24)) {
			span = [Math.round(Math.abs(offset / HOUR)), "hr"];
		} else if (offset < (DAY * 7)) {
			span = [Math.round(Math.abs(offset / DAY)), "day"];
		} else if (offset < (WEEK * 52)) {
			span = [Math.round(Math.abs(offset / WEEK)), "week"];
		} else if (offset < (YEAR * 10)) {
			span = [Math.round(Math.abs(offset / YEAR)), "year"];
		} else if (offset < (DECADE * 100)) {
			span = [Math.round(Math.abs(offset / DECADE)), "decade"];
		} else {
			span = ["", "a long time"];
		}
		span[1] += (span[0] === 0 || span[0] > 1 ? "s" : "");
		span = span.join(" ");
		if (raw === true) {
			return span;
		}
		if (time <= local) {
			return span + " ago";
		} else {
			return "in " + span;
		}
	};
});