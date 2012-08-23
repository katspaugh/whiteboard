(function () {
	'use strict';

	window.addEventListener('load', function () {
		new Whiteboard({
			renderTo   : '.container',
			socketHost : 'http://air.msk.rian:50089',
			publish    : '/whiteboard/publish',
			subscribe  : '/whiteboard/subscribe',
			markerColor: '#' + ('00000' + Math.round(
				Math.random() * parseInt('FFFFFF', 16)
			).toString(16)).slice(-6)
		});
	});
}());