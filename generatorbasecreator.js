function createBaseGenerator (lib, mylib) {
    'use strict';

    var MyBase = mylib.SampleProducerBase;
    var ClockListenerMixin = mylib.mixins.ClockListener;
    var SamplesEmitterMixin = mylib.mixins.SamplesEmitter;


    function GeneratorBaseBlock () {
        MyBase.call(this);
        ClockListenerMixin.call(this);
        SamplesEmitterMixin.call(this, 440);
    }
    lib.inherit(GeneratorBaseBlock, MyBase);
    ClockListenerMixin.addMethods(GeneratorBaseBlock);
    SamplesEmitterMixin.addMethods(GeneratorBaseBlock);
    GeneratorBaseBlock.prototype.destroy = function () {
        SamplesEmitterMixin.prototype.destroy.call(this);
        ClockListenerMixin.prototype.destroy.call(this);
        MyBase.prototype.destroy.call(this);
    };

    GeneratorBaseBlock.prototype.onClockInput = function (clock) {
        this.setSamples(this.generateSample(clock) * this.volume);
    };

    GeneratorBaseBlock.prototype.generateSample = function (clockinput) {
        throw new lib.Error('NOT_IMPLEMENTED', this.constructor.name+' has to implement generateSample');
    };

    mylib.GeneratorBase = GeneratorBaseBlock;
}
module.exports = createBaseGenerator;