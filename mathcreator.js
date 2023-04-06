function createMathBlock (lib, mylib) {
    'use strict';

    var MyBase = mylib.Base;
    var MathEmitterMixin = mylib.mixins.MathEmitter,
        MathListenerMixin = mylib.mixins.MathListener,
        Math1EmitterMixin = mylib.mixins.Math1Emitter,
        Math1ListenerMixin = mylib.mixins.Math1Listener,
        Math2EmitterMixin = mylib.mixins.Math2Emitter,
        Math2ListenerMixin = mylib.mixins.Math2Listener;

    function MathBlock () {
        if (!lib.isFunction(this.formula)) {
            throw new lib.Error('FORMULA_NOT_A_FUNCTION', this.constructor.name+' must have a formula (Function) in its prototype')
        }
        MyBase.call(this);
    }
    lib.inherit(MathBlock, MyBase);
    MathBlock.prototype.formula = null;

    function UnaryMathBlock () {
        MathBlock.call(this);
        MathEmitterMixin.call(this, 0);
        MathListenerMixin.call(this);
    }
    lib.inherit(UnaryMathBlock, MathBlock);
    MathEmitterMixin.addMethods(UnaryMathBlock);
    MathListenerMixin.addMethods(UnaryMathBlock);
    UnaryMathBlock.prototype.destroy = function () {
        MathListenerMixin.prototype.destroy.call(this);
        MathEmitterMixin.prototype.destroy.call(this);
        MathBlock.prototype.destroy.call(this);
    };
    UnaryMathBlock.prototype.onMathInput = function (input) {
        this.setMath(this.formula(input));
    };
    mylib.UnaryMath = UnaryMathBlock;


    function MinusOnePlusOneToZeroPlusOneBlock () {
        UnaryMathBlock.call(this);
    }
    lib.inherit(MinusOnePlusOneToZeroPlusOneBlock, UnaryMathBlock);
    MinusOnePlusOneToZeroPlusOneBlock.prototype.formula = function (input) {
        return (input+1)/2;
    }
    mylib.MinusOnePlusOneToZeroPlusOne = MinusOnePlusOneToZeroPlusOneBlock;


    function BinaryMathBlock () {
        MathBlock.call(this);
        MathEmitterMixin.call(this, 0);
        Math1EmitterMixin.call(this, 0);
        Math2EmitterMixin.call(this, 0);
        Math1ListenerMixin.call(this);
        Math2ListenerMixin.call(this);
    }
    lib.inherit(BinaryMathBlock, MathBlock);
    MathEmitterMixin.addMethods(BinaryMathBlock);
    Math1EmitterMixin.addMethods(BinaryMathBlock);
    Math2EmitterMixin.addMethods(BinaryMathBlock);
    Math1ListenerMixin.addMethods(BinaryMathBlock);
    Math2ListenerMixin.addMethods(BinaryMathBlock);
    BinaryMathBlock.prototype.destroy = function () {
        Math2ListenerMixin.prototype.destroy.call(this);
        Math1ListenerMixin.prototype.destroy.call(this);
        Math2EmitterMixin.prototype.destroy.call(this);
        Math1EmitterMixin.prototype.destroy.call(this);
        MathEmitterMixin.prototype.destroy.call(this);
        MathBlock.prototype.destroy.call(this);
    };
    BinaryMathBlock.prototype.onMath1Input = function (number) {
        Math1ListenerMixin.prototype.onMath1Input.call(this, number);
        this.setMath(this.formula(this.math1, this.math2));
    };
    BinaryMathBlock.prototype.onMath2Input = function (number) {
        Math2ListenerMixin.prototype.onMath2Input.call(this, number);
        this.setMath(this.formula(this.math1, this.math2));
    };
    mylib.BinaryMath = BinaryMathBlock;

    function MultiplierBlock () {
        BinaryMathBlock.call(this);
    }
    lib.inherit(MultiplierBlock, BinaryMathBlock);
    MultiplierBlock.prototype.formula = function (input1, input2) {
        return input1*input2;
    };
    mylib.Multiplier = MultiplierBlock;    
}
module.exports = createMathBlock;