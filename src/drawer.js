(function (NS) {
	'use strict';

	var Drawer = function (cfg) {
		this.cfg = cfg || {};
		return this._init();
	};

	Drawer.prototype._init = function () {
		this.width = this.cfg.width;
		this.height = this.cfg.height;

		if (this.cfg.renderTo) {
			if (this.cfg.renderTo instanceof HTMLElement) {
				this.container = this.cfg.renderTo;
			} else {
				this.container = document.querySelector(
					String(this.cfg.renderTo)
				);
			}

			this.contPos = this.container.getBoundingClientRect();

			if (!this.width) {
				this.width = this.container.clientWidth;
			}
			if (!this.height) {
				this.height =  this.container.clientHeight;
			}
		} else {
			this.contPos = {
				left: 0,
				top: 0
			};
		}

		this.canvas = this.createCanvas(this.width, this.height);
		this.context = this.canvas.getContext('2d');

		if (this.container) {
			this.container.appendChild(this.canvas);
		}
	};

	Drawer.prototype.createCanvas = function (w, h) {
		var canvas;

		// HTML5 Canvas
		if ('undefined' != typeof document) {
			canvas = document.createElement('canvas');
			canvas.width = w;
			canvas.height = h;
		// node-canvas
		} else if ('undefined' !== typeof Canvas) {
			canvas = new Canvas(w, h);
		}

		return canvas;
	};

	Drawer.prototype.drawUnder = function (img) {
		var ctx = this.context;
		var prevMode = ctx.globalCompositeOperation;
		ctx.globalCompositeOperation = 'destination-over';
		ctx.drawImage(img, 0, 0);
		ctx.globalCompositeOperation = prevMode;
	};

	Drawer.prototype.drawPng = function (pngUrl) {
		var my = this;
		var img = new Image;

		img.addEventListener('load', function () {
			my.drawUnder(this);
		}, false);

		img.src = pngUrl;
	};

	Drawer.prototype.drawFigure = function (figure, offset) {
		var methodName = figure.type;
		if (methodName in this) {
			this[methodName](figure, offset);
		}
	};

	Drawer.prototype.createFigure = function (cfg) {
		return new NS.Figure(cfg);
	};

	Drawer.prototype.reset = function () {
		this.canvas.getContext('2d').clearRect(
			0, 0, this.width, this.height
		);
	};

	Drawer.prototype.getData = function () {
		return this.context.getImageData(
			0, 0, this.width, this.height
		);
	};

	Drawer.prototype.putData = function (data, x, y) {
		return this.context.putImageData(data, x || 0, y || 0);
	};

	Drawer.prototype.resize = function (w, h) {
		var data;

		if (null != w && this.width != w) {
			data = this.getData();
			this.width = this.canvas.width = w;
		}

		if (null != h && this.height != h) {
			data = this.getData();
			this.height = this.canvas.height = h;
		}

		if (data) {
			this.putData(data);
		}
	};

	Drawer.prototype.marker = function (figure, offset) {
		var data = figure.data;
		if (offset) {
			data = data.slice(data.length - offset);
		}

		var len = data.length;

		if (!len) { return; }

		var r = figure.radius;
		this.context.lineCap = 'round';
		this.context.lineJoin = 'round';
		this.context.fillStyle = figure.color;
		this.context.strokeStyle = figure.color;
		this.context.lineWidth = r * 2;

		var p = data[len - 1];
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
			p = data[i];
			x = p[0];
			y = p[1];
			this.context.lineTo(x - r, y - r);
		}

		this.context.stroke();
	};

	Drawer.prototype.eraser = function (figure, offset) {
		var r = figure.radius;
		var d = r * 2;
		var data = figure.data;

		if (offset) {
			data = data.slice(data.length - offset);
		}

		for (var i = data.length - 1; i >= 0; i -= 1) {
			var p = data[i];
			var x = p[0];
			var y = p[1];
			this.context.clearRect(x - r, y - r, d, d);
		}
	};

	Drawer.prototype.updateContPos = function () {
		if (this.container) {
			this.contPos = this.container.getBoundingClientRect();
		}
	};

	if (NS.module) {
		NS.module.exports = Drawer;
	} else {
		NS.Drawer = Drawer;
	}
}(this.Whiteboard || this));
