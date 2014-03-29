(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;
        var eventID = params.eventid;

        var role = null;
        var name = null;
        var userObj = sys.admin[params.userkey];
        if (userObj) {
            role = userObj.role;
            name = userObj.name;
        }

        function respondToServer(response,obj) {
            response.writeHead(200, {'Content-Type': 'application/json'});
            obj.role = role;
            obj.staffName = name;
            response.end(JSON.stringify(obj));
        };

        sys.getEventData(response,eventID,respondToServer);

    }
    exports.cogClass = cogClass;
})();
