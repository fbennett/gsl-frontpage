(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;

        var sql = 'SELECT eventID,'
            + 'strftime("%Y-%m-%d",pageDate,"unixepoch") || " | " || '
            + 'CASE WHEN events.presenterID IS NOT NULL '
            + '  THEN names.name || " | " || title '
            + '  ELSE title '
            + 'END AS title,'
            + 'status,'
            + 'published '
            + 'FROM events '
            + 'JOIN titles USING(titleID) '
            + 'LEFT JOIN persons ON persons.personID=events.presenterID '
            + 'LEFT JOIN names ON names.nameID=persons.nameID '
            + 'WHERE status=-1 '
            + 'ORDER BY pageDate DESC';

        sys.db.all(sql,function(err,rows){
            if (err||!rows) {return oops(response,err,'gettrashlist(1)')};
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(rows))
        });
    }
    exports.cogClass = cogClass;
})();
