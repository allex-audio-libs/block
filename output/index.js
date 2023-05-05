function createOutputBlocks (lib, bufferlib, eventlib, timerlib, templateslib, mylib) {
    'use strict';

    require('./outputbasecreator')(lib, bufferlib, templateslib, mylib);
    require('./fileoutcreator')(lib, bufferlib, mylib);
    require('./speakercreator')(lib, bufferlib, mylib);
}
module.exports = createOutputBlocks;