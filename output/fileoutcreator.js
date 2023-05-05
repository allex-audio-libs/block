var fs = require('fs');

function createFileOutBlock (lib, bufferlib, mylib) {
    'use strict';

    var MyBase = mylib.OutputBase;

    function FileOutBlock () {
        MyBase.call(this);
        this.file = null;
        fs.open('output.raw', 'w', this.onFileOpen.bind(this));
    }
    lib.inherit(FileOutBlock, MyBase);
    FileOutBlock.prototype.destroy = function () {
        if (this.file) {
            fs.close(this.file);
        }
        MyBase.prototype.destroy.call(this);
    };
    FileOutBlock.prototype.convertSampleForOutput = function (input) {
        return input * 32200;
    };
    FileOutBlock.prototype.onSamplesInput = function (sample) {
        this.writeSampleToBuffer(sample);
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

    FileOutBlock.prototype.myWriteMethod = 'Int16LE';

    mylib.FileOut = FileOutBlock;
}
module.exports = createFileOutBlock;