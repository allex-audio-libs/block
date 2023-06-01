function createMutatableGenerator (lib, mylib) {
    'use strict';

    var MyBase = mylib.GeneratorBase;
    var GeneratorTypeEmitterMixin = mylib.mixins.requestChannelMixin('GeneratorType', 'string', true);
    var GeneratorTypeListenerMixin = mylib.mixins.requestChannelMixin('GeneratorType', 'string', false);
    

    function MutatableGeneratorBlock () {
        MyBase.call(this);
        GeneratorTypeEmitterMixin.call(this, '');
        GeneratorTypeListenerMixin.call(this);
        this.internalGenerator = null;
    }
    lib.inherit(MutatableGeneratorBlock, MyBase);
    GeneratorTypeEmitterMixin.addMethods(MutatableGeneratorBlock);
    GeneratorTypeListenerMixin.addMethods(MutatableGeneratorBlock);
    MutatableGeneratorBlock.prototype.destroy = function () {
        if (this.internalGenerator) {
            this.internalGenerator.destroy();
        }
        this.internalGenerator = null;
        GeneratorTypeListenerMixin.prototype.destroy.call(this);
        GeneratorTypeEmitterMixin.prototype.destroy.call(this);
        MyBase.prototype.destroy.call(this);
    };
    MutatableGeneratorBlock.prototype.generateSample = function (clockinput) {
        if (!this.internalGenerator && this.GeneratorType) {
            var a = 5;
        }
        return this.internalGenerator ? this.internalGenerator.generateSample(clockinput) : 0;
    };

    mylib.MutatableGenerator = MutatableGeneratorBlock;
}
module.exports = createMutatableGenerator;