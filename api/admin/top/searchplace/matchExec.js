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
        var sql = 'SELECT placeID,place FROM places WHERE place LIKE \'%' + str + '%\' ORDER BY place;';
        sys.db.all(sql,function(err,rows){
            if (err||!rows) {return oops(response,err,'events/searchplace(1)')};
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(rows));
        });
    }
    exports.cogClass = cogClass;
})();
