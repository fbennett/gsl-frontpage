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
        var sql = 'SELECT personID,name AS person FROM persons JOIN names USING(nameID) WHERE name LIKE \'%' + str + '%\' ORDER BY name;';
        sys.db.all(sql,function(err,rows){
            if (err||!rows) {return oops(response,err,'events/search-persons-person(1)')};
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(rows));
        });
    }
    exports.cogClass = cogClass;
})();
