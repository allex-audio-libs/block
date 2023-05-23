function createMixins (lib, bufferlib, eventlib, templateslib, mylib) {
    'use strict';

    var mixins = {};

    require('./channelcreator')(lib, eventlib, templateslib, mylib, mixins);
    require('./filterimplementationhandlercreator')(lib, bufferlib, eventlib, templateslib, mylib, mixins);
    require('./classcreatorcreator')(lib, templateslib, mylib, mixins);

    mylib.mixins = mixins;
}
module.exports = createMixins;