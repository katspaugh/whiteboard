var trainingSet = [];
var normalSet = [];

(function () {
	'use strict';

	var TEST_THRESHOLD = 0.95;
	var SAMPLE_SQUARE_SIZE = 10;
	var SAMPLE_RADIUS = 1;


	var SYMBOLS = {
		rect: String.fromCharCode(10065),
		circle: String.fromCharCode(10061),
		triangle: String.fromCharCode(9651)
	};


	var worker;
	var whiteboard;
	var currentShape;
	var trained;
	var storingAllowed;
	var net;
	var trainButton;


	var normalize = function (figure) {
		var extrem = whiteboard.drawer.getMinMax(figure);
		var min = extrem.min;
		var max = extrem.max;

		var size = Math.max(max.x - min.x, max.y - min.y);
		var k = (SAMPLE_SQUARE_SIZE - SAMPLE_RADIUS * 4) / size;

		var kr = SAMPLE_RADIUS / k;
		var points = figure.data.map(function (item) {
			return [
				~~((item[0] - min.x) + kr * 2),
				~~((item[1] - min.y) + kr * 2)
			];
		});

		whiteboard.drawer.reset();
		whiteboard.drawer.context.save();
		whiteboard.drawer.context.scale(k, k);
		whiteboard.drawer.drawFigure({
			type: figure.type,
			radius: Math.ceil(kr),
			color: '#000',
			data: points
		});
		whiteboard.drawer.context.restore();

		var image = whiteboard.drawer.getData(
			0, 0, SAMPLE_SQUARE_SIZE, SAMPLE_SQUARE_SIZE
		);
		var data = image.data;

		var input = [];
		for (var i = 0, len = data.length; i < len; i += 4) {
			input.push(data[i + 3]);
		}

		var output = {};
		output[figure.shape] = 1;

		return { input: input, output: output };
	};


	var setShape = function (shape) {
		currentShape = shape;

		// indicator
		location.hash = shape;

		document.querySelector('#shape-indicator').textContent =
			SYMBOLS[shape];
	};


	var bindButtons = function () {
		trainButton = document.querySelector('#train');

		trainButton.addEventListener('click', onTrainButtonClick, false);
		window.addEventListener('hashchange', onHashChange, false);

		var allowCheckbox = document.querySelector('#allowStoring');
		allowCheckbox.addEventListener('change', onAllowStoring, false);
		onAllowStoring.call(allowCheckbox);
	};


	var createShapeButtons = function () {
		var shapes = Object.keys(SYMBOLS);

		var buttonsGroup = document.querySelector('#shape-buttons');
		shapes.forEach(function (shape) {
			var link = document.createElement('a');
			link.href = '#' + shape;
			link.textContent = SYMBOLS[shape] + ' ' + shape;
			buttonsGroup.appendChild(link);
		});

		setShape(shapes[0]);
	};


	var onHashChange = function (e) {
		var shape = location.hash.substring(1);
		shape && setShape(shape);
	};


	var onTrainButtonClick = function (e) {
		e.preventDefault();

		if (trained) {
			toggleTrained(false);
		} else {
			if (trainingSet.length) {
				setLoading();

				worker.postMessage(JSON.stringify(normalSet));
			} else {
				alert('No trainging data!');
			}
		}
	};


	var setLoading = function () {
		trainButton.disabled = true;
		trainButton.textContent = 'Loading training data...';
	};


	var toggleTrained = function (toggle) {
		trained = toggle;
		trainButton.textContent = trained ?
			'Switch to train mode' : 'Switch to test mode';
		document.body.className = trained ? 'testing' : '';
		trainButton.disabled = false;
	};


	var onFigure = function (figure) {
		figure.shape = currentShape;

		if (trained) {
			var output = net.run(normalize(figure).input);

			console.info(output);

			if (output.rect > TEST_THRESHOLD) {
				whiteboard.drawer.drawRect(figure);
			}

			if (output.circle > TEST_THRESHOLD) {
				whiteboard.drawer.drawCircle(figure);
			}
		} else {
			addData(figure);
		}
	};


	var init = function () {
		worker = new Worker('training-worker.js');
		worker.onmessage = onMessage;

		var observer = new Observer();
		observer.on('figure', onFigure);

		observer.on('figure', storeFigure);

		whiteboard = new Whiteboard({
			id: Math.random(),
			renderTo   : '.container',
			markerColor: '#' + ('00000' + Math.round(
				Math.random() * parseInt('FFFFFF', 16)
			).toString(16)).slice(-6),
			observable: observer
		});

		bindButtons();
		createShapeButtons();

		toggleTrained(false);
		loadFigures();
	};


	var onMessage = function (event) {
		var data = JSON.parse(event.data);
		net = new brain.NeuralNetwork().fromJSON(data);

		toggleTrained(true);
	};


	var onAllowStoring = function (e) {
		storingAllowed = this.checked;
	};


	var storeFigure = function (figure) {
		if (!storingAllowed || trained) { return; }

		var url = 'http://chew.io/whiteboard/create.json';

		var client = new XMLHttpRequest();
		client.open('POST', url);
		client.setRequestHeader('Content-Type', 'application/json');

		client.onreadystatechange = function () {
			if (this.readyState == this.DONE) {
				console.info(this.responseText);
			}
		};


		figure.shape = currentShape;
		var document = JSON.stringify(figure);

		client.send(document);
	};


	var loadFigures = function (page) {
		var LIMIT = 20;
		if (!page) { page = 1; }

		var url = [
			'http://chew.io/whiteboard/read.json?',
			'&limit=' + LIMIT,
			'&skip=' + LIMIT * (page - 1)
		].join('');

		var client = new XMLHttpRequest();
		client.open('GET', url);
		client.setRequestHeader('Content-Type', 'application/json');

		client.onreadystatechange = function () {
			if (this.readyState == this.DONE) {
				var total = this.getResponseHeader('X-Mongohq-Count');

				try {
					var data = JSON.parse(this.responseText);
					addData(data);

					if (page < total / LIMIT) {
						loadFigures(page + 1);
					}
				} catch (e) {
					console.error(e);
				}
			}
		};

		client.send();
	};


	var addData = function (data) {
		var add = function (item) {
			trainingSet.push(item);
			normalSet.push(normalize(item));
		};

		if (data instanceof Array) {
			data.forEach(add);
		} else {
			add(data);
		}
	};


	window.addEventListener('load', init, false);
}());
