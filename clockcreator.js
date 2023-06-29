function createClockBlock (lib, timerlib, eventlib, mylib) {
    'use strict';

    var MyBase = mylib.SampleProducerBase;
    var SampleRateEmitterMixin = mylib.mixins.SampleRateEmitter;
    var SampleRateListenerMixin = mylib.mixins.SampleRateListener;
    var ClockEmitterMixin = mylib.mixins.ClockEmitter;

    var _JSClockPeriod = 10;

    function ClockBlock () {
        MyBase.call(this);
        SampleRateEmitterMixin.call(this, 0);
        SampleRateListenerMixin.call(this);
        ClockEmitterMixin.call(this, 0);
        this.lastCall = lib.now();
        this.lastSampleTime = this.lastCall;
        this.timer = new timerlib.Timer(this.onTimer.bind(this), _JSClockPeriod, true);
    }
    lib.inherit(ClockBlock, MyBase);
    SampleRateEmitterMixin.addMethods(ClockBlock);
    SampleRateListenerMixin.addMethods(ClockBlock);
    ClockEmitterMixin.addMethods(ClockBlock);
    ClockBlock.prototype.destroy = function () {
        if (this.timer) {
            this.timer.destroy();
        }
        this.timer = null;
        this.lastSampleTime = null;
        this.lastCall = null;
        ClockEmitterMixin.prototype.destroy.call(this);
        SampleRateListenerMixin.prototype.destroy.call(this);
        SampleRateEmitterMixin.prototype.destroy.call(this);
        MyBase.prototype.destroy.call(this);
    };

    ClockBlock.prototype.onTimer = function () {
        if (!this.sampleRate) {
            return;
        }
        if (!this.hasClockOutput) {
            return;
        }
        var now = lib.now();
        var intersampleperiod = 1000/this.sampleRate;
        var lastsmptm = this.lastSampleTime;
        while (lastsmptm < now) {
            this.hasClockOutput.fire(lastsmptm/1000);
            lastsmptm += intersampleperiod;
        }
        this.lastSampleTime = lastsmptm;
        this.lastCall = now;
    };


    mylib.Clock = ClockBlock;
}
module.exports = createClockBlock;