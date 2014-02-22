(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;
        var str = params.str;
        var sql = 'SELECT name FROM personalNames WHERE name LIKE \'%' + str + '%\';';
        sys.db.all(sql,function(err,rows){
            console.log("rows="+rows);
            if (err||!rows) {return oops(response,err,'events/search-persons-person(1)')};
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(rows));
        });
    }
    exports.cogClass = cogClass;
})();
