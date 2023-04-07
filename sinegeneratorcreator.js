function createSineGenerator (lib, mylib) {
    'use strict';

    var MyBase = mylib.PeriodicGenerator;

    function SineGeneratorBlock () {
        MyBase.call(this);
    }
    lib.inherit(SineGeneratorBlock, MyBase);
    SineGeneratorBlock.prototype.destroy = function () {
        MyBase.prototype.destroy.call(this);
    };
    SineGeneratorBlock.prototype.generateSample = function (clockinput) {
        var ret = Math.sin(clockinput*this.naturalFrequency()+this.phase);
        return ret;
    };

    mylib.SineGenerator = SineGeneratorBlock;
}
module.exports = createSineGenerator;