function createMixins (lib, eventlib, templateslib, mylib) {
    'use strict';

    var mixins = {};

    require('./channelcreator')(lib, eventlib, templateslib, mylib, mixins);
    require('./filterimplementationhandlercreator')(lib, eventlib, templateslib, mylib, mixins);

    mylib.mixins = mixins;
}
module.exports = createMixins;