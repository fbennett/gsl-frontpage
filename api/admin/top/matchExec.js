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
	var sys = this.sys;
        var userKey = params.userkey;
        var userID = null;
        var userRole = null;
        if (sys.admin[userKey]) {
            userID = sys.admin[userKey].id;
            userRole = sys.admin[userKey].role;
        }

        var republishDisabled = ' disabled="true"';
        if (userRole == 1) {
            republishDisabled = '';
        }

        page = page.replace(/@@HOST_PATH@@/g,this.sys.urlEngine.hostpath());
        page = page.replace(/@@STAFF_NAME@@/g,this.sys.admin[params.key].name);
        page = page.replace(/@@DEFAULT_LANGUAGE@@/g,this.sys.default_language);
        page = page.replace(/@@PUBLISH_DISABLED@@/g,republishDisabled);
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(page)
    }
    exports.cogClass = cogClass;
})();
