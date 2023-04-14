function createSawGenerator (lib, mylib) {
    'use strict';

    var MyBase = mylib.PeriodicGenerator;

    function SawGeneratorBlock () {
        MyBase.call(this);
    }
    lib.inherit(SawGeneratorBlock, MyBase);
    SawGeneratorBlock.prototype.destroy = function () {
        MyBase.prototype.destroy.call(this);
    };
    SawGeneratorBlock.prototype.generateSample = function (clockinput) {
        var ret = this.periodicClockFromClock(clockinput);
        //console.log(this.period(), ret);
        return -1+2*(ret/this.period());
    };

    mylib.SawGenerator = SawGeneratorBlock;
}
module.exports = createSawGenerator;