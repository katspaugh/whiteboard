(function () {
	'use strict';

	window.addEventListener('load', function () {
		new Whiteboard({
			renderTo   : '.container',
			socketHost : 'http://air.msk.rian:50089',
			publish    : '/whiteboard/publish',
			subscribe  : '/whiteboard/subscribe'
		});
	});
}());