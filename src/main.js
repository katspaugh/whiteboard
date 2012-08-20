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

		// debug
		var fig = localStorage.getItem('figure');
		if (fig) { this.drawFigure(JSON.parse(fig)); }
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
		this.socket.emit('figure', figure);

		// debug
		console.dir(figure);
		localStorage.setItem('figure', JSON.stringify(figure));
	};

	Whiteboard.prototype.drawFigure = function (figure) {
		var tool = this.tools[figure.type];
		tool.draw(figure, figure.radius, figure.color);
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
		return new Whiteboard.Figure({
			type: type,
			color: toolCfg.color,
			radius: toolCfg.radius
		});
	};

	Whiteboard.prototype.bindEvents = function (my) {
		var listeners = {
			mousedown: 'onMouseDown',
			mouseup:   'onMouseUp',
			mousemove: 'onMouseMove'
		};

		this.container.addEventListener('mousedown', function (e) {
			return my.onMouseDown(e);
		}, false);

		this.container.addEventListener('mousemove', function (e) {
			return my.onMouseMove(e);
		}, false);

		document.addEventListener('mouseup', function (e) {
			return my.onMouseUp(e);
		}, false);
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
		var figure = this.figure;
		var tool = this.tools[figure.type];
		tool.draw(figure.slice(figure.length - 2));
	};

	return Whiteboard;
}());