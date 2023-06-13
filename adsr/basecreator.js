function creteADSRBase (lib, bufferlib, eventlib, timerlib, templateslib, mylib) {
    'use strict';

    var MyBase = mylib.Base;
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

    //formula:
    //{
    //    a: time
    //    d: time
    //    s: value [0, 1]
    //    r: time
    //}

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

    function ADSRBaseBlock () {
        MyBase.call(this);
        TriggerEmitterMixin.call(this, 0);
        TriggerListenerMixin.call(this);
        this.isOn = false;
    }
    lib.inherit(ADSRBaseBlock, MyBase);
    TriggerEmitterMixin.addMethods(ADSRBaseBlock);
    TriggerListenerMixin.addMethods(ADSRBaseBlock);
    ADSRBaseBlock.prototype.destroy = function () {
        this.isOn = null;
        TriggerListenerMixin.prototype.destroy.call(this);
        TriggerEmitterMixin.prototype.destroy.call(this);
        MyBase.prototype.destroy.call(this);
    };
    ADSRBaseBlock.prototype.setTrigger = function (number) {
        if (number == this.trigger) {
            TriggerEmitterMixin.prototype.setTrigger.call(this, number);
            return;
        }
        this.isOn = !this.isOn;
        this[this.isOn ? 'handleTriggerOn' : 'handleTriggerOff']();
        TriggerEmitterMixin.prototype.setTrigger.call(this, number);
    };
    ADSRBaseBlock.prototype.handleTriggerOn = function () {
        throw new lib.Error('NOT_IMPLEMENTED', this.constructor.name+' must implement handleTriggerOn');
    };
    ADSRBaseBlock.prototype.handleTriggerOff = function () {
        throw new lib.Error('NOT_IMPLEMENTED', this.constructor.name+' must implement handleTriggerOff');
    };

    mylib.ADSRBase = ADSRBaseBlock;
}
module.exports = creteADSRBase;