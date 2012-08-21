
(function () {
	'use strict';

	window.addEventListener('load', function () {
		new Whiteboard({
			renderTo: '.container',
			socketHost: 'http://collaboratoria.local:50089',
			socketRoute: '/whiteboard'
		});
	});
}());