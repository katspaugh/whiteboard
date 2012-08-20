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

	Marker.prototype.draw = function (figure) {
		var len = figure.length;

		if (!len) { return; }

		var r = this.cfg.radius;
		this.context.lineWidth = r * 2;
		this.context.fillStyle = this.cfg.color;
		this.context.strokeStyle = this.cfg.color;

		for (var i = len - 1, j = len - 2; j >= 0; i -= 1, j -= 1) {
			var p1 = figure[i];
			var p2 = figure[j];

			var x1 = p1[0];
			var y1 = p1[1];

			this.context.beginPath();
			this.context.arc( 
				x1 - r, y1 - r,
				r, 0, Math.PI * 2, false
			);
			this.context.closePath();

			if (p2) {
				var x2 = p2[0];
				var y2 = p2[1];

				this.context.beginPath();
				this.context.moveTo(x1 - r, y1 - r);
				this.context.lineTo(x2 - r, y2 - r);
				this.context.closePath();
				this.context.stroke();

				// last point
				if (j == 0) {
					this.context.beginPath();
					this.context.arc(
						x2 - r, y2 - r,
						r, 0, Math.PI * 2, false
					);
					this.context.closePath();
				}
			}
		}

		this.context.fill();
	};

	return Marker;
}());