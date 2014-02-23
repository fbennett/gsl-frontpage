(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;
        var personID = params.personid;

        var sql = 'SELECT name,contact,affiliation,position '
            + 'FROM persons '
            + 'JOIN names USING(nameID) '
            + 'JOIN contacts USING(contactID) '
            + 'JOIN affiliations USING(affiliationID) '
            + 'JOIN positions USING(positionID) '
            + 'WHERE personID=?';

        sys.db.get(sql,[personID],function(err,row){
            if (err) {return oops(response,err,'event/getoneperson(1)')};
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.end(JSON.stringify(row));
        });
    }
    exports.cogClass = cogClass;
})();
