Whiteboard.Eraser = (function () {
	'use strict';

	var Eraser = function (cfg) {
		this.constructr = Eraser;
		return Whiteboard.Marker.call(this, cfg);
	};

	Eraser.prototype = new Whiteboard.Marker();

	Eraser.prototype.draw = function (x, y) {
		var r = this.cfg.radius;
		var d = r * 2;
		this.context.clearRect(x - r, y - r, d, d);
	};

	return Eraser;
}());