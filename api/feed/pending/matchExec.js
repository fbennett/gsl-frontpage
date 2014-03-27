(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;

        var pages = this.pageEngine(sys);
        var data = 
        var page = pages.composeFeed(data,true;)

        response.writeHead(200, {'Content-Type': 'application/atom+xml'});
        response.end(this.page)
    }
    exports.cogClass = cogClass;
})();
