var Observer = (function () {
    'use strict';

    var proto = {
        init: function () {
            this.handlers = {};
        },

        on: function (event, fn) {
            var handlers = this.handlers[event];
            if (!handlers) {
                handlers = this.handlers[event] = [];
            }
            handlers.push(fn);
        },

        un: function (event, fn) {
            var handlers = this.handlers[event];
            if (handlers && handlers.length) {
                if (fn) {
                    var index = handlers.indexOf(fn);
                    if (index >= 0) {
                        handlers.splice(index, 1);
                    }
                } else {
                    handlers.length = 0;
                }
            }
        },

        fireEvent: function (event, data) {
            var handlers = this.handlers[event];
			if (handlers) {
				var len = handlers.length;
				for (var i = 0; i < len; i += 1) {
					handlers[i](data);
				}
			}
        }
    };

    return function Observer(cfg) {
        var inst = Object.create(proto, cfg);
        inst.init();
        return inst;
    };
}());
