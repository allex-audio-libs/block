var midi = require('midi');

function createMidiInputter (lib, bufferlib, eventlib, timerlib, templateslib, mylib) {
    'use strict';

    var MyBase = mylib.Base;
    function anyMixinDescriptor (mastername, index) {
        var name = mastername + (index>0 ? index+'' : '');
        return {
            name: name, 
            type: 'number', 
            cbm: 'differential',
            emitter: true
        };
    }
    function triggerMixinDescriptor (index) {
        return anyMixinDescriptor('Trigger', index);
    }
    function pitchMixinDescriptor (index) {
        return anyMixinDescriptor('Pitch', index);
    }
    function velocityMixinDescriptor (index) {
        return anyMixinDescriptor('Velocity', index);
    }
    function frequencyHzMixinDescriptor (index) {
        return anyMixinDescriptor('FrequencyHz', index);
    }

    var TriggerEmitterMixin = mylib.mixins.requestChannelMixin(triggerMixinDescriptor(0));
    var PitchEmitterMixin = mylib.mixins.requestChannelMixin(pitchMixinDescriptor(0));
    var VelocityEmitterMixin = mylib.mixins.requestChannelMixin(velocityMixinDescriptor(0));
    var FrequencyHzEmitterMixin = mylib.mixins.requestChannelMixin(frequencyHzMixinDescriptor(0));
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

    function channelProducer (channelcount, func, descending) {
        var ret = [];
        var i;
        if (descending) {
            for (i=channelcount-1; i>=0; i--) {
                ret.push(func(i+1));
            }
            return ret;
        }
        for (i=0; i<channelcount; i++) {
            ret.push(func(i+1));
        }
        return ret;
    }
    function channelTemplater (channelcount, func, descending) {
        var ret = templateslib.process({
            template: channelProducer(channelcount, func, descending).join(''),
            replacements: {}
        });
        return ret;
    }

    var _CHANNELCOUNT = 8;
    var polymixins = [{
        t: TriggerEmitterMixin,
        p: PitchEmitterMixin,
        v: VelocityEmitterMixin,
        f: FrequencyHzEmitterMixin
    }];
    var channeldeclarationstring = channelTemplater(_CHANNELCOUNT, function (index) {
        return [
            'polymixins['+index+'] = {',
            '\tt: mylib.mixins.requestChannelMixin(triggerMixinDescriptor('+index+')),',
            '\tp: mylib.mixins.requestChannelMixin(pitchMixinDescriptor('+index+')),',
            '\tv: mylib.mixins.requestChannelMixin(velocityMixinDescriptor('+index+')),',
            '\tf: mylib.mixins.requestChannelMixin(frequencyHzMixinDescriptor('+index+'))',
            '};\n'
        ].join('\n');
    });
    eval(channeldeclarationstring);

    function MidiInputBlock () {
        this.input = new midi.Input();
        MyBase.call(this);
        MidiChannelEmitterMixin.call(this, -1);
        MidiChannelListenerMixin.call(this);
        polymixins[0].t.call(this, 0);
        polymixins[0].p.call(this, -1);
        polymixins[0].v.call(this, -1);
        polymixins[0].f.call(this, -1);
        eval(channelTemplater(_CHANNELCOUNT, function (index) {
            return [
                'polymixins['+index+'].t.call(this, 0);',
                'polymixins['+index+'].p.call(this, -1);',
                'polymixins['+index+'].v.call(this, -1);',
                'polymixins['+index+'].f.call(this, -1);',
            ].join('\n');
        }));
        this.polyChannels=new Array(_CHANNELCOUNT);
    }
    lib.inherit(MidiInputBlock, MyBase);
    MidiChannelEmitterMixin.addMethods(MidiInputBlock);
    MidiChannelListenerMixin.addMethods(MidiInputBlock);
    polymixins[0].t.addMethods(MidiInputBlock);
    polymixins[0].p.addMethods(MidiInputBlock);
    polymixins[0].v.addMethods(MidiInputBlock);
    polymixins[0].f.addMethods(MidiInputBlock);
    eval(channelTemplater(_CHANNELCOUNT, function (index) {
        return [
            'polymixins['+index+'].t.addMethods(MidiInputBlock);',
            'polymixins['+index+'].p.addMethods(MidiInputBlock);',
            'polymixins['+index+'].v.addMethods(MidiInputBlock);',
            'polymixins['+index+'].f.addMethods(MidiInputBlock);',
        ].join('\n');
    }));
    MidiInputBlock.prototype.destroy = function () {
        this.polyChannels = null;
        eval(channelTemplater(_CHANNELCOUNT, function (index) {
            return [
                'polymixins['+index+'].f.prototype.destroy.call(this);',
                'polymixins['+index+'].v.prototype.destroy.call(this);',
                'polymixins['+index+'].p.prototype.destroy.call(this);',
                'polymixins['+index+'].t.prototype.destroy.call(this);',
            ].join('\n');
        }, true));
        polymixins[0].f.prototype.destroy.call(this);
        polymixins[0].v.prototype.destroy.call(this);
        polymixins[0].p.prototype.destroy.call(this);
        polymixins[0].t.prototype.destroy.call(this);
        MidiChannelListenerMixin.prototype.destroy.call(this);
        MidiChannelEmitterMixin.prototype.destroy.call(this);
        Base.prototype.destroy.call(this);
        if (this.input) {
            this.input.closePort();
        }
        this.input = null;
    };
    MidiInputBlock.prototype.announceMidiChannelOutput = function (number) {
        if (number<0) {
            return;
        }
        this.input.openPort(number);
        this.input.ignoreTypes(false, false, false);
        this.input.on('message', this.myOnMidiInput.bind(this));
        MidiChannelEmitterMixin.prototype.announceMidiChannelOutput.call(this);
    };

    MidiInputBlock.prototype.myOnMidiInput = function (deltatime, midimessage) {
        var freechannel;
        if (!lib.isArray(midimessage)) {
            return;
        }
        if (midimessage.length == 3) {
            //this.doPoly(midimessage);
            this.doOutput(0, midimessage[0], midimessage[1], midimessage[2]);
            //freechannel = this.freeChannelFor(midimessage[0], midimessage[1], midimessage[2])
            freechannel = this.channelFor.apply(this, midimessage);
            if (freechannel>0 && freechannel<=_CHANNELCOUNT) {
                this.doOutput(freechannel, midimessage[0], midimessage[1], midimessage[2]);
            }
        }
    };

    MidiInputBlock.prototype.doOutput = function (channel, trigger, pitch, velocity) {        
        if (trigger == 128) {
            this.setForOutput(channel, 'Trigger', 0);
        }
        if (trigger == 144) {
            this.setForOutput(channel, 'Trigger', 1);
        }
        this.setForOutput(channel, 'Pitch', pitch);
        this.setForOutput(channel, 'FrequencyHz', pitch2frequencyhz[pitch] || 440);
        this.setForOutput(channel, 'Velocity', velocity/100);
    };
    MidiInputBlock.prototype.setForOutput = function (outchannel, channel, param) {
        var mymethodname = outchannel>0 ? 'set'+channel+''+outchannel : 'set'+channel;
        this[mymethodname](param);
    };
    MidiInputBlock.prototype.channelFor = function (trigger, pitch, velocity) {
        var ret;
        if (trigger == 144) {//key down, find an empty channel
            ret = firstempty(this.polyChannels);
            if (ret>=0) {
                this.polyChannels[ret] = pitch;
            }
            return ret+1;
        }
        if (trigger == 128) {//key up, find the channel with pitch
            ret = this.polyChannels.indexOf(pitch);
            if (ret>=0) {
                this.polyChannels[ret] = null;
            }
            return ret+1;
        }
    };
    MidiInputBlock.channelCount = _CHANNELCOUNT;
    
    function firstempty (arry) {
        var i;
        for (i=0; i<arry.length; i++) {
            if (!lib.isVal(arry[i])) {
                return i;
            }
        }
        return -1;
    }


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