function createHandleImplementation (lib, Class) {
    'use strict';

    Class.prototype.handleImplementation = function (filtimp) {
        this.implementation = filtimp;
    };
}
module.exports = createHandleImplementation;