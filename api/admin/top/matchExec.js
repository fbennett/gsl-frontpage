(function () {
    var cogClass = function () {};
    cogClass.prototype.match = function (params) {
        var ret = false;
        ret = (this.sys.validAdmin(params)
               && this.sys.validStaff(params)
               && (!params.page || params.page === 'top'));
        return ret;
    };
    cogClass.prototype.exec = function (params, request, response) {
        var page = this.page.toString();
        page = page.replace(/@@HOST_PATH@@/,this.sys.urlEngine.hostpath());
        page = page.replace(/@@STAFF_NAME@@/,this.sys.admin[params.key].name);
        page = page.replace(/@@DEFAULT_LANGUAGE@@/,this.sys.default_language);
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(page)
    }
    exports.cogClass = cogClass;
})();
