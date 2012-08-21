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

		this.id = this.cfg.id || this.getHash();
		this.userId = Math.random();

		this.createSockets();

		this.tools = {
			marker: this.createMarker(),
			eraser: this.createEraser()
		};

		this.bindEvents(this);
	};

	Whiteboard.prototype.getHash = function () {
		return document.location.hash.replace(/^#/, '');
	};

	Whiteboard.prototype.setHash = function () {
		if (document.location.hash !== this.id) {
			document.location.hash = this.id;
		}
	};

	Whiteboard.prototype.createSockets = function () {
		var my = this;

		this.socket = io.connect(this.cfg.socketHost);

		this.socket.on('message', function (figure) {
			console.dir(figure);

			if (figure.userId !== my.userId) {
				my.id = figure.wbId;

				my.setHash();
				my.drawFigure(figure);
			}
		});

		// subscribe to messages
		this.socket.on('connect', function () {
			var message = JSON.stringify({
				queue: my.id || ''
			});

			my.socket.send(my.cfg.subscribe + ':' + message);
		});
	};

	Whiteboard.prototype.sendFigure = function (figure) {
		figure.wbId = this.id;
		figure.userId = this.userId;

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
			color: '#' + Math.round(
				Math.random() * parseInt('FFFFFF', 16)
			).toString(16),
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

		window.addEventListener('hashchange', function (e) {
			return my.onHashChange(e);
		}, false);
	};

	Whiteboard.prototype.onHashChange = function () {
		this.id = this.getHash();
		this.reset();
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

	Whiteboard.prototype.reset = function () {
		this.canvas.width = this.width;
	};

	return Whiteboard;
}());