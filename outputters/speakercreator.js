var NateSpeaker = require('speaker');

function createSpeakerBlock (lib, bufferlib, mylib) {
    'use strict';

    var MyBase = mylib.OutputBase;
    var SampleRateListenerMixin = mylib.mixins.SampleRateListener;

    function isPositiveNumber (thingy) {
        return lib.isNumber(thingy) && thingy>0;
    }

    function SpeakerBlock () {
        MyBase.call(this);
        this.nateSpeaker = null;
        this.speakerBusy = false;
        this.myRange = 2**16; //this.nateSpeaker.bitDepth;
        this.signed = null; //this.nateSpeaker.bitDepth == 8 ? true : false;
        this.myWriteMethod = null; //(this.signed ? 'Int16' : 'UInt16')+this.nateSpeaker.endianness;
        //this.myWriteMethod = 'UInt16LE';
    }
    lib.inherit(SpeakerBlock, MyBase);
    SpeakerBlock.prototype.destroy = function () {
        this.myWriteMethod = null;
        this.myRange = null;
        this.speakerBusy = null;
        this.nateSpeaker = null;
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
        this.myRange = 2**16-1; //this.nateSpeaker.bitDepth;
        this.signed = this.nateSpeaker.bitDepth == 8 ? true : false; //whatever Nate meant with this "signed", we'll leave it for now (until proven wrong) like this
        this.signed = true;
        this.myWriteMethod = (this.signed ? 'Int16' : 'UInt16')+this.nateSpeaker.endianness;
    };

    SpeakerBlock.prototype.onSampleRateInput = function (samplerate) {
        SampleRateListenerMixin.prototype.onSampleRateInput.call(this, samplerate);
        this.createNate();
    };

    SpeakerBlock.prototype.convertSampleForOutput = function (input) { //a number in the [-1, 1] range
        var myinput = this.signed ? input : (input + 1);
        //in any case, myinput has a "peak-to-peak" range of 2
        //so the "input scale" is 2/this.myRange, I have to convert it to my range
        var ret = Math.trunc(myinput*(this.myRange/2));
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