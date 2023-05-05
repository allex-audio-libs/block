function createChannelMixins (lib, eventlib, templateslib, outerlib, mylib) {
    'use strict';

    function createEmitterMixin (channel, lcchannel) {
        var ret;
        var evalstr = templateslib.process({
            replacements: {
                MIXINNAME: channel+'EmitterMixin',
                EVENT: 'has'+channel+'Output',
                INPUT: 'on'+channel+'Input',
                INPUTER: 'on'+channel+'Inputer',
                PROPERTY: lcchannel,
                SET: 'set'+channel,
                ANNOUNCE: 'announce'+channel+'Output'
            },
            template: [
                "function MIXINNAME (initialproperty) {",
                "    this.EVENT = new eventlib();",
                "    this.PROPERTY = initialproperty || 0;",
                "}",
                "MIXINNAME.prototype.destroy = function () {",
                "    this.PROPERTY = null;",
                "    if (this.EVENT) {",
                "        this.EVENT.destroy();",
                "    }",
                "    this.EVENT = null;",
                "};",
                "MIXINNAME.prototype.ANNOUNCE = function (number) {",
                "    if (this.EVENT) {",
                "        this.EVENT.fire(number);",
                "    }",
                "};",
                "MIXINNAME.prototype.SET = function (number) {",
                "    if (!lib.isNumber(this.PROPERTY)) {//i.e. am I destroyed?",
                "        return;",
                "    }",
                "    this.PROPERTY = number;",
                "    this.ANNOUNCE(number);",
                "};",
                "",
                "MIXINNAME.addMethods = function (klass) {",
                "    lib.inheritMethods(klass, MIXINNAME",
                "        , 'ANNOUNCE'",
                "        , 'SET'",
                "    );",
                "};",
                "ret = MIXINNAME;"
            ].join("\n")  
        });
        eval(evalstr);
        mylib[channel+'Emitter'] = ret;
    }
    function createListenerMixin (channel, lcchannel) {
        var ret;
        var evalstr = templateslib.process({
            replacements: {
                MIXINNAME: channel+'ListenerMixin',
                EVENT: 'has'+channel+'Output',
                INPUT: 'on'+channel+'Input',
                INPUTER: 'on'+channel+'Inputer',
                PROPERTY: lcchannel,
                SET: 'set'+channel,
                ANNOUNCE: 'announce'+channel+'Output'
            },
            template: [
                "function MIXINNAME () {",
                "    this.INPUTER = this.INPUT.bind(this);",
                "}",
                "MIXINNAME.prototype.destroy = function () {",
                "    this.INPUTER = null;",
                "};",
                "MIXINNAME.prototype.INPUT = function (number) {",
                "    this.SET(number);  //inconsistent if you're not both Emitter and Listener",
                "};",
                "MIXINNAME.addMethods = function (klass) {",
                "    if(lib.isFunction(klass.prototype.INPUT)) {",
                "       return;",
                "    }",
                "    lib.inheritMethods(klass, MIXINNAME",
                "        , 'INPUT'",
                "    );",
                "};",
                "ret = MIXINNAME;"
            ].join("\n")  
        });
        eval(evalstr);
        mylib[channel+'Listener'] = ret;
    }


    function addMixin (channel) {
        var lcchannel = outerlib.lowerCaseFirst(channel);
        createEmitterMixin(channel, lcchannel);
        createListenerMixin(channel, lcchannel);
    }


    addMixin('SampleRate');
    addMixin('Channels');
    addMixin('Clock');
    addMixin('Volume');
    addMixin('Samples');
    addMixin('FrequencyHz');
    addMixin('FrequencyHzModulation');
    addMixin('Phase');
    addMixin('PulseWidth');

    addMixin('Math');
    addMixin('Math1');
    addMixin('Math2');

    for(var i=0; i<4; i++) {
        addMixin('Channel'+(i+1));
    }

    addMixin('Resonance');
}
module.exports = createChannelMixins;