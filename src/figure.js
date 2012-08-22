(function (NS) {
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

	if (NS.module) {
		NS.module.exports = Figure;
	} else {
		NS.Figure = Figure;
	}
}(this.Whiteboard || this));
