function createFilters (lib, templateslib, mylib) {
    'use strict';

    var Base = mylib.SampleProducerBase;
    var FrequencyHzEmitterMixin = mylib.mixins.FrequencyHzEmitter;
    var FrequencyHzListenerMixin = mylib.mixins.FrequencyHzListener;
    var ResonanceEmitterMixin = mylib.mixins.ResonanceEmitter;
    var ResonanceListenerMixin = mylib.mixins.ResonanceListener;

    function FilterBaseBlock () {
        Base.call(this);
        FrequencyHzEmitterMixin.call(this, 440);
        FrequencyHzListenerMixin.call(this);
        ResonanceEmitterMixin.call(this, 440);
        ResonanceListenerMixin.call(this);
    }
    lib.inherit(FilterBaseBlock, Base);
    FrequencyHzEmitterMixin.addMethods(FilterBaseBlock);
    FrequencyHzListenerMixin.addMethods(FilterBaseBlock);
    ResonanceEmitterMixin.addMethods(FilterBaseBlock);
    ResonanceListenerMixin.addMethods(FilterBaseBlock);
    FilterBaseBlock.prototype.destroy = function () {
        ResonanceListenerMixin.prototype.destroy.call(this);
        ResonanceEmitterMixin.prototype.destroy.call(this);
        FrequencyHzListenerMixin.prototype.destroy.call(this);
        FrequencyHzEmitterMixin.prototype.destroy.call(this);
        Base.prototype.destroy.call(this);
    };

    mylib.FilterBase = FilterBaseBlock;

    require('./filifilters')(lib, templateslib, mylib);
}
module.exports = createFilters;