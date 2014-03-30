(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.sys.apiError;
        var sys = this.sys;
        var str = params.str;
        if (!str) {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify([]));
        }
        var sql = 'SELECT positionID,position FROM positions WHERE position LIKE \'%' + str + '%\' ORDER BY position;';
        sys.db.all(sql,function(err,rows){
            if (err||!rows) {return oops(response,err,'events/searchpositions(1)')};
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(rows));
        });
    }
    exports.cogClass = cogClass;
})();
