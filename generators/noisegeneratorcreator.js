function createNoiseGenerator (lib, mylib) {
    'use strict';

    var MyBase = mylib.GeneratorBase;

    function NoiseGeneratorBlock () {
        MyBase.call(this);
    }
    lib.inherit(NoiseGeneratorBlock, MyBase);
    NoiseGeneratorBlock.prototype.destroy = function () {
        MyBase.prototype.destroy.call(this);
    };
    NoiseGeneratorBlock.prototype.generateSample = function (clockinput) {
        return (Math.random()*2)-1;
    };
    
    mylib.NoiseGenerator = NoiseGeneratorBlock;
}
module.exports = createNoiseGenerator;
