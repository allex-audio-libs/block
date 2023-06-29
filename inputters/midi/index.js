var midi = require('midi');

function createMidiInputter (lib, bufferlib, eventlib, timerlib, templateslib, mylib) {
    'use strict';

    var MyBase = mylib.Base;

    var TriggerEmitterMixin = mylib.mixins.requestChannelMixin({
        name: 'Trigger', 
        type: 'number', 
        cbm: 'differential',
        emitter: true
    });
    var PitchEmitterMixin = mylib.mixins.requestChannelMixin({
        name: 'Pitch', 
        type: 'number', 
        cbm: 'differential',
        emitter: true
    });
    var FrequencyHzEmitterMixin = mylib.mixins.requestChannelMixin({
        name: 'FrequencyHz', 
        type: 'number', 
        cbm: 'differential',
        emitter: true
    });
    var MidiChannelEmitterMixin = mylib.mixins.requestChannelMixin({
        name: 'MidiChannel', 
        type: 'number', 
        cbm: 'differential',
        emitter: true
    });
    var MidiChannelListenerMixin = mylib.mixins.requestChannelMixin({
        name: 'MidiChannel', 
        type: 'number', 
        cbm: 'differential',
        emitter: false
    });

    function MidiInputBlock () {
        this.input = new midi.Input();
        MyBase.call(this);
        MidiChannelEmitterMixin.call(this, -1);
        MidiChannelListenerMixin.call(this);
        TriggerEmitterMixin.call(this, 0);
        PitchEmitterMixin.call(this, -1);
        FrequencyHzEmitterMixin.call(this, -1);
    }
    lib.inherit(MidiInputBlock, MyBase);
    MidiChannelEmitterMixin.addMethods(MidiInputBlock);
    MidiChannelListenerMixin.addMethods(MidiInputBlock);
    TriggerEmitterMixin.addMethods(MidiInputBlock);
    PitchEmitterMixin.addMethods(MidiInputBlock);
    FrequencyHzEmitterMixin.addMethods(MidiInputBlock);
    MidiInputBlock.prototype.destroy = function () {
        FrequencyHzEmitterMixin.prototype.destroy.call(this);
        PitchEmitterMixin.prototype.destroy.call(this);
        TriggerEmitterMixin.prototype.destroy.call(this);
        MidiChannelListenerMixin.prototype.destroy.call(this);
        MidiChannelEmitterMixin.prototype.destroy.call(this);
        Base.prototype.destroy.call(this);
        if (this.input) {
            this.input.closePort();
        }
        this.input = null;
    };
    MidiInputBlock.prototype.announceMidiChannelOutput = function (number) {
        this.input.openPort(0);
        this.input.ignoreTypes(false, false, false);
        this.input.on('message', this.myOnMidiInput.bind(this));
        MidiChannelEmitterMixin.prototype.announceMidiChannelOutput.call(this);
    };

    MidiInputBlock.prototype.myOnMidiInput = function (deltatime, midimessage) {
        if (!lib.isArray(midimessage)) {
            return;
        }
        if (midimessage.length == 3) {
            if (midimessage[0] == 128) {
                this.setTrigger(0);
            }
            if (midimessage[0] == 144) {
                this.setTrigger(1);
            }
            this.setPitch(midimessage[1]);
            this.setFrequencyHz(pitch2frequencyhz[midimessage[1]] || 440);
        }
    };


    var pitch2frequencyhz = [
        8.18,
        8.66,
        9.18,
        9.72,
        10.3,
        10.91,
        11.56,
        12.25,
        12.98,
        13.75,
        14.57,
        15.43,
        16.35,
        17.32,
        18.35,
        19.45,
        20.6,
        21.83,
        23.12,
        24.5,
        25.96,
        27.5,
        29.14,
        30.87,
        32.7,
        34.65,
        36.71,
        38.89,
        41.2,
        43.65,
        46.25,
        49,
        51.91,
        55,
        58.27,
        61.74,
        65.41,
        69.3,
        73.42,
        77.78,
        82.41,
        87.31,
        92.5,
        98,
        103.83,
        110,
        116.54,
        123.47,
        130.81,
        138.59,
        146.83,
        155.56,
        164.81,
        174.61,
        185,
        196,
        207.65,
        220,
        233.08,
        246.94,
        261.63,
        277.18,
        293.66,
        311.13,
        329.63,
        349.23,
        369.99,
        392,
        415.3,
        440,
        466.16,
        493.88,
        523.25,
        554.37,
        587.33,
        622.25,
        659.26,
        698.46,
        739.99,
        783.99,
        830.61,
        880,
        932.33,
        987.77,
        1046.50,
        1108.73,
        1174.66,
        1244.51,
        1318.51,
        1396.91,
        1479.98,
        1567.98,
        1661.22,
        1760,
        1864.66,
        1975.53,
        2093,
        2217.46,
        2349.32,
        2489.02,
        2637.02,
        2793.83,
        2959.96,
        3135.96,
        3322.44,
        3520,
        3729.31,
        3951.07,
        4186.01,
        4434.92,
        4698.64,
        4978.03,
        5274.04,
        5587.65,
        5919.91,
        6271.93,
        6644.88,
        7040,
        7458.62,
        7902.13,
        8372.02,
        8869.84,
        9397.27,
        9956.06,
        10548.08,
        11175.3,
        11839.82,
        12543.58,
        13289.75
    ];


    mylib.MidiInput = MidiInputBlock;
}
module.exports = createMidiInputter;