function createMixins (lib, eventlib, templateslib, mylib) {
    'use strict';

    var mixins = {};

    require('./channelmixincreator')(lib, eventlib, templateslib, mylib, mixins);

    mylib.mixins = mixins;
}
module.exports = createMixins;