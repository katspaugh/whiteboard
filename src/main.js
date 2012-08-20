var Whiteboard = (function () {
	'use strict';

	var Whiteboard = function (cfg) {
		return this.init(cfg || this.Defaults);
	};

	Whiteboard.prototype.Defaults = {
		renderTo: 'body'
	};

	Whiteboard.prototype.init = function (cfg) {
		var selector = cfg.renderTo || this.Defaults.renderTo;
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

		this.marker = this.createMarker();
		this.eraser = this.createEraser();

		this.figure = [];

		this.bindEvents(this);
	};

	Whiteboard.prototype.createSocket = function () {
		return {
			send: function (msg, data) { console.log(msg, data); }
		};
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

		this.onMouseMove(e);
	};

	Whiteboard.prototype.onMouseUp = function (e) {
		e.preventDefault();

		if (!this.isMouseDown) { return; }

		this.isMouseDown = false;

		if (this.figure.length) {
			this.socket.send('figure', this.figure);
		}
	};

	Whiteboard.prototype.onMouseMove = function (e) {
		e.preventDefault();

		if (!this.isMouseDown) { return; }

		var x = e.pageX - this.contPos.left;
		var y = e.pageY - this.contPos.top;

		if (this.isShiftPressed) {
			this.figure.type = 'eraser';
			this.eraser.draw(x, y);
		} else {
			this.figure.type = 'marker';
			this.marker.draw(x, y);
		}

		this.figure.push([ x, y ]);
	};

	return Whiteboard;
}());