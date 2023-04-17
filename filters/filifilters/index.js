function createFiliFilters (lib, templateslib, mylib) {
    'use strict';

    require('./iirfilters')(lib, templateslib, mylib);

    var Base = mylib.FilterBase;
    var SampleRateEmitterMixin = mylib.mixins.SampleRateEmitter;
    var SampleRateListenerMixin = mylib.mixins.SampleRateListener;

    var FrequencyHzEmitterMixin = mylib.mixins.FrequencyHzEmitter;
    var ResonanceEmitterMixin = mylib.mixins.ResonanceEmitter;

    function BaseFiliFilterBlock () {
        Base.call(this);
        SampleRateEmitterMixin.call(this, 0);
        SampleRateListenerMixin.call(this);
        this.implementation = null;
    }
    lib.inherit(BaseFiliFilterBlock, Base);
    BaseFiliFilterBlock.prototype.destroy = function () {
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

    BaseFiliFilterBlock.prototype.createImplementation = function () {
        //this.frequencyHz has the actual value
        //this.resonance has the actual value
        throw new lib.Error('NOT_IMPLEMENTED', this.constructor.name+' has to implement createImplementation');
    };

    //static methods
    function replaceImplementation () {
        purgeImplementation.call(this);
        this.implementation = this.createImplementation();
    }
    function purgeImplementation () {
        this.implementation = null; //TODO: maybe destroy?
    }
    //endof static methods

    mylib.BaseFiliFilter = BaseFiliFilterBlock;
}
module.exports = createFiliFilters;