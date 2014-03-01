(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;
        var documentID = params.documentid;
        var title = params.title;

        var sql = 'SELECT titleID FROM titles WHERE title=?;';
        sys.db.get(sql,[title],function(err,row){
            if (err) {return oops(response,err,'updateattachmenttitle(1)')};
            if (row && row.titleID) {
                updateDocumentTitle(documentID,row.titleID);
            } else {
                addTitle(documentID,title);
            }
        });

        function addTitle (documentID,title) {
            var sql = 'INSERT INTO titles VALUES(NULL, ?);';
            sys.db.run(sql,[title],function(err){
                if (err) {return oops(response,err,'updateattachmenttitle(2)')};
                updateDocumentTitle(documentID,this.lastID);
            });
        };

        function updateDocumentTitle (documentID,titleID) {
            var sql = 'UPDATE documents SET titleID=? WHERE documentID=?';
            sys.db.run(sql,[titleID,documentID],function(err){
                if (err) {return oops(response,err,'updateattachmenttitle(3)')};
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify(['success']))
            });
        };
    }
    exports.cogClass = cogClass;
})();
