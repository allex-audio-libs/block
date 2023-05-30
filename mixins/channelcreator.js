function createChannelMixins (lib, eventlib, templateslib, outerlib, mylib) {
    'use strict';

    function paramTextForType(type) {
        switch (type) {
            case 'number':
                return 'number';
            case 'string':
                return 'text';
            default:
                throw new lib.Error('MIXINCHANNEL_TYPE_NOT_SUPPORTED', type+' is not a valid Mixin Channel type');
        }
    }
    function defaultInitValueForType(type) {
        switch (type) {
            case 'number':
                return 0;
            case 'string':
                return '';
            default:
                throw new lib.Error('MIXINCHANNEL_TYPE_NOT_SUPPORTED', type+' is not a valid Mixin Channel type');
        }
    }

    function createEmitterMixin (channel, lcchannel, type) {
        var ret;
        var evalstr = templateslib.process({
            replacements: {
                MIXINNAME: channel+'EmitterMixin',
                EVENT: 'has'+channel+'Output',
                INPUT: 'on'+channel+'Input',
                INPUTER: 'on'+channel+'Inputer',
                PROPERTY: lcchannel,
                SET: 'set'+channel,
                TYPE: channel+'Type',
                ANNOUNCE: 'announce'+channel+'Output',
                PARAM: paramTextForType(type),
                INITIALVALUE: defaultInitValueForType(type)
            },
            template: [
                "function MIXINNAME (initialproperty) {",
                "    this.EVENT = new eventlib();",
                "    this.PROPERTY = initialproperty || INITIALVALUE;",
                "}",
                "MIXINNAME.prototype.destroy = function () {",
                "    this.PROPERTY = null;",
                "    if (this.EVENT) {",
                "        this.EVENT.destroy();",
                "    }",
                "    this.EVENT = null;",
                "};",
                "MIXINNAME.prototype.ANNOUNCE = function (PARAM) {",
                "    if (this.EVENT) {",
                "        this.EVENT.fire(PARAM);",
                "    }",
                "};",
                "MIXINNAME.prototype.SET = function (PARAM) {",
                "    if (!lib.isNumber(this.PROPERTY)) {//i.e. am I destroyed?",
                "        return;",
                "    }",
                "    this.PROPERTY = PARAM;",
                "    this.ANNOUNCE(PARAM);",
                "};",
                "MIXINNAME.prototype.TYPE = function () {",
                "    return '"+type+"';",
                "};",
                "",
                "MIXINNAME.addMethods = function (klass) {",
                "    lib.inheritMethods(klass, MIXINNAME",
                "        , 'ANNOUNCE'",
                "        , 'SET'",
                "        , 'TYPE'",
                "    );",
                "};",
                "ret = MIXINNAME;"
            ].join("\n")  
        });
        eval(evalstr);
        mylib[channel+'Emitter'] = ret;
    }
    function createListenerMixin (channel, lcchannel, type) {
        var ret;
        var evalstr = templateslib.process({
            replacements: {
                MIXINNAME: channel+'ListenerMixin',
                EVENT: 'has'+channel+'Output',
                INPUT: 'on'+channel+'Input',
                INPUTER: 'on'+channel+'Inputer',
                PROPERTY: lcchannel,
                SET: 'set'+channel,
                ANNOUNCE: 'announce'+channel+'Output',
                TYPE: channel+'Type',
                PARAM: paramTextForType(type)
            },
            template: [
                "function MIXINNAME () {",
                "    this.INPUTER = this.INPUT.bind(this);",
                "}",
                "MIXINNAME.prototype.destroy = function () {",
                "    this.INPUTER = null;",
                "};",
                "MIXINNAME.prototype.INPUT = function (PARAM) {",
                "    this.SET(PARAM);  //inconsistent if you're not both Emitter and Listener",
                "};",
                "MIXINNAME.prototype.TYPE = function () {",
                "    return '"+type+"';",
                "};",
                "",
                "MIXINNAME.addMethods = function (klass) {",
                "    if(lib.isFunction(klass.prototype.INPUT)) {",
                "       return;",
                "    }",
                "    lib.inheritMethods(klass, MIXINNAME",
                "        , 'INPUT'",
                "        , 'TYPE'",
                "    );",
                "};",
                "ret = MIXINNAME;"
            ].join("\n")  
        });
        eval(evalstr);
        mylib[channel+'Listener'] = ret;
    }


    function addTypedMixin (channel, type) {
        var lcchannel = outerlib.lowerCaseFirst(channel);
        createEmitterMixin(channel, lcchannel, type);
        createListenerMixin(channel, lcchannel, type);
    }

    function addNumberMixin (channel) {
        addTypedMixin(channel, 'number');
    }


    addNumberMixin('SampleRate');
    addNumberMixin('Channels');
    addNumberMixin('Clock');
    addNumberMixin('Volume');
    addNumberMixin('Samples');
    addNumberMixin('FrequencyHz');
    addNumberMixin('FrequencyHzModulation');
    addNumberMixin('Phase');
    addNumberMixin('PulseWidth');

    addNumberMixin('Math');
    addNumberMixin('Math1');
    addNumberMixin('Math2');

    for(var i=0; i<4; i++) {
        addNumberMixin('Channel'+(i+1));
    }

    addNumberMixin('Resonance');
    addNumberMixin('FilterSwitchingEnvelope');

    mylib.requestChannelMixin = function (channelname, channeltype, isemitter) {
        if (arguments.length<3) {
            throw new lib.Error('MUST_CALL_WITH_3_PARAMS', 'requestChannelMixin must be called with 3 params');
        }
        if (!mylib[channelname+'Emitter']) { //the logic is that if channelname+'Emitter' exists, channelname+'Listener' exists for sure, they always go in pairs
            addTypedMixin(channelname, channeltype);
        }
        return mylib[channelname+ ( isemitter ? 'Emitter' : 'Listener' )];
    }
}
module.exports = createChannelMixins;