function createChannelMixins (lib, eventlib, templateslib, outerlib, mylib) {
    'use strict';

    var channelDescs = new lib.Map();

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
                return "''";
            default:
                throw new lib.Error('MIXINCHANNEL_TYPE_NOT_SUPPORTED', type+' is not a valid Mixin Channel type');
        }
    }
    function checkerForType(type) {
        switch (type) {
            case 'number':
                return 'lib.isNumber';
            case 'string':
                return "lib.isString";
            default:
                throw new lib.Error('MIXINCHANNEL_TYPE_NOT_SUPPORTED', type+' is not a valid Mixin Channel type');
        }
    }

    function setterCBM (cbm) {
        if (cbm == 'allpass') {
            return '';
        }
        if (cbm == 'differential') {
            return [
                "",
                "    if (this.PROPERTY === PARAM) {",
                "        return;",
                "    }",    
            ].join('\n');
        }
        throw new lib.Error('CBM_TYPE_NOT_SUPPORTED', cbm+' is not a valid ChangeBehaviorModel type');
    }

    function createEmitterMixin (channel, lcchannel, type, cbm) {
        var ret;
        var evalstr = templateslib.process({
            prereplacements: {
                SETTERCBM: setterCBM(cbm)
            },
            replacements: {
                MIXINNAME: channel+'EmitterMixin',
                EVENT: 'has'+channel+'Output',
                PROPERTY: lcchannel,
                SET: 'set'+channel,
                TYPE: channel+'Type',
                ANNOUNCE: 'announce'+channel+'Output',
                PARAM: paramTextForType(type),
                INITIALVALUE: defaultInitValueForType(type),
                CHECKER: checkerForType(type)
            },
            template: [
                "function MIXINNAME (initialproperty) {",
                "    this.EVENT = new eventlib();",
                "    this.PROPERTY = INITIALVALUE;",
                "    this.SET(initialproperty);",
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
                "    if (!CHECKER(this.PROPERTY)) {//i.e. am I destroyed?",
                "        return;",
                "    }SETTERCBM",
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
        channelDescs.add(channel, {
            type: type,
            cbm: cbm
        });
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


    function addTypedMixinPair (channeldesc) {
        var lcchannel = outerlib.lowerCaseFirst(channeldesc.name);
        createEmitterMixin(channeldesc.name, lcchannel, channeldesc.type, channeldesc.cbm);
        createListenerMixin(channeldesc.name, lcchannel, channeldesc.type);
    }

    function addAllPassNumberMixinPair (channel) {
        addTypedMixinPair({
            name: channel,            
            type: 'number',
            cbm: 'allpass'
        });
    }
    function addDiffNumberMixinPair (channel) {
        addTypedMixinPair({
            name: channel,            
            type: 'number',
            cbm: 'differential'
        });
    }


    addDiffNumberMixinPair('SampleRate');
    addDiffNumberMixinPair('Channels');
    addDiffNumberMixinPair('Clock');
    addDiffNumberMixinPair('Volume');
    addAllPassNumberMixinPair('Samples');
    addDiffNumberMixinPair('FrequencyHz');
    addDiffNumberMixinPair('FrequencyHzModulation');
    addDiffNumberMixinPair('Phase');
    addDiffNumberMixinPair('PulseWidth');

    addAllPassNumberMixinPair('Math');
    addAllPassNumberMixinPair('Math1');
    addAllPassNumberMixinPair('Math2');

    for(var i=0; i<4; i++) {
        addAllPassNumberMixinPair('Channel'+(i+1));
    }

    addDiffNumberMixinPair('Resonance');
    addDiffNumberMixinPair('FilterSwitchingEnvelope');

    mylib.requestChannelMixin = function (reqobj) {
        if (arguments.length!=1) {
            throw new lib.Error('MUST_CALL_WITH_1_PARAM', 'requestChannelMixin must be called with just 1 param, the request object');
        }
        if (!lib.isVal(reqobj)) {
            throw new lib.Error('MUST_HAVE_REQOBJ', 'The request object for requestChannelMixin must be an object');
        }
        if (!lib.isNonEmptyString(reqobj.name)) {
            throw new lib.Error('REQOBJ_MUST_HAVE_NAME', 'The request object for requestChannelMixin must have a "name"');
        }
        if (!lib.isNonEmptyString(reqobj.type)) {
            throw new lib.Error('REQOBJ_MUST_HAVE_TYPE', 'The request object for requestChannelMixin must have a "type"');
        }
        if (!lib.isBoolean(reqobj.emitter)) {
            throw new lib.Error('REQOBJ_MUST_HAVE_EMITTER', 'The request object for requestChannelMixin must have an "emitter" field [Boolean]');
        }
        if (!lib.isNonEmptyString(reqobj.cbm)) {
            throw new lib.Error('REQOBJ_MUST_HAVE_CBM', 'The request object for requestChannelMixin must have a "cbm", the Change Behavior Model');
        }
        var channelname = reqobj.name;
        if (!mylib[channelname+'Emitter']) { //the logic is that if channelname+'Emitter' exists, channelname+'Listener' exists for sure, they always go in pairs
            addTypedMixinPair(reqobj);
        }
        //check
        var checkobj = channelDescs.get(channelname);
        if (!checkobj) {
            throw new lib.Error('INTERNAL_ERROR', 'At this point checkobj must have been fully defined.');
        }
        if (checkobj.type !== reqobj.type) {
            throw new lib.Error('REQUEST_TYPE_MISMATCH', 'Channel '+channelname+' was originally created with type '+checkobj.type+' and this request asked for type '+reqobj.type);
        }
        if (checkobj.cbm !== reqobj.cbm) {
            throw new lib.Error('REQUEST_CBM_MISMATCH', 'Channel '+channelname+' was originally created with cbm '+checkobj.cbm+' and this request asked for cbm '+reqobj.cbm);
        }
        //endof check
        return mylib[channelname+ ( reqobj.emitter ? 'Emitter' : 'Listener' )];
    }
}
module.exports = createChannelMixins;