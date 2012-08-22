var Whiteboard = (function () {
	'use strict';

	var Whiteboard = function (cfg) {
		this.cfg = cfg || this.Defaults;
		return this.init();
	};

	Whiteboard.prototype.Defaults = {
	};

	Whiteboard.prototype.init = function () {
		this.drawer = new Whiteboard.Drawer(this.cfg);

		this.id = this.cfg.id || this.getHash();
		this.userId = Math.random();

		this.createTools();
		this.createSockets();
		this.bindEvents();
	};

	Whiteboard.prototype.createTools = function () {
		this.tools = {
			marker: {
				type: 'marker',
				color: this.getRandomColor(),
				radius: 8
			},

			eraser: {
				type: 'eraser',
				radius: 30
			}
		};
	};

	Whiteboard.prototype.getRandomColor = function (colorsCount) {
		var max = parseInt('FFFFFF', 16);
		var rounding = (max / colorsCount || 1);
		return '#' + ('00000' + (Math.round(
			(Math.random() * max) / rounding
		) * rounding).toString(16)).slice(-6);
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

		this.socket.on('message', function (message) {
			console.dir(message);

			my.id = message.wbId;

			if (message.userId == my.userId) {
				if (message.png && message.png.ok) {
					my.drawer.drawPng(message.png.url);
				}
			} else {
				if (message.width || message.height) {
					my.drawer.resize(message.width, message.height);
				}

				my.drawer.drawFigure(message.figure);
			}

			my.setHash();
		});

		// subscribe to messages
		this.socket.on('connect', function () {
			var message = JSON.stringify({
				queue: my.id || '',
				userId: my.userId
			});

			my.socket.send(my.cfg.subscribe + ':' + message);
		});
	};

	Whiteboard.prototype.sendFigure = function (figure) {
		var message = {
			wbId: this.id,
			userId: this.userId,
			width: this.drawer.width,
			height: this.drawer.height,
			figure: figure
		};

		this.socket.send(
			this.cfg.publish + ':' + JSON.stringify([{
				queue: this.id,
				data: message
			}])
		);
	};

	Whiteboard.prototype.bindEvents = function () {
		var my = this;

		var container = this.drawer.container;

		container.addEventListener('mousedown', function (e) {
			return my.onMouseDown(e);
		}, false);

		container.addEventListener('mousemove', function (e) {
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
		this.drawer.reset();
	};

	Whiteboard.prototype.onMouseDown = function (e) {
		if (1 != e.which) { return; }

		this.isMouseDown = true;

		this.figure = this.drawer.createFigure(
			this.tools[e.shiftKey ? 'eraser' : 'marker']
		);

		this.onMouseMove(e);
	};

	Whiteboard.prototype.onMouseUp = function (e) {
		if (1 != e.which) { return; }

		e.preventDefault();

		if (!this.isMouseDown) { return; }

		this.isMouseDown = false;

		this.sendFigure(this.figure);
	};

	Whiteboard.prototype.onMouseMove = function (e) {
		e.preventDefault();

		if (!this.isMouseDown) { return; }

		var x = e.pageX - this.drawer.contPos.left;
		var y = e.pageY - this.drawer.contPos.top;

		var figure = this.figure;
		figure.push([ x, y ]);

		this.drawer.drawFigure(this.figure, 2);
	};	

	return Whiteboard;
}());
