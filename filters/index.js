function createFilters (lib, bufferlib, templateslib, mylib) {
    'use strict';

    var Base = mylib.SampleProducerBase;
    var SamplesEmitterMixin = mylib.mixins.SamplesEmitter;
    var SamplesListenerMixin = mylib.mixins.SamplesListener;
    var FrequencyHzEmitterMixin = mylib.mixins.FrequencyHzEmitter;
    var FrequencyHzListenerMixin = mylib.mixins.FrequencyHzListener;
    var ResonanceEmitterMixin = mylib.mixins.ResonanceEmitter;
    var ResonanceListenerMixin = mylib.mixins.ResonanceListener;

    function FilterBaseBlock () {
        Base.call(this);
        SamplesEmitterMixin.call(this, 0);
        SamplesListenerMixin.call(this);
        FrequencyHzEmitterMixin.call(this, 1000);
        FrequencyHzListenerMixin.call(this);
        ResonanceEmitterMixin.call(this, 0);
        ResonanceListenerMixin.call(this);
    }
    lib.inherit(FilterBaseBlock, Base);
    SamplesEmitterMixin.addMethods(FilterBaseBlock);
    SamplesListenerMixin.addMethods(FilterBaseBlock);
    FrequencyHzEmitterMixin.addMethods(FilterBaseBlock);
    FrequencyHzListenerMixin.addMethods(FilterBaseBlock);
    ResonanceEmitterMixin.addMethods(FilterBaseBlock);
    ResonanceListenerMixin.addMethods(FilterBaseBlock);
    FilterBaseBlock.prototype.destroy = function () {
        ResonanceListenerMixin.prototype.destroy.call(this);
        ResonanceEmitterMixin.prototype.destroy.call(this);
        FrequencyHzListenerMixin.prototype.destroy.call(this);
        FrequencyHzEmitterMixin.prototype.destroy.call(this);
        SamplesListenerMixin.prototype.destroy.call(this);
        SamplesEmitterMixin.prototype.destroy.call(this);
        Base.prototype.destroy.call(this);
    };
    FilterBaseBlock.prototype.onSamplesInput = function (sample) {
        this.setSamples(this.produceSample(sample)*this.volume);
    };

    mylib.FilterBase = FilterBaseBlock;

    require('./filifilters')(lib, bufferlib, templateslib, mylib);
}
module.exports = createFilters;