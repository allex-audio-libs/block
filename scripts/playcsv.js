var execlib;
var blocklib;
var filename;
var duration;

var fs = require('fs')


function go (_blocklib) {
    var inb, incsv, diagram;
    blocklib = _blocklib;
    inb = fs.readFileSync(filename);
    if (!inb) {
        console.error('The Diagram CSV file name', filename, 'must exist and not be empty');
        return;
    }
    try {
        incsv = inb.toString();
        diagram = new blocklib.Diagram();
        diagram.loadcsv(incsv);
        execlib.lib.runNext(process.exit.bind(process, 0), duration);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}


function main (_execlib) {
    var argcount = process.argv.length;
    if (argcount<4) {
        console.error('You have to specify the Diagram CSV file name');
        return;
    }
    filename = process.argv[3];
    duration = (parseFloat(process.argv[4]) || 10) * 1000;
    execlib = _execlib;
    execlib.loadDependencies('client', ['allex__audio_blocklib'], go);
}

module.exports = main;