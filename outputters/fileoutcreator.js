var fs = require('fs');

function createFileOutBlock (lib, bufferlib, mylib) {
    'use strict';

    var MyBase = mylib.OutputBase;

    function FileOutBlock () {
        MyBase.call(this);
        this.file = null;
    }
    lib.inherit(FileOutBlock, MyBase);
    FileOutBlock.prototype.destroy = function () {
        purgeFile.call(this);
        MyBase.prototype.destroy.call(this);
    };
    FileOutBlock.prototype.announceURIOutput = function (uri) {
        purgeFile.call(this);
        if (!uri) {
            return;
        }
        fs.open(uri, 'w', this.onFileOpen.bind(this));
    };
    FileOutBlock.prototype.convertSampleForOutput = function (input) {
        return input * 32200;
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

    //statics
    function purgeFile () {
        if (this.file) {
            fs.close(this.file);
        }
        this.file = null;
    }
    //endof statics

    FileOutBlock.prototype.myWriteMethod = 'Int16LE';

    mylib.FileOut = FileOutBlock;
}
module.exports = createFileOutBlock;