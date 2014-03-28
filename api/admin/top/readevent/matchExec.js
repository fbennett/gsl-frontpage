(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;
        var eventID = params.eventid;

        var role = null;
        var userObj = sys.admin[params.userkey];
        if (userObj) {
            role = userObj.role;
        }

        function respondToServer(response,obj) {
            response.writeHead(200, {'Content-Type': 'application/json'});
            obj.role = role;
            response.end(JSON.stringify(obj));
        };

        sys.getEventData(response,eventID,respondToServer);

    }
    exports.cogClass = cogClass;
})();
