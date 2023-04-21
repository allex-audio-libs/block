function createBlockBase (lib, bufferlib, eventlib, mylib) {
    'use strict';

    var VolumeEmitterMixin = mylib.mixins.VolumeEmitter,
        VolumeListenerMixin = mylib.mixins.VolumeListener;

    function BlockAttachment (currblock, prevblock, prevblockoutputname, inputname) {
        this.currblock = currblock;
        this.prevblock = prevblock;
        this.prevblockoutputname = prevblockoutputname;
        this.inputname = inputname;
        this.event = null;
        this.handler = null;
        this.evaluateEventAndHandler(prevblockoutputname, inputname);
    }
    BlockAttachment.prototype.destroy = function () {
        if (this.event && this.handler) {
            this.event.detach(this.handler);
        }
        this.handler = null;
        this.event = null;
        this.inputname = null;
        this.prevblockoutputname = null;
        this.prevblock = null;
        this.currblock = null;
    };
    BlockAttachment.prototype.evaluateEventAndHandler = function (prevblockoutputname, inputname) {
        var myeventhandlername, prevblockeventname;
        var lcfprevblockoutputname;
        prevblockoutputname = (prevblockoutputname || '') + '';
        inputname = (inputname || '') + '';
        prevblockeventname = 'has'+prevblockoutputname+'Output';
        myeventhandlername = 'on'+inputname+'Inputer';
        if (!lib.isFunction(this.prevblock[prevblockeventname].attach)) {
            throw new lib.Error('NOT_AN_EVENT', prevblockeventname+' is not an Event on '+this.prevblock.constructor.name);
        }
        if (!lib.isFunction(this.currblock[myeventhandlername])) {
            throw new lib.Error('NOT_A_FUNCTION', myeventhandlername+' is not a Function on '+this.currblock.constructor.name);
        }
        this.event = this.prevblock[prevblockeventname];
        this.handler = this.currblock[myeventhandlername];
        this.event.attach(this.handler);
        lcfprevblockoutputname = mylib.lowerCaseFirst(prevblockoutputname);
        if (lib.isVal(this.prevblock[lcfprevblockoutputname])) {
            this.handler(this.prevblock[lcfprevblockoutputname]);
        }
    };
    BlockAttachment.prototype.isValid = function () {
        return this.event && this.handler;
    };


    function BlockBase () {
        VolumeEmitterMixin.call(this, 1);
        VolumeListenerMixin.call(this);
        this.attachments = [];
    }
    VolumeEmitterMixin.addMethods(BlockBase);
    VolumeListenerMixin.addMethods(BlockBase);
    BlockBase.prototype.destroy = function () {
        //TODO: remember all the blocks you've been attached to
        //TODO: and detach from them
        if (lib.isArray(this.attachments)) {
            lib.arryDestroyAll(this.attachments);
        }
        this.attachments = null;
        VolumeListenerMixin.prototype.destroy.call(this);
        VolumeEmitterMixin.prototype.destroy.call(this);
    };

    BlockBase.prototype.attachToPreviousBlock = function (prevblock, prevblockoutputname, myinputname) {
        var ba = new BlockAttachment(this, prevblock, prevblockoutputname, myinputname);
        if (ba.isValid()) {
            this.attachments.push(ba);
        }
    };

    BlockBase.prototype.detachFromPreviousBlock = function (prevblock, prevblockoutputname, myinputname) {
        var i, ba;
        if (!lib.isArray(this.attachments)) {
            return;
        }
        for (i=0; i<this.attachments.length && !ba; i++) {
            ba = this.attachments[i];
            if (!(
                ba.prevblock == prevblock &&
                ba.prevblockoutputname == prevblockoutputname &&
                ba.inputname == myinputname
            )) {
              ba = null;
            }
        }
        if (!ba) {
            return;
        }
        ba.destroy();
        this.attachments.splice(i-1, 1);
    };

    BlockBase.prototype.announceOutput = function (number) {
        if (this.hasOutput) {
            this.hasOutput.fire(number);
        }
    };

    mylib.Base = BlockBase;
}
module.exports = createBlockBase;