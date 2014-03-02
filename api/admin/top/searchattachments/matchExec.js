(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;
        var str = params.str;
        if (!str) {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify([]));
        }
        var sql = 'SELECT documentID AS attachmentID, title AS attachment '
            + 'FROM documents '
            + 'JOIN titles USING(titleID) '
            + 'WHERE uploadDate IS NULL '
            + '  AND title LIKE \'%' + str + '%\' '
            + 'ORDER BY title;';
        sys.db.all(sql,function(err,rows){
            if (err||!rows) {return oops(response,err,'events/searchattachments(1)')};
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(rows));
        });
    }
    exports.cogClass = cogClass;
})();
