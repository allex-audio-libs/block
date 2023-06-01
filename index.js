function libCreator(execlib, bufferlib, eventlib, timerlib, templateslib) {
    'use strict';

    var lib = execlib.lib;
    var mylib = {};

    require('./helpers')(lib, mylib);
    require('./mixins')(lib, bufferlib, eventlib, templateslib, mylib);
    require('./basecreator')(lib, bufferlib, eventlib, mylib);
    require('./sampleproducerbasecreator')(lib, bufferlib, eventlib, mylib);
    require('./clockcreator')(lib, timerlib, eventlib, mylib);
    
    //outputters 
    require('./outputters')(lib, bufferlib, eventlib, timerlib, templateslib, mylib);
    //endof outputters 

    require('./generators')(execlib, bufferlib, eventlib, timerlib, templateslib, mylib);

    require('./mathcreator')(lib, templateslib, mylib);

    require('./filters')(lib, bufferlib, templateslib, mylib);

    return mylib;
}

function createLib (execlib) {
    'use strict';
    return execlib.loadDependencies('client', ['allex:audio_buffer:lib', 'allex:audio_eventlite:lib', 'allex:timer:lib', 'allex:templateslite:lib'], libCreator.bind(null, execlib));
}
module.exports = createLib;