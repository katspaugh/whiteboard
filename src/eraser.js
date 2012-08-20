Whiteboard.Eraser = (function () {
	'use strict';

	var Eraser = function (cfg) {
		this.constructr = Eraser;
		return Whiteboard.Marker.call(this, cfg);
	};

	Eraser.prototype = new Whiteboard.Marker();

	Eraser.prototype.draw = function (figure) {
		var r = this.cfg.radius;
		var d = r * 2;

		for (var i = figure.length - 1; i >= 0; i -= 1) {
			var p = figure[i];
			var x = p[0];
			var y = p[1];
			this.context.clearRect(x - r, y - r, d, d);
		}
	};

	return Eraser;
}());