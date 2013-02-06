Multiplayer Whiteboard
========================

Real-time multiplayer whiteboard with multitouch support.

Made with HTML5 Canvas, WebSocket (via socket.io) and Touch API.

Heavily inspired by very cool [opinsys/walma](https://github.com/opinsys/walma).

![Whiteboard](http://i.imgur.com/y56zh.png)

Server Installation
===================

Install node, RabbitMQ, MongoDB, [XQuartz](http://xquartz.macosforge.org/landing/) and cairo.

    $ brew install node rabbitmq mongodb cairo

Install [node-canvas](https://github.com/LearnBoost/node-canvas):

    $ PKG_CONFIG_PATH=/opt/X11/lib/pkgconfig npm install -g canvas

(`/opt/X11` is the directory where you should have installed XQuartz).

You'll also need the following npm modules:

    $ npm install -g socket.io amqp dataflo.ws dataflo.ws-amqp

Running the server
==================

Launch MongoDB and RabbitMQ. Go to the directory `multiplayer` of your Whiteboard clone and run `dataflo.ws` (npm's `bin` directory must be in your `$PATH`). Open the browser at http://localhost:50088 and share the URL with others. Have fun!

License
=======

GPLv3

We can also provide a commercially licensed version by request.

© RIA Novosti Media Lab