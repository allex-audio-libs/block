function createMutatableGenerator (lib, mylib) {
    'use strict';

    var MyBase = mylib.PeriodicGenerator;
    var GeneratorTypeEmitterMixin = mylib.mixins.requestChannelMixin('GeneratorType', 'string', true);
    var GeneratorTypeListenerMixin = mylib.mixins.requestChannelMixin('GeneratorType', 'string', false);
    

    function MutatablePeriodicGeneratorBlock () {
        MyBase.call(this);
        GeneratorTypeEmitterMixin.call(this, 'Saw');
        GeneratorTypeListenerMixin.call(this);
        this.internalGenerator = null;
        this.assigner = assignMyPropertiesToInternal.bind(this);
    }
    lib.inherit(MutatablePeriodicGeneratorBlock, MyBase);
    GeneratorTypeEmitterMixin.addMethods(MutatablePeriodicGeneratorBlock);
    GeneratorTypeListenerMixin.addMethods(MutatablePeriodicGeneratorBlock);
    MutatablePeriodicGeneratorBlock.prototype.destroy = function () {
        this.assigner = null;
        if (this.internalGenerator) {
            this.internalGenerator.destroy();
        }
        this.internalGenerator = null;
        GeneratorTypeListenerMixin.prototype.destroy.call(this);
        GeneratorTypeEmitterMixin.prototype.destroy.call(this);
        MyBase.prototype.destroy.call(this);
    };
    MutatablePeriodicGeneratorBlock.prototype.generateSample = function (clockinput) {
        var generatorclassname;
        if (!this.internalGenerator && this.generatorType) {            
            generatorclassname = this.generatorType+'Generator';
            if (lib.isFunction(mylib[generatorclassname])) {
                this.internalGenerator = new mylib[generatorclassname]();
                lib.traverseShallow(this, this.assigner);
            }
        }
        return this.internalGenerator ? this.internalGenerator.generateSample(clockinput) : 0;
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