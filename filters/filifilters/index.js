function createFiliFilters (lib, bufferlib, templateslib, mylib) {
    'use strict';

    var Base = mylib.FilterBase;
    var SampleRateEmitterMixin = mylib.mixins.SampleRateEmitter;
    var SampleRateListenerMixin = mylib.mixins.SampleRateListener;

    var FrequencyHzEmitterMixin = mylib.mixins.FrequencyHzEmitter;
    var ResonanceEmitterMixin = mylib.mixins.ResonanceEmitter;

    var _BUFFERLENGTH = 64;

    function BaseFiliFilterBlock () {
        Base.call(this);
        SampleRateEmitterMixin.call(this, 0);
        SampleRateListenerMixin.call(this);
        this.implementation = null;
        this.buffer = new bufferlib.NumericBuffer(_BUFFERLENGTH);
    }
    lib.inherit(BaseFiliFilterBlock, Base);
    SampleRateEmitterMixin.addMethods(BaseFiliFilterBlock);
    SampleRateListenerMixin.addMethods(BaseFiliFilterBlock);
    BaseFiliFilterBlock.prototype.destroy = function () {
        if (this.buffer) {
            this.buffer.destroy();
        }
        this.buffer = null;
        purgeImplementation.call(this);
        SampleRateListenerMixin.prototype.destroy.call(this);
        SampleRateEmitterMixin.prototype.destroy.call(this);
        Base.prototype.destroy.call(this);
    };
    BaseFiliFilterBlock.prototype.announceFrequencyHzOutput = function (number) {
        replaceImplementation.call(this);
        FrequencyHzEmitterMixin.prototype.announceFrequencyHzOutput.call(this, number);
    };
    BaseFiliFilterBlock.prototype.announceResonanceOutput = function (number) {
        replaceImplementation.call(this);
        ResonanceEmitterMixin.prototype.announceResonanceOutput.call(this, number);
    };
    BaseFiliFilterBlock.prototype.announceSampleRateOutput = function (number) {
        replaceImplementation.call(this);
        SampleRateEmitterMixin.prototype.announceSampleRateOutput.call(this, number);
    };
    BaseFiliFilterBlock.prototype.onSamplesInput = function (sample) {
        this.buffer.push(sample);
        Base.prototype.onSamplesInput.call(this, sample);
    };
    BaseFiliFilterBlock.prototype.produceSample = function (input) { //a number
        var ret = this.implementation ?
            this.implementation.singleStep(input)
            :
            0;
        if (!lib.isNumber(ret)) {
            console.log('Filter NaN');
            return 0;
        }
        return ret;
    };

    BaseFiliFilterBlock.prototype.createImplementation = function () {
        //this.frequencyHz has the actual value
        //this.resonance has the actual value
        throw new lib.Error('NOT_IMPLEMENTED', this.constructor.name+' has to implement createImplementation');
    };
    require('./implementationhandlercreator')(lib, BaseFiliFilterBlock);

    //static methods
    function replaceImplementation () {
        purgeImplementation.call(this);
        this.handleImplementation(this.createImplementation());
    }
    function purgeImplementation () {
        this.implementation = null; //TODO: maybe destroy?
    }
    //endof static methods

    mylib.BaseFiliFilter = BaseFiliFilterBlock;

    require('./iirfilters')(lib, templateslib, mylib);

}
module.exports = createFiliFilters;