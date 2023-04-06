function createSampleProducerBase (lib, bufferlib, eventlib, mylib) {
    'use strict';

    var Base = mylib.Base;

    function SampleProducerBlockBase () {
        Base.call(this);
        this.hasSamplesOutput = new eventlib();
    }
    lib.inherit(SampleProducerBlockBase, Base);
    SampleProducerBlockBase.prototype.destroy = function () {
        if (this.hasSamplesOutput) {
            this.hasSamplesOutput.destroy();
        }
        this.hasSamplesOutput = null;
        Base.prototype.destroy.call(this);
    };

    SampleProducerBlockBase.prototype.produceSample = function (input) { //a number
        throw new lib.Error('NOT_IMPLEMENTED', this.constructor.name+' has to implement produceSample');
    };


    mylib.SampleProducerBase = SampleProducerBlockBase;
}
module.exports = createSampleProducerBase;