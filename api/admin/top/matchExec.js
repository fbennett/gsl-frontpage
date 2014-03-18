(function () {
    var cogClass = function () {};
    cogClass.prototype.match = function (params) {
        ret = (this.sys.validAdmin(params,1)
                && !params.cmd
                && !params.commenter
                && (!params.page || params.page === 'top'));
        console.log("WHAT THE FUCK? "+ret);
        return ret;
    };
    cogClass.prototype.exec = function (params, request, response) {
        console.log("RUNME");
        var oops = this.utils.apiError;
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(this.page)
    }
    exports.cogClass = cogClass;
})();
