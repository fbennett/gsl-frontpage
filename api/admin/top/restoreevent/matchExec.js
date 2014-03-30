(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.sys.apiError;
        var sys = this.sys;
        var eventID = params.eventid;

        var data = {
            eventID:eventID
        };

        checkEvent();

        function checkEvent() {
            var sql = 'SELECT published,status FROM events WHERE eventID=?;';
            sys.db.get(sql,[eventID],function(err,row){
                if (err||!row) {return oops(response,err,'restoreevent(1)')};
                data.status = 0;
                data.published = 0;
                restoreEvent();
            });
            
        }

        function restoreEvent () {
            var sql = 'UPDATE events SET status=0,published=0 WHERE eventID=?;';
            sys.db.run(sql,[eventID],function(err){
                if (err) {return oops(response,err,'restoreevent(2)')};
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify(data));
            });
        };
    }
    exports.cogClass = cogClass;
})();
