var Whiteboard = (function () {
	'use strict';

	var Whiteboard = function (cfg) {
		this.cfg = cfg || this.Defaults;
		return this.init();
	};

	Whiteboard.prototype.Defaults = {
		renderTo: 'body'
	};

	Whiteboard.prototype.init = function () {
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

		this.socket = this.createSocket();

		this.tools = {
			marker: this.createMarker(),
			eraser: this.createEraser()
		};

		this.bindEvents(this);
	};

	Whiteboard.prototype.createSocket = function () {
		var my = this;
		var socket = io.connect(this.cfg.server);

		socket.on('figure', function (figure) {
			my.drawFigure(figure);
		});

		return socket;
	};

	Whiteboard.prototype.sendFigure = function (figure) {
		console.dir(figure);
		this.socket.emit('figure', figure);
	};

	Whiteboard.prototype.drawFigure = function (figure) {
		var tool = this.tools[figure.type];
		figure.forEach(function (point) {
			tool.draw.apply(tool, point);
		});
	};

	Whiteboard.prototype.createMarker = function (cfg) {
		return new Whiteboard.Marker({
			context: this.context,
			color: 'red',
			radius: 8
		});
	};

	Whiteboard.prototype.createEraser = function (cfg) {
		return new Whiteboard.Eraser({
			context: this.context,
			radius: 30
		});
	};

	Whiteboard.prototype.createFigure = function (type) {
		var toolCfg = this.tools[type].cfg;
		var figure = [];
		figure.type = type;
		figure.radius = toolCfg.radius;
		figure.color = toolCfg.color;
		return figure;
	};

	Whiteboard.prototype.bindEvents = function (my) {
		var listeners = {
			mousedown: 'onMouseDown',
			mouseup:   'onMouseUp',
			mousemove: 'onMouseMove'
		};

		Object.keys(listeners).forEach(function (eventType) {
			var fnName = listeners[eventType];
			my.container.addEventListener(eventType, function (e) {
				return my[fnName](e);
			}, false);
		});
	};

	Whiteboard.prototype.onMouseDown = function (e) {
		this.isMouseDown = true;
		this.isShiftPressed = e.shiftKey;

		this.figure = this.createFigure(e.shiftKey ? 'eraser' : 'marker');

		this.onMouseMove(e);
	};

	Whiteboard.prototype.onMouseUp = function (e) {
		e.preventDefault();

		if (!this.isMouseDown) { return; }

		this.isMouseDown = false;

		this.sendFigure(this.figure);
	};

	Whiteboard.prototype.onMouseMove = function (e) {
		e.preventDefault();

		if (!this.isMouseDown) { return; }

		var x = e.pageX - this.contPos.left;
		var y = e.pageY - this.contPos.top;

		this.figure.push([ x, y ]);

		// marker or eraser
		var tool = this.tools[this.figure.type];
		tool.draw(x, y);
	};

	return Whiteboard;
}());