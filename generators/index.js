function createGenerators (execlib, bufferlib, eventlib, timerlib, templateslib, mylib) {
    'use strict';

    var lib = execlib.lib;

    //generators
    require('./generatorbasecreator')(lib, mylib);
    require('./periodicgeneratorcreator')(lib, eventlib, mylib);
    require('./sinegeneratorcreator')(lib, mylib);
    require('./sawgeneratorcreator')(lib, mylib);
    require('./trianglegeneratorcreator')(lib, mylib);
    require('./squaregeneratorcreator')(lib, mylib);
    require('./noisegeneratorcreator')(lib, mylib);
    //endof generators

    require('./mutatableperiodicgeneratorcreator')(lib, mylib);
}
module.exports = createGenerators;