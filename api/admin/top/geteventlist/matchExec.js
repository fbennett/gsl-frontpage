(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;

        var sql = 'SELECT eventID,strftime("%Y-%m-%d",(pageDate/1000),"unixepoch") AS date,name AS presenter,title '
            + 'FROM events '
            + 'JOIN titles USING(titleID) '
            + 'JOIN persons ON persons.personID=events.presenterID '
            + 'JOIN names ON names.nameID=persons.nameID '
            + 'ORDER BY pageDate DESC';

        sys.db.all(sql,function(err,rows){
            if (err||!rows) {return oops(response,err,'geteventlist(1)')};
            console.log("EVENTS(1): "+rows);
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(rows))
        });
    }
    exports.cogClass = cogClass;
})();
