(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.sys.apiError;
        var sys = this.sys;

        var sql = 'SELECT eventID,'
            + 'strftime("%Y-%m-%d",pageDate,"unixepoch") || " | " || name || " | " || title AS title,'
            + 'status,'
            + 'published '
            + 'FROM events '
            + 'JOIN titles USING(titleID) '
            + 'JOIN persons ON persons.personID=events.presenterID '
            + 'JOIN names ON names.nameID=persons.nameID '
            + 'WHERE events.presenterID IS NOT NULL AND status > -1 '
            + 'ORDER BY pageDate DESC';

        sys.db.all(sql,function(err,rows){
            if (err||!rows) {return oops(response,err,'geteventlist(1)')};
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(rows))
        });
    }
    exports.cogClass = cogClass;
})();
