function createSquareGenerator (lib, mylib) {
    'use strict';

    var MyBase = mylib.PeriodicGenerator;
    var PulseWidthEmitterMixin = mylib.mixins.PulseWidthEmitter;
    var PulseWidthListenerMixin = mylib.mixins.PulseWidthListener;

    function SquareGeneratorBlock () {
        MyBase.call(this);
        PulseWidthEmitterMixin.call(this, 0.5);
        PulseWidthListenerMixin.call(this);
    }
    lib.inherit(SquareGeneratorBlock, MyBase);
    PulseWidthEmitterMixin.addMethods(SquareGeneratorBlock);
    PulseWidthListenerMixin.addMethods(SquareGeneratorBlock);
    SquareGeneratorBlock.prototype.destroy = function () {
        PulseWidthListenerMixin.prototype.destroy.call(this);
        PulseWidthEmitterMixin.prototype.destroy.call(this);
        MyBase.prototype.destroy.call(this);
    };
    SquareGeneratorBlock.prototype.generateSample = function (clockinput) {
        var p = this.period();
        var th = this.periodicClockFromClock(clockinput);
        var pw = this.pulseWidth;
        var threshold = p*this.pulseWidth;
        var ret = (th <= threshold) ? 1 : -1;
        return ret/2;
    };

    mylib.SquareGenerator = SquareGeneratorBlock;
}
module.exports = createSquareGenerator;