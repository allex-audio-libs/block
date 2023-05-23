function createClassCreator (lib, templateslib, mylib, mixins) {
    'use strict';

    //field related stuff
    function isField(field) {
        return field &&
            lib.isString(field.name);
    }
    //endof field related stuff

    //ctor related stuff
    function ctormixiner (mixin) {
        return '\t'+mixin+'.call(this);'
    }
    function ctorfielder (field) {
        if (!field) {
            return '';
        }
        if (lib.isString(field)) {
            return '\tthis.'+field+' = null;'
        }
        if (isField(field)) {
            return '\tthis.'+field.name+' = '+(field.initial ? field.initial : 'null')+';'
        }
        return '';
    }
    function ctorer (options) {
        var lines = ['function '+options.name+' ('+options.ctorparams.join(', ')+') {'];
        if (options.base) {
            lines.push('\t'+options.base+'.call(this);');
        }
        Array.prototype.push.apply(lines, options.mixins.map(ctormixiner));
        Array.prototype.push.apply(lines, options.fields.map(ctorfielder));
        lines.push('}')
        return lines.join('\n');
    }
    //endof ctor related stuff

    //dtor related stuff
    function reverseMap (arry, func) {
        var ret, i;
        ret = [];
        for (i=arry.length-1; i>=0; i--) {
            ret.push(func(arry[i], i, arry));
        }
        return ret;
    }
    function reverseReduce (arry, func, seed) {
        var i;
        for (i=arry.length-1; i>=0; i--) {
            seed = func(seed, arry[i], i, arry);
        }
        return seed;
    }
    function dtormixiner (mixin) {
        return '\t'+mixin+'.prototype.destroy.call(this);';
    }
    function dtorfieldnamer (field) {
        if (lib.isString(field)) {
            return field;
        }
        if (isField(field)) {
            return field.name;
        }
        return '';
    }
    function dtorfielder (res, field) {
        var fname = dtorfieldnamer(field);
        if (!fname) {
            return res;
        }
        if (isField(field)) {
            switch (field.destruction) {
                case 'checkit':
                    res.push([
                        '\tif (this.'+fname+') {',
                        '\t\tthis.'+fname+'.destroy();',
                        '\t};',
                        '\tthis.'+fname+' = null;'
                    ].join('\n'));
                    break;
                case 'nullit':
                    res.push('\tthis.'+fname+' = null;');
                    break;
                case 'ignoreit':
                    return res;
                default:
                    throw new lib.Error('UNRECOGNIZED_DESTRUCTION_OPTION', field.destruction+' is not a recognized "destruction" option');
            }
        }
        return res;
    }
    function dtorer (options) {
        var namestodestroy, lines;
        namestodestroy = reverseReduce(options.fields, dtorfielder, []);
        lines = [options.name+'.prototype.destroy = function () {'];
        Array.prototype.push.apply(lines, namestodestroy);
        Array.prototype.push.apply(lines, reverseMap(options.mixins, dtormixiner));
        if (options.base) {
            lines.push('\t'+options.base+'.prototype.destroy.call(this);');
        }
        lines.push('};');
        return lines.join('\n');
    }
    //endof dtor related stuff

    //methoder related stuff
    function methodliner (line) {
        return '\t'+line+';'
    }
    function singlemethoder (options, res, method, methodname) {
        var a = 5;
        res.lines.push(
            options.name+'.prototype.'+methodname+' = function ('+method.params.join(', ')+') {',
        );
        Array.prototype.push.apply(res.lines, method.lines.map(methodliner));
        res.lines.push('};');
    }
    function methoder (options) {
        var traverseobj = {lines: []}, ret;
        lib.traverseShallow(options.methods, singlemethoder.bind(null, options, traverseobj), '');
        ret = traverseobj.lines;
        options = null;
        traverseobj = null;
        return ret.join('\n');
    }
    //endof methoder related stuff

    /*
    options: {
        name: 'SuperModulator',
        base: 'mylib.Component',
        mixins: [
            'blocklib.mixins.ClockEmitter',
            'blocklib.mixins.SamplesEmitter',
            'blocklib.mixins.SamplesListener'
        ]
    }
    */
    function createClass (options) {
        if (!options) {
            throw new lib.Error('NO_OPTIONS', 'Need options to create a class');
        }
        if (!(lib.isString(options.name) && options.name.length)) {
            throw new lib.Error('NO_CLASS_NAME', 'options must have a name [String]');
        }
        options.ctorparams = options.ctorparams||[];
        options.mixins = options.mixins||[];
        options.fields = options.fields||[];
        options.methods = options.methods||[];
        var ret = [
            '(function () {',
            ctorer(options),
            'lib.inherit('+options.name+', '+options.base+');',
            dtorer(options),
            methoder(options),
            'return '+options.name+';',
            '})()'
        ].join('\n');
        return ret;
    }

    mixins.createClass = createClass;
}
module.exports = createClassCreator;