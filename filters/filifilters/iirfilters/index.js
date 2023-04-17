var Fili = require('fili');
var iirCalculator = new Fili.CalcCascades();

function createFiliIIRFilters (lib, templateslib, mylib) {
    'use strict';

    var Base = mylib.BaseFiliFilter;

    function IIRFiliFilterBlock () {
        Base.call(this);
    }
    lib.inherit(IIRFiliFilterBlock, BaseFiliFilter);

    IIRFiliFilterBlock.prototype.createImplementation = function () {
        var coeffs = iirCalculator[this.type]({
            order: 3, // <= Resonance must be related to this
            characteristic: this.characteristic,
            Fs: this.sampleRate,
            Fc: this.frequencyHz,
            BW: 1,
            gain: 0,
            preGain: false
        });
        return Fili.IirFilter(coeffs);
    };
}
module.exports = createFiliIIRFilters;