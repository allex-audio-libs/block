function createFilterImplementationHandlerMixin (lib, bufferlib, eventlib, templateslib, mylib, mixins) {
    'use strict';

    function FilterImplementationHandlerMixin () {
        this.filterIntroductors = new bufferlib.DynaBuffer();
        this.implementation = null;
    }
    FilterImplementationHandlerMixin.prototype.destroy = function () {
        if (this.filterIntroductors) {
            this.filterIntroductors.destroy();
        }
        this.filterIntroductors = null;
    };

    FilterImplementationHandlerMixin.prototype.createImplementation = function () {
        //this.frequencyHz has the actual value
        //this.resonance has the actual value
        throw new lib.Error('NOT_IMPLEMENTED', this.constructor.name+' has to implement createImplementation');
    };


    FilterImplementationHandlerMixin.prototype.handleImplementation = function (filtimp) {
        if (!this.implementation) {
            this.implementation = filtimp;
            return;
        }
    };
    FilterImplementationHandlerMixin.prototype.purgeImplementation = function () {
        this.implementation = null; //TODO: maybe destroy?
    };


    FilterImplementationHandlerMixin.addMethods = function (klass) {
        lib.inheritMethods(klass, FilterImplementationHandlerMixin
            , 'handleImplementation'
            , 'createImplementation'
            , 'purgeImplementation'
        );
    };

    mixins.FilterImplementationHandler = FilterImplementationHandlerMixin;
}
module.exports = createFilterImplementationHandlerMixin;