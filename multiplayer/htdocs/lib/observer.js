var Observer = (function () {
    'use strict';

    return {
        on: function (event, fn) {
            if (!this.handlers) { this.handlers = {}; }

            var handlers = this.handlers[event];
            if (!handlers) {
                handlers = this.handlers[event] = [];
            }
            handlers.push(fn);
        },

        un: function (event, fn) {
            if (!this.handlers) { return; }

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
            if (!this.handlers) { this.handlers = {}; }

            var handlers = this.handlers[event];
            if (handlers) {
                var len = handlers.length;
                for (var i = 0; i < len; i += 1) {
                    handlers[i](data);
                }
            }
        }
    };
}());