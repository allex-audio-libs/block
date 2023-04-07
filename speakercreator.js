var NateSpeaker = require('speaker');

function createSpeakerBlock (lib, bufferlib, mylib) {
    'use strict';

    var MyBase = mylib.SampleProducerBase;
    var ChannelsEmitterMixin = mylib.mixins.ChannelsEmitter;
    var ChannelsListenerMixin = mylib.mixins.ChannelsListener;
    var SamplesEmitterMixin = mylib.mixins.SamplesEmitter;
    var SamplesListenerMixin = mylib.mixins.SamplesListener;
    var SampleRateEmitterMixin = mylib.mixins.SampleRateEmitter;
    var SampleRateListenerMixin = mylib.mixins.SampleRateListener;

    function isPositiveNumber (thingy) {
        return lib.isNumber(thingy) && thingy>0;
    }

    function SpeakerBlock () {
        MyBase.call(this);
        ChannelsEmitterMixin.call(this, 1);
        ChannelsListenerMixin.call(this);
        SamplesEmitterMixin.call(this, 0);
        SamplesListenerMixin.call(this);
        SampleRateEmitterMixin.call(this, 0);
        SampleRateListenerMixin.call(this);
        this.nateSpeaker = null;
        this.dBuffer = new bufferlib.DoubleNodeJSBuffer(20480, this.onBufferReady.bind(this));        
        this.speakerBusy = false;
        this.myRange = 2**16; //this.nateSpeaker.bitDepth;
        this.signed = null; //this.nateSpeaker.bitDepth == 8 ? true : false;
        this.myWriteMethod = null; //(this.signed ? 'Int16' : 'UInt16')+this.nateSpeaker.endianness;
        //this.myWriteMethod = 'UInt16LE';
    }
    lib.inherit(SpeakerBlock, MyBase);
    ChannelsEmitterMixin.addMethods(SpeakerBlock);
    ChannelsListenerMixin.addMethods(SpeakerBlock);
    SamplesEmitterMixin.addMethods(SpeakerBlock);
    SamplesListenerMixin.addMethods(SpeakerBlock);
    SampleRateEmitterMixin.addMethods(SpeakerBlock);
    SampleRateListenerMixin.addMethods(SpeakerBlock);
    SpeakerBlock.prototype.destroy = function () {
        this.myWriteMethod = null;
        this.myRange = null;
        this.speakerBusy = null;
        if (this.dBuffer) {
            this.dBuffer.destroy();
        }
        this.dBuffer = null;
        this.nateSpeaker = null;
        SampleRateListenerMixin.prototype.destroy.call(this);
        SampleRateEmitterMixin.prototype.destroy.call(this);
        SamplesListenerMixin.prototype.destroy.call(this);
        SamplesEmitterMixin.prototype.destroy.call(this);
        ChannelsListenerMixin.prototype.destroy.call(this);
        ChannelsEmitterMixin.prototype.destroy.call(this);
        MyBase.prototype.destroy.call(this);
    };
    SpeakerBlock.prototype.createNate = function () {
        if (!(isPositiveNumber(this.channels) && isPositiveNumber(this.sampleRate))) {
            return;
        }
        if (this.nateSpeaker) {
            //nateSpeaker has no destroy :/
        }        
        this.nateSpeaker = null;
        var params = {
            bitDepth: 16,
            channels: this.channels,
            sampleRate: this.sampleRate
        };
        this.nateSpeaker = new NateSpeaker(params);
        this.myRange = 2**16; //this.nateSpeaker.bitDepth;
        this.signed = this.nateSpeaker.bitDepth == 8 ? true : false;
        this.myWriteMethod = (this.signed ? 'Int16' : 'UInt16')+this.nateSpeaker.endianness;
    };

    SpeakerBlock.prototype.onSampleRateInput = function (samplerate) {
        SampleRateListenerMixin.prototype.onSampleRateInput.call(this, samplerate);
        this.createNate();
    };
    SpeakerBlock.prototype.onSamplesInput = function (sample) {
        if (Math.abs(sample)>1) {
            var a = 5;
        }
        this.setSamples(this.produceSample(sample));
    };

    SpeakerBlock.prototype.produceSample = function (input) { //a number in the [-1, 1] range
        if (!this.myWriteMethod) {
            return;
        }
        this.dBuffer.add(this.myWriteMethod, this.convertSampleForSpeaker(input));
        return input;
    };

    SpeakerBlock.prototype.convertSampleForSpeaker = function (input) { //a number in the [-1, 1] range
        var myinput = this.signed ? input : (input + 1);
        //in any case, myinput has a "peak-to-peak" range of 2
        //so the "input scale" is 2/this.myRange, I have to convert it to my range
        var ret = Math.trunc(myinput*(this.myRange/2/2)); //additional division by 2 is to get out of the overload situation
        return ret;
    };

    SpeakerBlock.prototype.onBufferReady = function (buff) {
        if (!this.nateSpeaker) {
            return;
        }
        if (this.speakerBusy) {
            console.error('Ooopsie, overflow?');
            return;
        }
        //console.log('writing', buff);//.length, 'bytes');
        this.speakerBusy = true;
        this.nateSpeaker.write(buff, this.onWritten.bind(this));
    };
    SpeakerBlock.prototype.onWritten = function () {
        this.speakerBusy = false;
    };

    mylib.Speaker = SpeakerBlock;
}
module.exports = createSpeakerBlock;