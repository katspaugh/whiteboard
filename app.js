(function () {
	'use strict';

	window.addEventListener('load', function () {
		new Whiteboard({
			id: Math.random(),
			renderTo   : '.container',
			markerColor: '#' + ('00000' + Math.round(
				Math.random() * parseInt('FFFFFF', 16)
			).toString(16)).slice(-6)
		});
	});
}());
