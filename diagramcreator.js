function createDiagram (lib, mylib) {
    'use strict';

    function isValidBlock (block) {
        if (!block) {
            throw new lib.Error('NO_DIAGRAM_BLOCK', 'A null block was detected in Descriptor');
        }
        if (!lib.isNonEmptyString(block.name)) {
            throw new lib.Error('NO_DIAGRAM_BLOCK_NAME', 'A Diagram block must have a non empty name (String)');
        }
        if (!lib.isNonEmptyString(block.type)) {
            throw new lib.Error('NO_DIAGRAM_BLOCK_TYPE', 'A Diagram block must have a non empty type (String)');
        }
        if (!lib.isFunction(mylib[block.type])) {
            throw new lib.Error('UNSUPPORTED_BLOCK_TYPE', 'A Diagram block defined a type '+block.type+' that is not supported yet');
        }
        return;
    }
    function isValidInOutLinkObj (name, obj) {
        if (!obj) {
            throw new lib.Error('NOT_AN_OBJECT', 'Nothing was provided for '+name+' in link');
        }
        if (!lib.isNonEmptyString(obj.name)) {
            throw new lib.Error('NO_DIAGRAM_LINK_NAME', 'A Diagram link must have a non empty name (String) for its '+name+' object');
        }
        if (!lib.isNonEmptyString(obj.channel)) {
            throw new lib.Error('NO_DIAGRAM_LINK_CHANNEL', 'A Diagram link must have a non empty channel (String) for its '+name+' object');
        }
    }
    function isValidLink (link) {
        if (!link) {
            throw new lib.Error('NO_DIAGRAM_LINK', 'A null link was detected in Descriptor');
        }
        if (!link.out) {
            throw new lib.Error('NO_DIAGRAM_LINK_OUT', 'A Diagram link must have an "out" descriptor');
        }
        if (!link.in) {
            throw new lib.Error('NO_DIAGRAM_LINK_IN', 'A Diagram link must have an "in" descriptor');
        }
        isValidInOutLinkObj('out', link.out);
        isValidInOutLinkObj('in', link.in);
        return;
    }

    function validateDesc (desc) {
        if (!desc) {
            throw new lib.Error('NO_DIAGRAM_DESCRIPTOR', 'Diagram Descriptor was not defined.');
        }
        /*
        if (!lib.isArray(desc.blocks)) {
            throw new lib.Error('NO_DIAGRAM_DESCRIPTOR_BLOCKS', 'Diagram Descriptor must have "blocks" as an Array[Block].');
        }
        if (!lib.isArray(desc.links)) {
            throw new lib.Error('NO_DIAGRAM_DESCRIPTOR_LINKS', 'Diagram Descriptor must have "links" as an Array[Block].');
        }
        */
        lib.isArrayOfHaving(desc.blocks, isValidBlock);
        lib.isArrayOfHaving(desc.links, isValidLink);
    }

    function Diagram () {
        this.blocks = new lib.Map();
        this.links = [];
    }
    Diagram.prototype.destroy = function () {
        this.purge();
        if (this.blocks) {
            this.blocks.destroy();
        }
        this.blocks = null;
        this.links = null;
    };
    Diagram.prototype.load = function (desc) {
        if (!this.blocks) {
            return; //I'm dead already
        }
        validateDesc(desc); //optionally throws
        this.purge();
        desc.blocks.forEach(this.createBlock.bind(this));
        desc.links.forEach(this.createLink.bind(this));
    };
    Diagram.prototype.purge = function () {
        if (this.blocks) {
            lib.containerDestroyAll(this.blocks);
            this.blocks.purge();
        }
        if (lib.isArray(this.links)) {
            lib.arryDestroyAll(this.links); //or maybe NOT, we'll see soon
        }
        this.links = [];
    };

    Diagram.prototype.createBlock = function (blockdesc) {
        var b = new mylib[blockdesc.type]();
        this.blocks.add(blockdesc.name, b);
        if (blockdesc.options) {
            lib.traverseShallow(blockdesc.options, optioner.bind(null, b));
        }
        b = null;
    };
    function optioner (block, optval, optname) {
        var methodname = 'set'+optname, method = block[methodname];
        if (lib.isFunction(method)) {
            method.call(block, optval);
            //b.setVolume(.5) <=> b.setVolume.call(b, .5) <=> b['setVolume'].call(b, .5);
            return;
        }
        //maybe warn?
        console.warn(methodname, 'is not a method of', block.constructor.name);
    }
    Diagram.prototype.createLink = function (linkdesc) {
        var inb, outb;
        inb = this.blocks.get(linkdesc.in.name);
        if (!inb) {
            return; //maybe warn?
        }
        outb = this.blocks.get(linkdesc.out.name);
        if (!outb) {
            return; //maybe warn?
        }
        inb.attachToPreviousBlock(outb, linkdesc.out.channel, linkdesc.in.channel);
    };

    mylib.Diagram = Diagram;
}
module.exports = createDiagram;