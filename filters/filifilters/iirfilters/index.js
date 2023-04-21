var Fili = require('fili');
var iirCalculator = new Fili.CalcCascades();

function createFiliIIRFilters (lib, templateslib, mylib) {
    'use strict';

    var Base = mylib.BaseFiliFilter;

    function BilinearIIRFiliFilterBlock () {
        Base.call(this);
    }
    lib.inherit(BilinearIIRFiliFilterBlock, Base);

    BilinearIIRFiliFilterBlock.prototype.createImplementation = function () {
        var coeffs = iirCalculator[this.type]({
            order: Math.floor(this.resonance*12), // <= Resonance must be related to this, Markert says 12 is max
            characteristic: this.characteristic,
            Fs: this.sampleRate,
            Fc: this.frequencyHz,
            BW: 1,
            gain: 0,
            preGain: false
        });
        return Fili.IirFilter(coeffs);
    };
    //all BilinearIIRFiliFilters just have to put appropriate 'type' and 'characteristic' in their prototypes

    function produceChildIIR (type, characteristic) {
        var codename = 'BilinearIIRFili'+characteristic+type+'Filter';
        var classname = codename+'Block';
        var body = templateslib.process({
            template: [
                "function CLASSNAME () {",
                "\tBilinearIIRFiliFilterBlock.call(this);",
                "}",
                "lib.inherit(CLASSNAME, BilinearIIRFiliFilterBlock);",
                "CLASSNAME.prototype.type = 'TYPE';",
                "CLASSNAME.prototype.characteristic = 'CHARACTERISTIC';",
                "mylib.CODENAME = CLASSNAME;"
            ].join('\n'),
            replacements: {
                CODENAME: codename,
                CLASSNAME: classname,
                TYPE: type.toLowerCase(),
                CHARACTERISTIC: characteristic.toLowerCase()
            }
        });
        eval (body);
    }

    var types = [
        'Lowpass',
        'Highpass',
        'Bandpass',
        'Bandstop',
        'Peak',
        'Lowshelf',
        'Highshelf',
        'Aweighting'
    ];
    var characteristics = ['Bessel', 'Butterworth'];

    function characteristicandtyper (type, characteristic) {
        produceChildIIR(type, characteristic);
    }
    function typer (type) {
        characteristics.forEach(characteristicandtyper.bind(null, type));
        type = null;
    }
    types.forEach(typer);
}
module.exports = createFiliIIRFilters;