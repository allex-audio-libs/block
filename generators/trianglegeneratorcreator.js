function createTriangleGenerator (lib, mylib) {
    'use strict';

    var MyBase = mylib.PeriodicGenerator;
    var PulseWidthEmitterMixin = mylib.mixins.PulseWidthEmitter;
    var PulseWidthListenerMixin = mylib.mixins.PulseWidthListener;

    function TriangleGeneratorBlock () {
        MyBase.call(this);
        PulseWidthEmitterMixin.call(this, 0.5);
        PulseWidthListenerMixin.call(this);
    }
    lib.inherit(TriangleGeneratorBlock, MyBase);
    PulseWidthEmitterMixin.addMethods(TriangleGeneratorBlock);
    PulseWidthListenerMixin.addMethods(TriangleGeneratorBlock);
    TriangleGeneratorBlock.prototype.destroy = function () {
        PulseWidthListenerMixin.prototype.destroy.call(this);
        PulseWidthEmitterMixin.prototype.destroy.call(this);
        MyBase.prototype.destroy.call(this);
    };
    TriangleGeneratorBlock.prototype.generateSample = function (clockinput) {
        var p = this.period();
        var asctime = p*this.pulseWidth;
        var desctime = p-asctime;
        var currtime = this.periodicClockFromClock(clockinput);
        var duration = currtime <= asctime ? asctime : -desctime;
        var time = currtime <= asctime ? currtime : currtime-asctime;
        //console.log(this.period(), ret);
        return -1+2*mylib.ramp(duration, time);
    };

    mylib.TriangleGenerator = TriangleGeneratorBlock;
}
module.exports = createTriangleGenerator;