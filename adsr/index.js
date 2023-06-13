function createADSR (lib, bufferlib, eventlib, timerlib, templateslib, mylib) {
    'use strict';

    require('./basecreator')(lib, bufferlib, eventlib, timerlib, templateslib, mylib);
}
module.exports = createADSR;