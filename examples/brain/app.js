var trainingSet = [];
var normalSet = [];

(function () {
	'use strict';

	var TEST_THRESHOLD = 0.8;
	var SAMPLE_SQUARE_SIZE = 10;
	var SAMPLE_RADIUS = 1;


	var SYMBOLS = {
		rect: String.fromCharCode(10065),
        circle: String.fromCharCode(10061)/*,
		triangle: String.fromCharCode(9651),
		curve: String.fromCharCode(8768)*/
	};


	var worker;
	var whiteboard;
	var currentShape;
	var trained;
	var net;
	var trainButton;


	var normalize = function (item) {
		var figure = item.figure;
		var shape = item.shape;

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
		output[shape] = 1;

		return { input: input, output: output };
	};


	var setShape = function (shape) {
		if (shape !== currentShape) {
			currentShape = shape;

			// indicator
			document.querySelector('#shape-indicator').textContent =
				SYMBOLS[shape];
		}
	};


	var bindButtons = function () {
		trainButton = document.querySelector('#train');

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

					localStorage.trainingSet = JSON.stringify(trainingSet);
				} else {
					alert('No trainging data!');
				}
			}
		};

		trainButton.addEventListener('click', onTrainButtonClick, false);
		window.addEventListener('hashchange', onHashChange, false);

		var shapes = Object.keys(SYMBOLS);

		var buttonsGroup = document.querySelector('#shape-buttons');
		shapes.forEach(function (shape) {
			var link = document.createElement('a');
			link.href = '#' + shape;
			link.textContent = SYMBOLS[shape] + ' ' + shape;
			buttonsGroup.appendChild(link);
		});

		setShape(shapes[0]);
		location.hash = shapes[0];
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
		if (trained) {
			var output = net.run(normalize({
				figure: figure,
				shape: currentShape
			}).input);

			console.log(
				'Rect: %s, circle %s',
				output.rect,
				output.circle
			);

			if (output.rect > output.circle &&
				output.rect > TEST_THRESHOLD) {
				whiteboard.drawer.drawRect(figure);
			}

			if (output.circle > output.rect &&
				output.circle > TEST_THRESHOLD) {
				whiteboard.drawer.drawCircle(figure);
			}
		} else {
			var item = {
				figure: figure,
				shape: currentShape
			};

			trainingSet.push(item);

			normalSet.push(normalize(item));
		}
	};


	var init = function () {
		worker = new Worker('training-worker.js');
		worker.onmessage = onMessage;

		var observer = new Observer();
		observer.on('figure', onFigure);

		whiteboard = new Whiteboard({
			id: Math.random(),
			renderTo   : '.container',
			markerColor: '#' + ('00000' + Math.round(
				Math.random() * parseInt('FFFFFF', 16)
			).toString(16)).slice(-6),
			observable: observer
		});

		bindButtons();

		toggleTrained(false);

		if ('trainingSet' in localStorage) {
			trainingSet = JSON.parse(localStorage.trainingSet);
			normalSet = trainingSet.map(normalize);
		}
	};


	var onMessage = function (event) {
		var data = JSON.parse(event.data);
		net = new brain.NeuralNetwork().fromJSON(data);

		toggleTrained(true);
	};


	window.addEventListener('load', init, false);
}());
