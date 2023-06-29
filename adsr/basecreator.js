function creteADSRBase (lib, bufferlib, eventlib, timerlib, templateslib, mylib) {
    'use strict';

    var MyBase = mylib.Base;
    var ClockListenerMixin = mylib.mixins.requestChannelMixin({
        name: 'Clock',
        type: 'number',
        cbm: 'differential',
        emitter: false
    });
    var TriggerEmitterMixin = mylib.mixins.requestChannelMixin({
        name: 'Trigger',
        type: 'number',
        cbm: 'differential',
        emitter: true
    });
    var TriggerListenerMixin = mylib.mixins.requestChannelMixin({
        name: 'Trigger',
        type: 'number',
        cbm: 'differential',
        emitter: false
    });
    var AEmitterMixin = mylib.mixins.requestChannelMixin({
        name: 'A',
        type: 'number',
        cbm: 'differential',
        emitter: true
    });
    var AListenerMixin = mylib.mixins.requestChannelMixin({
        name: 'A',
        type: 'number',
        cbm: 'differential',
        emitter: false
    });
    var DEmitterMixin = mylib.mixins.requestChannelMixin({
        name: 'D',
        type: 'number',
        cbm: 'differential',
        emitter: true
    });
    var DListenerMixin = mylib.mixins.requestChannelMixin({
        name: 'D',
        type: 'number',
        cbm: 'differential',
        emitter: false
    });
    var SEmitterMixin = mylib.mixins.requestChannelMixin({
        name: 'S',
        type: 'number',
        cbm: 'differential',
        emitter: true
    });
    var SListenerMixin = mylib.mixins.requestChannelMixin({
        name: 'S',
        type: 'number',
        cbm: 'differential',
        emitter: false
    });
    var REmitterMixin = mylib.mixins.requestChannelMixin({
        name: 'R',
        type: 'number',
        cbm: 'differential',
        emitter: true
    });
    var RListenerMixin = mylib.mixins.requestChannelMixin({
        name: 'R',
        type: 'number',
        cbm: 'differential',
        emitter: false
    });

    //formula:
    //{
    //    a: time
    //    d: time
    //    s: value [0, 1]
    //    r: time
    //}

    /*
    function ADSRRun (formula) {
        if (!lib.isFunction(formula) && formula.length==1) {
            throw new lib.Error('INVALID_FORMULA', 'Formula must be a function that receives one parameter (clock)');
        }
        this.dyingStarted = null;
        this.duration = null;
        this.formula = formula;
    }
    ADSRRun.prototype.destroy = function () {
        this.duration = null;
        this.dyingStarted = null;
    };
    ADSRRun.prototype.startDying = function (clock) {
        this.dyingStarted = clock;
    };
    ADSRRun.prototype.isDone = function (clock) {
        if (!lib.isNumber(this.dyingStarted)) {
            return false;
        }
        return (this.dyingStarted+this.duration)<clock;
    };
    ADSRRun.prototype.getValue = function (clock) {
        return this.formula(clock);
    };
    */

    function ADSRBaseBlock () {
        MyBase.call(this);
        ClockListenerMixin.call(this);
        TriggerEmitterMixin.call(this, 0);
        TriggerListenerMixin.call(this);
        AEmitterMixin.call(this, 0);
        AListenerMixin.call(this);
        DEmitterMixin.call(this, 0);
        DListenerMixin.call(this);
        SEmitterMixin.call(this, 0);
        SListenerMixin.call(this);
        REmitterMixin.call(this, 0);
        RListenerMixin.call(this);
        this.triggeredVolume = 0;
        this.triggered = null;
        this.released = null;
        this.setVolume(0);
    }
    lib.inherit(ADSRBaseBlock, MyBase);
    ClockListenerMixin.addMethods(ADSRBaseBlock);
    TriggerEmitterMixin.addMethods(ADSRBaseBlock);
    TriggerListenerMixin.addMethods(ADSRBaseBlock);
    AEmitterMixin.addMethods(ADSRBaseBlock);
    AListenerMixin.addMethods(ADSRBaseBlock);
    DEmitterMixin.addMethods(ADSRBaseBlock);
    DListenerMixin.addMethods(ADSRBaseBlock);
    SEmitterMixin.addMethods(ADSRBaseBlock);
    SListenerMixin.addMethods(ADSRBaseBlock);
    REmitterMixin.addMethods(ADSRBaseBlock);
    RListenerMixin.addMethods(ADSRBaseBlock);
    ADSRBaseBlock.prototype.destroy = function () {
        this.released = null;
        this.triggered = null;
        this.triggeredVolume = null;
        RListenerMixin.call(this);
        REmitterMixin.call(this, 0);
        SListenerMixin.call(this);
        SEmitterMixin.call(this, 0);
        DListenerMixin.call(this);
        DEmitterMixin.call(this, 0);
        AListenerMixin.call(this);
        AEmitterMixin.call(this, 0);
        TriggerListenerMixin.prototype.destroy.call(this);
        TriggerEmitterMixin.prototype.destroy.call(this);
        ClockListenerMixin.prototype.destroy.call(this);
        MyBase.prototype.destroy.call(this);
    };
    function mySetVolume (vol) {
        if (vol<0) {
            var a = 5;
            vol = 0;
        }
        if (vol>1) {
            var b = 7;
            vol = 1;
        }
        this.setVolume(vol);
    }
    ADSRBaseBlock.prototype.setClock = function (number) {
        var clock = number*1000; //calculation in msecs, number is in secs
        var newv;
        if (lib.isNumber(this.triggered)) {
            if (this.triggered<0) {
                this.triggered = clock;
            }
            //we're doing the ADS
            if (this.triggered+this.a > clock) {
                //a
                newv = this.triggeredVolume+mylib.ramp((1-this.triggeredVolume)*this.a, clock-this.triggered);
                mySetVolume.call(this, newv);
                return;
            }
            if (this.triggered+this.a+this.d > clock) {
                //d
                newv = mylib.ramp(-this.d, clock-this.triggered-this.a);
                mySetVolume.call(this, newv);
                return;
            }
            //s
            this.setVolume(this.s);
            return;
        }
        if (lib.isNumber(this.released)) {
            //we're doing the R,
            //and should set this.released=null
            //once R period is over
            if (this.released<0) {
                this.released = clock;
            }
            if (this.released+this.r < clock) {
                this.setVolume(0);
                this.released = null;
            }
        }
    };
    ADSRBaseBlock.prototype.announceTriggerOutput = function (number) {
        this.triggered = !!number;
        this[this.triggered ? 'handleTriggerOn' : 'handleTriggerOff'](number);
        TriggerEmitterMixin.prototype.announceTriggerOutput.call(this, number);
    };
    ADSRBaseBlock.prototype.handleTriggerOn = function () {
        this.triggeredVolume = this.volume;
        this.triggered = -1;
        this.released = null;
    };
    ADSRBaseBlock.prototype.handleTriggerOff = function () {
        this.triggered = null;
        this.released = -1;
    };

    mylib.ADSRBase = ADSRBaseBlock;
}
module.exports = creteADSRBase;