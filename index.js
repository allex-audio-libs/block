function libCreator(execlib, bufferlib, eventlib, timerlib, templateslib) {
    'use strict';

    var lib = execlib.lib;
    var mylib = {};

    require('./helpers')(lib, mylib);
    require('./mixins')(lib, eventlib, templateslib, mylib);
    require('./basecreator')(lib, bufferlib, eventlib, mylib);
    require('./sampleproducerbasecreator')(lib, bufferlib, eventlib, mylib);
    require('./clockcreator')(lib, timerlib, eventlib, mylib);
    require('./speakercreator')(lib, bufferlib, mylib);
    require('./generatorbasecreator')(lib, mylib);
    require('./periodicgeneratorcreator')(lib, eventlib, mylib);
    require('./sinegeneratorcreator')(lib, mylib);
    require('./sawgeneratorcreator')(lib, mylib);
    require('./trianglegeneratorcreator')(lib, mylib);
    require('./squaregeneratorcreator')(lib, mylib);
    require('./noisegeneratorcreator')(lib, mylib);
    
    require('./mathcreator')(lib, templateslib, mylib);

    require('./filters')(lib, templateslib, mylib);

    require('./diagram')(lib, mylib);

    return mylib;
}

function createLib (execlib) {
    'use strict';
    return execlib.loadDependencies('client', ['allex:audio_buffer:lib', 'allex:audio_eventlite:lib', 'allex:timer:lib', 'allex:templateslite:lib'], libCreator.bind(null, execlib));
}
module.exports = createLib;