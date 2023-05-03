var fs = require('fs');

function createFileOutBlock (lib, bufferlib, mylib) {
    'use strict';

    var MyBase = mylib.SampleProducerBase;
    var ChannelsEmitterMixin = mylib.mixins.ChannelsEmitter;
    var ChannelsListenerMixin = mylib.mixins.ChannelsListener;
    var SamplesEmitterMixin = mylib.mixins.SamplesEmitter;
    var SamplesListenerMixin = mylib.mixins.SamplesListener;
    var SampleRateEmitterMixin = mylib.mixins.SampleRateEmitter;
    var SampleRateListenerMixin = mylib.mixins.SampleRateListener;

    function FileOutBlock () {
        MyBase.call(this);
        ChannelsEmitterMixin.call(this, 1);
        ChannelsListenerMixin.call(this);
        SamplesEmitterMixin.call(this, 0);
        SamplesListenerMixin.call(this);
        SampleRateEmitterMixin.call(this, 0);
        SampleRateListenerMixin.call(this);
        this.file = null;
        this.dBuffer = new bufferlib.DoubleNodeJSBuffer(20480, this.onBufferReady.bind(this));
        fs.open('output', 'w', this.onFileOpen.bind(this));
    }
    lib.inherit(FileOutBlock, MyBase);
    ChannelsEmitterMixin.addMethods(FileOutBlock);
    ChannelsListenerMixin.addMethods(FileOutBlock);
    SamplesEmitterMixin.addMethods(FileOutBlock);
    SamplesListenerMixin.addMethods(FileOutBlock);
    SampleRateEmitterMixin.addMethods(FileOutBlock);
    SampleRateListenerMixin.addMethods(FileOutBlock);
    FileOutBlock.prototype.destroy = function () {
        if (this.dBuffer) {
            this.dBuffer.destroy();
        }
        this.dBuffer = null;
        if (this.file) {
            fs.close(this.file);
        }
        SampleRateListenerMixin.prototype.destroy.call(this);
        SampleRateEmitterMixin.prototype.destroy.call(this);
        SamplesListenerMixin.prototype.destroy.call(this);
        SamplesEmitterMixin.prototype.destroy.call(this);
        ChannelsListenerMixin.prototype.destroy.call(this);
        ChannelsEmitterMixin.prototype.destroy.call(this);
        MyBase.prototype.destroy.call(this);
    };
    FileOutBlock.prototype.onSamplesInput = function (sample) {
        this.dBuffer.add('Int16LE', sample*(32000));
    };

    FileOutBlock.prototype.onBufferReady = function (buff) {
        if (!this.file) {
            return;
        }
        fs.write(this.file, buff, lib.dummyFunc);
    };

    FileOutBlock.prototype.onFileOpen = function (error, fd) {
        this.file = error ? null : fd;
    };

    mylib.FileOut = FileOutBlock;
}
module.exports = createFileOutBlock;