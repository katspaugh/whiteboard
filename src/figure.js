Whiteboard.Figure = (function () {
	'use strict';

	var Figure = function (cfg) {
		this.constructor = Figure;
		this.type = cfg.type;
		this.color = cfg.color;
		this.radius = cfg.radius;
		this.data = [];
	};

	Figure.prototype.push = function (point) {
		return this.data.push(point);
	};

	return Figure;
}());