var netData;
var trainingSet = [];

(function () {
	'use strict';

	var THRESHOLD = 0.9;
	var SAMPLE_SQUARE_SIZE = 100;


	var worker;
	var whiteboard;
	var currentShape;
	var trained;
	var net;
	var trainButton;


	var normalize = function (figure) {
		var extrem = whiteboard.drawer.getMinMax(figure);
		var min = extrem.min;
		var max = extrem.max;

		var size = Math.max(max.x - min.x, max.y - min.y);
		var k = SAMPLE_SQUARE_SIZE / size;

		var scaled = figure.data.map(function (item) {
			return [
				~~((item[0] - min.x) * k),
				~~((item[1] - min.y) * k)
			];
		});

		/*
		// debug drawing
		whiteboard.drawer.drawFigure({
			color: figure.color,
			radius: 1,
			type: figure.type,
			data: scaled
		});
		*/

		var matrix = {};
		for (var i = 0; i < SAMPLE_SQUARE_SIZE; i += 1) {
			matrix['x' + i] = 0;
			matrix['y' + i] = 0;
		}

		scaled.forEach(function (item) {
			var slotX = 'x' + item[0];
			var slotY = 'y' + item[1];
			if (slotX in matrix) {
				matrix[slotX] = 1;
			}
			if (slotY in matrix) {
				matrix[slotY] = 1;
			}
		});

		return matrix;
	};


	var setShape = function (shape) {
		var symbols = {
			rect: String.fromCharCode(10065),
            circle: String.fromCharCode(10061)
		};

		if (shape !== currentShape) {
			currentShape = shape;

			// indicator
			document.querySelector('#shape-indicator').textContent =
				symbols[shape];
		}
	};


	var bindButtons = function () {
		trainButton = document.querySelector('#train');
		var buttonsGrp = document.querySelector('#shapes');

		var onShapeButtonClick = function (e) {
			e.preventDefault();
			var shape = e.target.dataset.shape;
			shape && setShape(shape);
		};

		var onTrainButtonClick = function (e) {
			e.preventDefault();

			if (trained) {
				toggleTrained(false);
			} else {
				if (trainingSet.length) {
					setLoading();

					worker.postMessage(JSON.stringify(trainingSet));
				} else {
					alert('No trainging data!');
				}
			}
		};

		buttonsGrp.addEventListener('click', onShapeButtonClick, false);

		trainButton.addEventListener('click', onTrainButtonClick, false);

		setShape('rect');
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
		whiteboard.drawer.reset();

		if (trained) {
			var output = net.run(normalize(figure));

			console.log(
				'Rect: %d, circle %d',
				output.rect,
				output.circle
			);

			if (output.rect > output.circle && output.rect > THRESHOLD) {
				whiteboard.drawer.drawRect(figure);
			}

			if (output.circle > output.rect && output.circle > THRESHOLD) {
				whiteboard.drawer.reset();
				whiteboard.drawer.drawCircle(figure);
			}
		} else {
			trainingSet.push({
				input: normalize(figure),
				output: {
					rect: +('rect' == currentShape),
					circle: +('circle' == currentShape)
				}
			});
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

		if (0 && window._netData) {
			net = new brain.NeuralNetwork().fromJSON(_netData);
			toggleTrained(true);
		} else {
			toggleTrained(false);
		}
	};


	var onMessage = function (event) {
		var data = JSON.parse(event.data);

		toggleTrained(true);

		netData = data;

		net = new brain.NeuralNetwork().fromJSON(data);
	};


	window.addEventListener('load', init, false);
}());
