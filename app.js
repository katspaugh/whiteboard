
(function () {
	'use strict';

	window.addEventListener('load', function () {
		new Whiteboard({
			renderTo: '.container',
			server: 'http://localhost'
		});
	});
}());