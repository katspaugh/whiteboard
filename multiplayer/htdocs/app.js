(function () {
	'use strict';

	window.addEventListener('load', function () {
		new Whiteboard({
			id: Math.random().toString(32),
			userId: Math.random().toString(32),

			socketHost: 'http://localhost:50089',
			publish: '/whiteboard/publish',
			subscribe: '/whiteboard/subscribe',

			renderTo: '.container',
			markerColor: '#' + ('00000' + Math.round(
				Math.random() * parseInt('FFFFFF', 16)
			).toString(16)).slice(-6)
		});
	});
}());
