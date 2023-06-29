var Speaker = require('audio-speaker/stream');

function createSpeakerBlock (lib, bufferlib, mylib) {
    'use strict';

    var MyBase = mylib.OutputBase;
    var SampleRateListenerMixin = mylib.mixins.SampleRateListener;

    function isPositiveNumber (thingy) {
        return lib.isNumber(thingy) && thingy>0;
    }

    function SpeakerBlock () {
        MyBase.call(this);
        this.audioSpeaker = null;
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
        this.audioSpeaker = null;
        MyBase.prototype.destroy.call(this);
    };
    SpeakerBlock.prototype.createAudioSpeaker = function () {
        if (!(isPositiveNumber(this.channels) && isPositiveNumber(this.sampleRate))) {
            return;
        }
        if (this.audioSpeaker) {
            //nateSpeaker has no destroy :/
        }        
        this.audioSpeaker = null;
        var params = {
            bitDepth: 16,
            channels: this.channels,
            sampleRate: this.sampleRate,
            byteOrder: 'BE'
        };
        this.audioSpeaker = Speaker(params);
        this.myRange = 2**16-1; //this.nateSpeaker.bitDepth;
        this.signed = this.audioSpeaker.bitDepth == 8 ? true : false; //whatever Nate meant with this "signed", we'll leave it for now (until proven wrong) like this
        this.signed = true;
        this.myWriteMethod = (this.signed ? 'Int16' : 'UInt16')+'LE';
    };

    SpeakerBlock.prototype.onSampleRateInput = function (samplerate) {
        SampleRateListenerMixin.prototype.onSampleRateInput.call(this, samplerate);
        this.createAudioSpeaker();
    };

    SpeakerBlock.prototype.convertSampleForOutput = function (input) { //a number in the [-1, 1] range
        var myinput = this.signed ? input : (input + 1);
        //in any case, myinput has a "peak-to-peak" range of 2
        //so the "input scale" is 2/this.myRange, I have to convert it to my range
        var ret = Math.trunc(myinput*(this.myRange/2));
        return ret;
    };

    var writestart;
    var missed = [];
    SpeakerBlock.prototype.onBufferReady = function (buff) {
        if (!this.audioSpeaker) {
            return;
        }
        if (this.speakerBusy) {
            //console.error(Date.now()+' Ooopsie, overflow?, buff '+buff.length+' in size');
            missed.push(Date.now());
            return;
        }
        //console.log('writing', buff);//.length, 'bytes');
        this.speakerBusy = true;
        writestart = Date.now();
        missed = [];
        this.audioSpeaker.write(buff, this.onWritten.bind(this));
    };
    SpeakerBlock.prototype.onWritten = function () {
        //console.log(Date.now()-writestart, 'passed', missed, 'missed');
        this.speakerBusy = false;
    };

    mylib.Speaker = SpeakerBlock;
}
module.exports = createSpeakerBlock;