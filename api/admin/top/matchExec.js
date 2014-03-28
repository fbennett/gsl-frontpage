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
        var oops = this.utils.apiError;
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(this.page)
    }
    exports.cogClass = cogClass;
})();
