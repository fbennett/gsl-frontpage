(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;
        var eventID = params.eventid;

        sys.getEventData(response,eventID,respondToServer);

        function respondToServer(response,data) {

            

            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(data));
        };

    }
    exports.cogClass = cogClass;
})();
