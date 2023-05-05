function createOutputBaseBlock (lib, bufferlib, templateslib, mylib) {
    'use strict';


    var channelindex;
    var _CHANNELCOUNT = 4;//magic number because this is the number of ChannelX mixin channels

    function channelProducer (func, desc) {
        var ret = [];
        var i;
        if (desc) {
            for (i=_CHANNELCOUNT-1; i>=0; i--) {
                ret.push(func(i+1));
            }
            return ret;
        }
        for (i=0; i<_CHANNELCOUNT; i++) {
            ret.push(func(i+1));
        }
        return ret;
    }
    function channelTemplater (func, desc) {
        var ret = templateslib.process({
            template: channelProducer(func, desc).join(''),
            replacements: {}
        });
        return ret;
    }

    function ctorer () {
        return channelTemplater(function (i) {
            return 'mylib.mixins.Channel'+i+'Emitter.call(this, 0);\nmylib.mixins.Channel'+i+'Listener.call(this);\n'
        });
    }
    function addMethodser () {
        return channelTemplater(function (i) {
            return 'mylib.mixins.Channel'+i+'Emitter.addMethods(OutputBaseBlock);\nmylib.mixins.Channel'+i+'Listener.addMethods(OutputBaseBlock);\n'
        });
    }
    function destroyer () {
        return channelTemplater(function (i) {
            return 'mylib.mixins.Channel'+i+'Listener.prototype.destroy.call(this);\nmylib.mixins.Channel'+i+'Emitter.prototype.destroy.call(this);\n'
        }, true);
    }
    

    var MyBase = mylib.SampleProducerBase;
    var ChannelsEmitterMixin = mylib.mixins.ChannelsEmitter;
    var ChannelsListenerMixin = mylib.mixins.ChannelsListener;
    var SampleRateEmitterMixin = mylib.mixins.SampleRateEmitter;
    var SampleRateListenerMixin = mylib.mixins.SampleRateListener;

    function OutputBaseBlock () {
        MyBase.call(this);
        ChannelsEmitterMixin.call(this, 1);
        ChannelsListenerMixin.call(this);
        eval(ctorer());
        SampleRateEmitterMixin.call(this, 0);
        SampleRateListenerMixin.call(this);
        this.dBuffer = new bufferlib.DoubleNodeJSBuffer(20480, this.onBufferReady.bind(this));
    }
    lib.inherit(OutputBaseBlock, MyBase);
    ChannelsEmitterMixin.addMethods(OutputBaseBlock);
    ChannelsListenerMixin.addMethods(OutputBaseBlock);
    eval(addMethodser());
    SampleRateEmitterMixin.addMethods(OutputBaseBlock);
    SampleRateListenerMixin.addMethods(OutputBaseBlock);
    OutputBaseBlock.prototype.destroy = function () {
        if (this.dBuffer) {
            this.dBuffer.destroy();
        }
        this.dBuffer = null;
        SampleRateListenerMixin.prototype.destroy.call(this);
        SampleRateEmitterMixin.prototype.destroy.call(this);
        eval(destroyer());
        ChannelsListenerMixin.prototype.destroy.call(this);
        ChannelsEmitterMixin.prototype.destroy.call(this);
        MyBase.prototype.destroy.call(this);
    };
    OutputBaseBlock.prototype.writeSampleToBuffer = function (sample) {
        //myWriteMethod is not defined in this base class at all, it is left to the children
        this.dBuffer.add(this.myWriteMethod, this.convertSampleForOutput(sample));
    };

    OutputBaseBlock.prototype.convertSampleForOutput = function (sample) {
        return sample;
    };

    OutputBaseBlock.prototype.onBufferReady = function (buff) {
        throw new lib.Error('NOT_IMPLEMENTED', this.constructor.name+' has to implement onBufferReady');
    };

    mylib.OutputBase = OutputBaseBlock;
}
module.exports = createOutputBaseBlock;