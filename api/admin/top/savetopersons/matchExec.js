(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;
        var fields = ['name','contact','affiliation','position'];
        var data = params.data;
        var personID = params.personid;
        var touchDate = sys.getUnixEpoch(params.touchdate);

        sys.db.run('BEGIN TRANSACTION',function(err){
            if (err) {return oops(response,err,'event/savetopersons(1)')};
            checkForFieldStr(0,4);
        });

        function checkForFieldStr (pos,limit) {
           if (pos === limit) {
                if (personID) {
                    updatePerson();
                } else {
                    addPerson();
                }
                return;
            }
            var fieldName = fields[pos];
            var str = data[fieldName];
            var sql = 'SELECT * FROM ' + fieldName +'s WHERE ' +fieldName + '=?;';
            sys.db.get(sql,[str],function(err,row){
                if (err) {return oops(response,err,'event/savetopersons(2)')};
                if (row && row[fieldName + 'ID']) {
                    var fieldID = row[fieldName + 'ID'];
                    data[fieldName + 'ID'] = fieldID;
                    checkForFieldStr(pos+1,limit);
                } else {
                    addFieldStr(fieldName, str, pos, limit);
                }
            });
        };

        function addFieldStr (fieldName, str, pos, limit) {
            var sql = 'INSERT INTO ' + fieldName + 's VALUES(NULL,?);';
            sys.db.run(sql,[str],function (err) {
                if (err) {return oops(response,err,'event/savetopersons(4)')};
                data[fieldName + 'ID'] = this.lastID;
                checkForFieldStr(pos+1,limit);
            });
            
        };

        function updatePerson () {
            var sql = 'INSERT OR REPLACE INTO persons VALUES (?,?,?,?,?,?);';
            sys.db.run(sql,[personID,data.nameID,data.contactID,data.affiliationID,data.positionID,touchDate],function(err){
                if (err) {return oops(response,err,'event/savetopersons(5)')};
                endTransaction(personID);
            });
        };

        function addPerson () {
            var sql = 'INSERT INTO persons VALUES(NULL,?,?,?,?,?);';
            sys.db.run(sql,[data.nameID,data.contactID,data.affiliationID,data.positionID,touchDate],function(err){
                if (err) {return oops(response,err,'event/savetopersons(6)')};
                endTransaction(this.lastID);
            });
        };

        function endTransaction (personID) {
            sys.db.run('END TRANSACTION',function(err){
                if (err) {return oops(response,err,'event/savetopersons(7)')};
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify({personID:personID}))
            });
        };
    }
    exports.cogClass = cogClass;
})();
