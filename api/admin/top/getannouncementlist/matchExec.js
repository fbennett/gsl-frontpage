(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;

        var sql = 'SELECT eventID,strftime("%Y-%m-%d",(pageDate/1000),"unixepoch") AS date,title '
            + 'FROM events '
            + 'JOIN titles USING(titleID) '
            + 'WHERE presenterID IS NULL '
            + 'ORDER BY pageDate DESC';

        sys.db.all(sql,function(err,rows){
            if (err||!rows) {return oops(response,err,'geteventlist(1)')};
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(rows))
        });
    }
    exports.cogClass = cogClass;
})();
