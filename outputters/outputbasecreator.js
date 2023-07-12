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
    function onChanneler () {
        return channelTemplater(function (i) {
            return [
                'OutputBaseBlock.prototype.onChannel'+i+'Input = function (sample) {',
                '\tonAnyChannelInput.call(this, '+i+', sample);',
                '};\n'
            ].join('\n');
        });
    }
    

    var MyBase = mylib.SampleProducerBase;
    var ClockListenerMixin = mylib.mixins.requestChannelMixin({
        name: 'Clock', 
        type: 'number', 
        cbm: 'differential',
        emitter: false
    });
    var ChannelsEmitterMixin = mylib.mixins.requestChannelMixin({
        name: 'Channels', 
        type: 'number', 
        cbm: 'differential',
        emitter: true
    });
    var ChannelsListenerMixin = mylib.mixins.requestChannelMixin({
        name: 'Channels', 
        type: 'number', 
        cbm: 'differential',
        emitter: false
    });
    var SampleRateEmitterMixin = mylib.mixins.requestChannelMixin({
        name: 'SampleRate', 
        type: 'number', 
        cbm: 'differential',
        emitter: true
    });
    var SampleRateListenerMixin = mylib.mixins.requestChannelMixin({
        name: 'SampleRate', 
        type: 'number', 
        cbm: 'differential',
        emitter: false
    });
    var URIEmitterMixin = mylib.mixins.requestChannelMixin({
        name: 'URI', 
        type: 'string', 
        cbm: 'differential',
        emitter: true
    });
    var URIListenerMixin = mylib.mixins.requestChannelMixin({
        name: 'URI', 
        type: 'string', 
        cbm: 'differential',
        emitter: false
    });
    var ClipEmitterMixin = mylib.mixins.requestChannelMixin({
        name: 'Clip', 
        type: 'number', 
        cbm: 'differential',
        emitter: true
    });

    function OutputBaseBlock () {
        MyBase.call(this);
        ClockListenerMixin.call(this);
        ChannelsEmitterMixin.call(this, 1);
        ChannelsListenerMixin.call(this);
        eval(ctorer());
        SampleRateEmitterMixin.call(this, 0);
        SampleRateListenerMixin.call(this);
        URIEmitterMixin.call(this, '');
        URIListenerMixin.call(this);
        ClipEmitterMixin.call(this, 0);
        this.dBuffer = new bufferlib.DoubleNodeJSBuffer(2048, this.onBufferReady.bind(this));
    }
    lib.inherit(OutputBaseBlock, MyBase);
    ClockListenerMixin.addMethods(OutputBaseBlock);
    ChannelsEmitterMixin.addMethods(OutputBaseBlock);
    ChannelsListenerMixin.addMethods(OutputBaseBlock);
    eval(addMethodser());
    SampleRateEmitterMixin.addMethods(OutputBaseBlock);
    SampleRateListenerMixin.addMethods(OutputBaseBlock);
    URIEmitterMixin.addMethods(OutputBaseBlock);
    URIListenerMixin.addMethods(OutputBaseBlock);
    ClipEmitterMixin.addMethods(OutputBaseBlock);
    OutputBaseBlock.prototype.destroy = function () {
        if (this.dBuffer) {
            this.dBuffer.destroy();
        }
        this.dBuffer = null;
        ClipEmitterMixin.prototype.destroy.call(this);
        URIListenerMixin.prototype.destroy.call(this);
        URIEmitterMixin.prototype.destroy.call(this);
        SampleRateListenerMixin.prototype.destroy.call(this);
        SampleRateEmitterMixin.prototype.destroy.call(this);
        eval(destroyer());
        ChannelsListenerMixin.prototype.destroy.call(this);
        ChannelsEmitterMixin.prototype.destroy.call(this);
        ClockListenerMixin.prototype.destroy.call(this);
        MyBase.prototype.destroy.call(this);
    };
    //eval(onChanneler());

    function onAnyChannelInput (channelindex, sample) {
        if (channelindex<1 || channelindex>this.channels) {
            return;
        }
        if (channelindex == 2 && (sample>1 || sample<-1)) {
            var a = 5;
        }
        produceSample.call(this, sample);
    };    
    function produceSample (input) { //a number in the [-1, 1] range
        if (!this.myWriteMethod) {
            return;
        }
        writeSampleToBuffer.call(this, input);
        return input;
    };
    function writeSampleToBuffer (sample) {
        //myWriteMethod is not defined in this base class at all, it is left to the children
        this.setClip(this.dBuffer.add(this.myWriteMethod, this.convertSampleForOutput(sample)));
    };

    OutputBaseBlock.prototype.setClock = function (number) {
        var ch;
        for(ch = 0; ch<this.channels; ch++) {
            produceSample.call(this, this['channel'+(ch+1)]);
        }
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