var pi = Math.atan(1)*4;

function createPeriodicGenerator (lib, eventlib, mylib) {
    'use strict';

    var MyBase = mylib.GeneratorBase;
    var FrequencyHzEmitterMixin = mylib.mixins.FrequencyHzEmitter;
    var FrequencyHzListenerMixin = mylib.mixins.FrequencyHzListener;
    var FrequencyHzModulationEmitterMixin = mylib.mixins.FrequencyHzModulationEmitter;
    var FrequencyHzModulationListenerMixin = mylib.mixins.FrequencyHzModulationListener;
    var PhaseEmitterMixin = mylib.mixins.PhaseEmitter;
    var PhaseListenerMixin = mylib.mixins.PhaseListener;

    function PeriodicGeneratorBlock () {
        MyBase.call(this);
        FrequencyHzEmitterMixin.call(this, 440);
        FrequencyHzListenerMixin.call(this);
        FrequencyHzModulationEmitterMixin.call(this, 0);
        FrequencyHzModulationListenerMixin.call(this);
        PhaseEmitterMixin.call(this, 0);
        PhaseListenerMixin.call(this);
    }
    lib.inherit(PeriodicGeneratorBlock, MyBase);
    FrequencyHzEmitterMixin.addMethods(PeriodicGeneratorBlock);
    FrequencyHzListenerMixin.addMethods(PeriodicGeneratorBlock);
    FrequencyHzModulationEmitterMixin.addMethods(PeriodicGeneratorBlock);
    FrequencyHzModulationListenerMixin.addMethods(PeriodicGeneratorBlock);
    PhaseEmitterMixin.addMethods(PeriodicGeneratorBlock);
    PhaseListenerMixin.addMethods(PeriodicGeneratorBlock);
    PeriodicGeneratorBlock.prototype.destroy = function () {
        PhaseListenerMixin.prototype.destroy.call(this);
        PhaseEmitterMixin.prototype.destroy.call(this);
        FrequencyHzModulationListenerMixin.prototype.destroy.call(this);
        FrequencyHzModulationEmitterMixin.prototype.destroy.call(this);
        FrequencyHzListenerMixin.prototype.destroy.call(this);
        FrequencyHzEmitterMixin.prototype.destroy.call(this);
        MyBase.prototype.destroy.call(this);
    };
    PeriodicGeneratorBlock.prototype.naturalFrequency = function () {
        var finalfhz = this.frequencyHz * (2**(this.frequencyHzModulation));
        return finalfhz * 2 * pi;
    };
    PeriodicGeneratorBlock.prototype.period = function () {
        return 1/this.frequencyHz;
    };
    PeriodicGeneratorBlock.prototype.periodicClockFromClock = function (clock) {
        return clock % this.period();
        /* this is the "by foot" implementation of modulo
        var p = this.period();
        var th = clock;
        while (th>0) {
            th -= p;
        }
        return th+p; //surely in the [0, period] range
        */
    };
    
    mylib.PeriodicGenerator = PeriodicGeneratorBlock;
}
module.exports = createPeriodicGenerator;
