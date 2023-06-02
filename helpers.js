function createHelpers (lib, mylib) {
    'use strict';

    function lowerCaseFirst (string) {
        if (!(lib.isString(string) && string.length>0)) {
            return '';
        }
        return string[0].toLowerCase()+string.substring(1);
    }
    function upperCaseFirst (string) {
        if (!(lib.isString(string) && string.length>0)) {
            return '';
        }
        return string[0].toUpperCase()+string.substring(1);
    }

    mylib.lowerCaseFirst = lowerCaseFirst;
    mylib.upperCaseFirst = upperCaseFirst;
}
module.exports = createHelpers;