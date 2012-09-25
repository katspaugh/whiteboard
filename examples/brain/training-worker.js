importScripts('lib/brain.js');

this.onmessage = function (event) {
	var net = new brain.NeuralNetwork();

	net.train(JSON.parse(event.data), {
		iterations: 9000,
		callbackPeriod: 500
	});

	postMessage(JSON.stringify(net.toJSON()));
};
