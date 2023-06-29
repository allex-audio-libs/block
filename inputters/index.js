function createInputters (lib, bufferlib, eventlib, timerlib, templateslib, mylib) {
    'use strict';

    require('./midi')(lib, bufferlib, eventlib, timerlib, templateslib, mylib);
}
module.exports = createInputters;