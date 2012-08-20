Whiteboard.Marker = (function () {
	'use strict';

	var Marker = function (cfg) {
		this.cfg = cfg || this.Defaults;
		return this.init();
	};

	Marker.prototype.Defaults = {
		color: '#000',
		radius: 10
	};

	Marker.prototype.init = function () {
		this.context = this.cfg.context;
	};

	Marker.prototype.draw = function (figure, radius, color) {
		var len = figure.length;

		if (!len) { return; }

		var r = radius || this.cfg.radius;
		this.context.lineCap = 'round';
		this.context.lineJoin = 'round';
		this.context.fillStyle = color || this.cfg.color;
		this.context.strokeStyle = color || this.cfg.color;
		this.context.lineWidth = r * 2;

		var p = figure[len - 1];
		var x = p[0];
		var y = p[1];

		this.context.beginPath();
		this.context.arc(
			x - r, y - r,
			r, 0, Math.PI * 2, false
		);
		this.context.fill();

		this.context.beginPath();
		this.context.moveTo(x - r, y - r);

		for (var i = len - 2; i >= 0; i -= 1) {
			p = figure[i];
			x = p[0];
			y = p[1];
			this.context.lineTo(x - r, y - r);
		}

		this.context.stroke();
	};

	return Marker;
}());