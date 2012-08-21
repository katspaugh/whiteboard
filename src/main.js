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

		this.createSockets();

		this.tools = {
			marker: this.createMarker(),
			eraser: this.createEraser()
		};

		this.bindEvents(this);
	};

	Whiteboard.prototype.createSockets = function () {
		var my = this;

		this.socket = io.connect(this.cfg.socketHost);

		this.socket.on('message', function (figure) {
			console.dir(figure);

			my.cfg.id = figure.wbId;

			my.drawFigure(figure);
		});

		// subscribe to messages
		this.socket.on('connect', function () {
			var message = JSON.stringify({
				queue: my.cfg.id || ''
			});

			my.socket.send(my.cfg.subscribe + ':' + message);
		});
	};

	Whiteboard.prototype.sendFigure = function (figure) {
		figure.wbId = this.cfg.id;

		this.socket.send(
			this.cfg.publish + ':' + JSON.stringify([{
				queue: figure.wbId,
				data: figure
			}])
		);
	};

	Whiteboard.prototype.drawFigure = function (figure) {
		var tool = this.tools[figure.type];
		tool && tool.draw(figure, figure.radius, figure.color);
	};

	Whiteboard.prototype.createMarker = function (cfg) {
		return new Whiteboard.Marker({
			context: this.context,
			color: 'rgba(100, 0, 0, 0.3)',
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

		var figure = this.figure;
		figure.push([ x, y ]);

		var tool = this.tools[figure.type];
		var slice = figure.slice(figure.length - 2);
		tool.draw(slice);
	};

	return Whiteboard;
}());