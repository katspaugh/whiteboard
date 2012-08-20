Whiteboard.Figure = (function () {
	'use strict';

	var Figure = function (cfg) {
		this.constructor = Figure;
		this.type = cfg.type;
		this.color = cfg.color;
		this.radius = cfg.radius;
	};

	Figure.prototype = [];

	return Figure;
}());