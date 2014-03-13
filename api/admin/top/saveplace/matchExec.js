(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;
        var place = params.place;
        checkPlace();
        
        function checkPlace () {
            var sql = 'SELECT placeID FROM places WHERE place=?;';
            sys.db.get(sql,[place],function(err,row){
                if (err) {return oops(response,err,'saveplace(1)')};
                if (!row || !row.placeID) {
                    addPlace();
                } else {
                    finishTransaction();
                }
            });
        };

        function addPlace () {
            var sql = 'INSERT INTO places VALUES (NULL,?);';
            sys.db.run(sql,[place],function(err){
                if (err) {return oops(response,err,'saveplace(2)');};
                finishTransaction();
            });
        };
        
        function finishTransaction() {
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(['success']))
        };
    }
    exports.cogClass = cogClass;
})();
