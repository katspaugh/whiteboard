(function () {
	'use strict';

	window.addEventListener('load', function () {
		var wb = new Whiteboard({
			id: location.hash.substring(1),

			socketHost: 'http://localhost:50089',
			publish: '/whiteboard/publish',
			subscribe: '/whiteboard/subscribe',

			renderTo: '#whiteboard',
			markerColor: '#' + ('00000' + Math.round(
				Math.random() * parseInt('FFFFFF', 16)
			).toString(16)).slice(-6),

			observable: Object.create(Observer)
		});

		wb.observable.on('id', function (id) {
			location.hash = id;
		});
	});
}());
