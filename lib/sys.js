(function () {
    var sysClass = function (opts,storage) {
        this.sys = opts;
        this.sys.fs = require('fs');
        this.sys.marked = require('marked');
        this.sys.multiparty = require('multiparty')
    };
    sysClass.prototype.getSys = function () {
        function validAdmin (params) {
            return params.admin
                && this.admin[params.admin]
                && this.admin[params.admin].role
                && this.admin[params.admin].role == 1
                ? this.admin[params.admin].name : false
        };
        function markdown (txt,pandocPrep) {
            if (!txt) return '<p>&nbsp;</p>';
            txt = txt.replace(/(:-?\))/g,'(\u0298\u203f\u0298)');
            txt = txt.replace(/(:-\/)/g,'_(\u0361\u0e4f\u032f\u0361\u0e4f)_');
            if (pandocPrep) {
                txt = txt.replace(/<br\/?>/g,'{newline}');
            }
            return this.marked(txt);
        };
        this.sys.spawn = require('child_process').spawn;
        this.sys.markdown = markdown;
        this.sys.validAdmin = validAdmin;
        return this.sys;
    };
    exports.sysClass = sysClass;
})();
