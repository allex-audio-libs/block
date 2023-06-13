function createMutatableGenerator (lib, mylib) {
    'use strict';

    var MyBase = mylib.PeriodicGenerator;
    var GeneratorTypeEmitterMixin = mylib.mixins.requestChannelMixin({
        name: 'GeneratorType',
        type:'string', 
        cbm: 'differential',
        emitter: true
    });
    var GeneratorTypeListenerMixin = mylib.mixins.requestChannelMixin({
        name: 'GeneratorType',
        type:'string', 
        cbm: 'differential',
        emitter: false
    });
    

    function MutatablePeriodicGeneratorBlock () {
        MyBase.call(this);
        this.internalGenerator = null;
        this.assigner = assignMyPropertiesToInternal.bind(this);
        GeneratorTypeEmitterMixin.call(this, 'Saw');
        GeneratorTypeListenerMixin.call(this);
    }
    lib.inherit(MutatablePeriodicGeneratorBlock, MyBase);
    GeneratorTypeEmitterMixin.addMethods(MutatablePeriodicGeneratorBlock);
    GeneratorTypeListenerMixin.addMethods(MutatablePeriodicGeneratorBlock);
    MutatablePeriodicGeneratorBlock.prototype.destroy = function () {
        GeneratorTypeListenerMixin.prototype.destroy.call(this);
        GeneratorTypeEmitterMixin.prototype.destroy.call(this);
        this.assigner = null;
        if (this.internalGenerator) {
            this.internalGenerator.destroy();
        }
        this.internalGenerator = null;
        MyBase.prototype.destroy.call(this);
    };
    MutatablePeriodicGeneratorBlock.prototype.generateSample = function (clockinput) {
        return this.internalGenerator ? this.internalGenerator.generateSample(clockinput) : 0;
    };
    MutatablePeriodicGeneratorBlock.prototype.setGeneratorType = function (text) {
        var generatorclassname;
        if (this.generatorType == text) {
            GeneratorTypeEmitterMixin.prototype.setGeneratorType.call(this, text); //let the mixin do its thing
            return;
        }
        //time to change this.internalGenerator
        if (this.internalGenerator) {
            this.internalGenerator.destroy();
        }
        generatorclassname = text+'Generator';
        if (lib.isFunction(mylib[generatorclassname])) {
            this.internalGenerator = new mylib[generatorclassname]();
            lib.traverseShallow(this, this.assigner);
        }
        GeneratorTypeEmitterMixin.prototype.setGeneratorType.call(this, text); //let the mixin do its thing
    };
    MutatablePeriodicGeneratorBlock.prototype.setFrequencyHz = function (number) {
        if (this.internalGenerator) {
            this.internalGenerator.setFrequencyHz(number);
        }
        MyBase.prototype.setFrequencyHz.call(this, number);
    };
    MutatablePeriodicGeneratorBlock.prototype.setFrequencyHzModulation = function (number) {
        if (this.internalGenerator) {
            this.internalGenerator.setFrequencyHzModulation(number);
        }
        MyBase.prototype.setFrequencyHzModulation.call(this, number);
    };
    MutatablePeriodicGeneratorBlock.prototype.setPhase = function (number) {
        if (this.internalGenerator) {
            this.internalGenerator.setPhase(number);
        }
        MyBase.prototype.setPhase.call(this, number);
    };

    //statics
    function assignMyPropertiesToInternal (value, key) {
        if (!lib.isNumber(value)) {
            return;
        }
        this.internalGenerator['set'+mylib.upperCaseFirst(key)](value);
    }
    //endofstatics

    mylib.MutatablePeriodicGenerator = MutatablePeriodicGeneratorBlock;
}
module.exports = createMutatableGenerator;