Whiteboard.Drawer = (function () {
	'use strict';

	var Drawer = function (cfg) {
		this.cfg = cfg || this.Defaults;
		return this.init();
	};

	Drawer.prototype.Defaults = {
		renderTo: 'body'
	};

	Drawer.prototype.init = function () {
		var selector = this.cfg.renderTo || this.Defaults.renderTo;
		this.container = document.querySelector(selector);

		if (!this.container) {
			console.error('No container with selector "%s"', selector);
			return;
		}

		this.width = this.container.clientWidth;
		this.height = this.container.clientHeight;
		this.contPos = this.container.getBoundingClientRect();

		this.canvas = document.createElement('canvas');
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.container.appendChild(this.canvas);

		this.context = this.canvas.getContext('2d');
	};

	Drawer.prototype.drawPng = function (pngUrl) {
		var my = this;
		var img = new Image();
		img.addEventListener('load', function () {
			my.reset();
			my.context.drawImage(img, 0, 0);
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
		return new Whiteboard.Figure(cfg);
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

	Drawer.prototype.putData = function (data) {
		return this.context.putImageData(data, 0, 0);
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
			var p = figure[i];
			var x = p[0];
			var y = p[1];
			this.context.clearRect(x - r, y - r, d, d);
		}
	};

	return Drawer;
}());
