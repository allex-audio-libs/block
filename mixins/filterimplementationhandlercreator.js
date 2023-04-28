function createFilterImplementationHandlerMixin (lib, bufferlib, eventlib, templateslib, mylib, mixins) {
    'use strict';

    function FilterIntroducer (filter) {
        this.filter = filter;
        this.maxSteps = 0;
        this.steps = 0;
    }
    FilterIntroducer.prototype.destroy = function () {
        this.steps = null;
        this.maxSteps = null;
        this.filter = null; //don't destroy it, even if it can be destroyed
    };
    FilterIntroducer.prototype.step = function (sample) {
        var ret;
        sanityCheck.call(this);
        if (!this.filter) {
            return ret;
        }
        ret = this.filter.singleStep(sample);
        this.steps++;
        return ret;
    };
    FilterIntroducer.prototype.progress = function () {
        if (this.isDone()) {
            return 1;
        }
        return this.steps/this.maxSteps;
    };
    FilterIntroducer.prototype.antiProgress = function () {
        return 1-this.progress();
    };
    FilterIntroducer.prototype.isDone = function () {
        sanityCheck.call(this);
        return this.steps>=this.maxSteps;
    };
    FilterIntroducer.prototype.isEmpty = function () {
        return !this.filter;
    };
    FilterIntroducer.prototype.clear = function () {
        this.filter = null;
        this.steps = 0;
    };
    FilterIntroducer.prototype.setFilter = function (filter) {
        this.filter = filter;
    };
    FilterIntroducer.prototype.setSampleRate = function (samplerate) {
        this.maxSteps = samplerate/10;
    };

    //statics
    function sanityCheck () {
        if (!this.maxSteps) {
            throw new lib.Error('NO_MAX_STEPS', 'You have to setSampleRate first');
        }
    }
    //endof statics

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
        this.introducer = new FilterIntroducer(null);
        this.introducerSample = 0;
    }
    FilterImplementationHandlerMixin.prototype.destroy = function () {
        this.introducerSample = null;
        if (this.introducer) {
            this.introducer.destroy();
        }
        this.introducer = null;
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
        if (!this.introducer) {
            return; //I'm destroyed already
        }
        this.introducer.setSampleRate(this.sampleRate); //it is assumed that who mixes us in is a sampleRate emitter
        if (!this.implementation) {
            this.implementation = this.implementationCandidate;
            this.implementationCandidate = null;
            return;
        }
        if (!this.introducer.isEmpty()) {
            this.introducerSample = this.introducer.step(sample);
            return;
        }
        if (this.implementationCandidate && this.introducer.isEmpty()) {
            this.introducer.setFilter(this.implementationCandidate);
            this.implementationCandidate = null;
            return;
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
        if (this.introducer.isDone()) {
            replaceImplementation.call(this, this.introducer.filter);
            this.introducer.clear();
        }
        //console.log(ret*this.volume);
        return (
            ret*this.introducer.antiProgress()
            +
            this.introducerSample*this.introducer.progress()
        );
    };

    //statics
    function replaceImplementation (imp) {
        this.purgeImplementation();
        this.implementation = imp;
        //console.log(this.implementation.frequencyHz, this.implementation.resonance, this.implementation.sampleRate);
    }
    //endof statics

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