(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;
        var eventID = params.eventid;

        function respondToServer(response,obj) {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(obj));
        };

        sys.getEventData(response,eventID,respondToServer);

    }
    exports.cogClass = cogClass;
})();
