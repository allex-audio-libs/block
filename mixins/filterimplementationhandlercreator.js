function createFilterImplementationHandlerMixin (lib, bufferlib, eventlib, templateslib, mylib, mixins) {
    'use strict';

    function FilterIntroducer (filter) {
        this.filter = filter;
        this.steps = 0;
    }
    FilterIntroducer.prototype.destroy = function () {
        this.steps = null;
        this.filter = null; //don't destroy it, even if it can be destroyed
    };
    FilterIntroducer.prototype.step = function (sample) {
        this.filter.singleStep(sample);
        this.steps++;
    };
    FilterIntroducer.prototype.isDone = function () {
        return this.steps>=this.maxSteps;
    };
    FilterIntroducer.prototype.maxSteps = 16;

    function FilterIntroducers () {
        bufferlib.DynaBuffer.call(this);
    }
    lib.inherit(FilterIntroducers, bufferlib.DynaBuffer);
    FilterIntroducers.prototype.step = function (sample) {
        var fi = this.head;
        while (fi) {
            fi.contents.step(sample);
            fi = fi.next;
        }
    };
    FilterIntroducers.prototype.getFilterDone = function () {
        var fdb = this.head, ret; //fdb => filter done bucket
        if (!fdb) {
            return null;
        }
        if (fdb.contents.isDone()) {
            ret = fdb.contents.filter;
            this.shift();
            return ret;
        }
        return null;
    };

    function FilterImplementationHandlerMixin () {
        this.filterIntroductors = new bufferlib.DynaBuffer();
        this.implementation = null;
        this.implementationCandidate = null;
        this.introducers = new FilterIntroducers();
    }
    FilterImplementationHandlerMixin.prototype.destroy = function () {
        if (this.introducers) {
            this.introducers.destroy();
        }
        this.introducers = null;
        if (this.implementationCandidate) {
            this.implementationCandidate = null; //TODO: maybe destroy?
        }
        this.implementationCandidate = null;
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
    FilterImplementationHandlerMixin.prototype.setImplementationCandidate = function () {
        this.implementationCandidate = this.createImplementation();
    };
    FilterImplementationHandlerMixin.prototype.handleImplementation = function (sample) {
        var readyfilter;
        if (!this.implementation) {
            this.implementation = this.implementationCandidate;
            this.implementationCandidate = null;
            return;
        }
        if (this.implementationCandidate) {
            this.introducers.push(new FilterIntroducer(this.implementationCandidate));
            this.implementationCandidate = null;
        }
        this.introducers.step(sample);
        readyfilter = this.introducers.getFilterDone();
        if (readyfilter) {
            this.purgeImplementation();
            this.implementation = readyfilter;
        }
    };
    FilterImplementationHandlerMixin.prototype.purgeImplementation = function () {
        this.implementation = null; //TODO: maybe destroy?
    };
    FilterImplementationHandlerMixin.prototype.produceSample = function (input) { //a number
        this.handleImplementation(input);
        var ret = this.implementation ?
            this.implementation.singleStep(input)
            :
            0;
        if (!lib.isNumber(ret)) {
            console.log('Filter NaN');
            return 0;
        }
        //console.log(ret*this.volume);
        return ret;
    };



    FilterImplementationHandlerMixin.addMethods = function (klass) {
        lib.inheritMethods(klass, FilterImplementationHandlerMixin
            , 'createImplementation'
            , 'setImplementationCandidate'
            , 'handleImplementation'
            , 'purgeImplementation'
            , 'produceSample'
        );
    };

    mixins.FilterImplementationHandler = FilterImplementationHandlerMixin;
}
module.exports = createFilterImplementationHandlerMixin;