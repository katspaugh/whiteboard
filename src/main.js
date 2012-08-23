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
		this.userId = Math.random().toString(32).substring(2);

		this.figures = {};

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
			my.id = message.wbId;

			if (message.userId == my.userId) {
				if (message.png && message.png.ok) {
					console.log('SOCKET RECEIVE SUBSCRIBE', message);

					my.drawer.drawPng(message.png.url);
				}
			} else {
				console.log('SOCKET RECEIVE FIGURE', message);

				if (message.width || message.height) {
					my.drawer.resize(message.width, message.height);
				}

				my.drawer.drawFigure(message.figure);
			}

			my.setHash();
		});

		// subscribe to messages
		this.socket.on('connect', function () {
			var message = {
				queue: my.id || '',
				userId: my.userId
			};

			console.log('SOCKET SEND SUBSCRIBE', message);

			my.socket.send([
				my.cfg.subscribe,
				JSON.stringify(message)
			].join(':'));
		});
	};

	Whiteboard.prototype.sendFigure = function (figure) {
		var message = {
			queue: this.id,
			data: {
				wbId: this.id,
				userId: this.userId,
				width: this.drawer.width,
				height: this.drawer.height,
				figure: figure
			}
		};

		console.log('SOCKET SEND FIGURE', message);

		this.socket.send([
			this.cfg.publish,
			JSON.stringify(message)
		].join(':'));
	};

	Whiteboard.prototype.bindEvents = function () {
		var my = this;

		var container = this.drawer.container;

		// mouse
		container.addEventListener('mousedown', function (e) {
			return my.onMouseDown(e);
		}, false);

		container.addEventListener('mousemove', function (e) {
			return my.onMouseMove(e);
		}, false);

		document.addEventListener('mouseup', function (e) {
			return my.onMouseUp(e);
		}, false);

		// multitouch
		container.addEventListener('touchstart', function (e) {
			return my.onTouchStart(e);
		}, false);

		container.addEventListener('touchmove', function (e) {
			return my.onTouchMove(e);
		}, false);

		document.addEventListener('touchend', function (e) {
			return my.onTouchEnd(e);
		}, false);

		// hashchange
		window.addEventListener('hashchange', function (e) {
			return my.onHashChange(e);
		}, false);
	};


	Whiteboard.prototype.onTouchStart = function (e) {
		var touches = e.targetTouches;
		for (var i = 0, len = touches.length; i < len; i += 1) {
			var finger = touches[i];
			this.figures[finger.identifier] =
				this.drawer.createFigure(this.tools.marker);
		}
	};

	Whiteboard.prototype.onTouchEnd = function (e) {
		var touches = e.changedTouches;
		for (var i = 0, len = touches.length; i < len; i += 1) {
			var finger = touches[i];
			this.onEndFigure(finger.identifier);
		}
	};

	Whiteboard.prototype.onTouchMove = function (e) {
		var touches = e.changedTouches;

		// FIXME: temporarily disallow drawing with many fingers
		if (touches.length > 1) { return; }

		for (var i = 0, len = touches.length; i < len; i += 1) {
			var finger = touches[i];
			var figure = this.figures[finger.identifier];

			if (figure) {
				var x = finger.pageX;
				var y = finger.pageY;
				this.drawLine(figure, x, y);
			}
		}
	};

	Whiteboard.prototype.onHashChange = function () {
		this.id = this.getHash();
		this.drawer.reset();
	};

	Whiteboard.prototype.onMouseDown = function (e) {
		if (1 != e.which) { return; }

		this.isMouseDown = true;

		this.figures.mouse = this.drawer.createFigure(
			this.tools[e.shiftKey ? 'eraser' : 'marker']
		);

		this.onMouseMove(e);
	};

	Whiteboard.prototype.onMouseUp = function (e) {
		if (1 != e.which) { return; }

		e.preventDefault();

		if (!this.isMouseDown) { return; }

		this.isMouseDown = false;

		this.onEndFigure('mouse');
	};

	Whiteboard.prototype.onMouseMove = function (e) {
		e.preventDefault();

		if (!this.isMouseDown) { return; }

		var figure = this.figures.mouse;

		this.drawLine(figure, e.pageX, e.pageY);
	};

	Whiteboard.prototype.drawLine = function (figure, x, y) {
		var relX = x - this.drawer.contPos.left;
		var relY = y - this.drawer.contPos.top;

		figure.push([ relX, relY ]);

		this.drawer.drawFigure(figure, 2);
	};

	Whiteboard.prototype.onEndFigure = function (id) {
		var figure = this.figures[id];
		if (figure) {
			this.sendFigure(figure);
			delete this.figures[id];
		}
	};

	return Whiteboard;
}());
