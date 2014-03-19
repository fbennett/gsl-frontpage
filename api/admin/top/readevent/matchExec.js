(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;
        var eventID = params.eventid;

        var data = {
            eventID:eventID,
            attachments:[],
            sessions:[]
        };

        getEvent();

        function getEvent() {
            
            var sql = 'SELECT convenorID,'
                + 'convenornames.name AS convenorName,convenorcontacts.contact AS convenorContact,convenoraffiliations.affiliation AS convenorAffiliation,convenorpositions.position AS convenorPosition,'
                + 'title,description,note,presenternames.name AS presenter,presenterID,'
                + 'presenternames.name AS presenterName,presentercontacts.contact AS presenterContact,presenteraffiliations.affiliation AS presenterAffiliation,presenterpositions.position AS presenterPosition '
                + 'FROM events '
                + 'JOIN persons AS convenors ON events.convenorID=convenors.personID '
                + 'JOIN names AS convenornames ON convenors.nameID=convenornames.nameID '
                + 'JOIN contacts AS convenorcontacts ON convenors.contactID=convenorcontacts.contactID '
                + 'JOIN affiliations AS convenoraffiliations ON convenors.affiliationID=convenoraffiliations.affiliationID '
                + 'JOIN positions AS convenorpositions ON convenors.positionID=convenorpositions.positionID '
                + 'JOIN titles USING(titleID) '
                + 'JOIN descriptions USING(descriptionID) '
                + 'LEFT JOIN notes USING(noteID) '
                + 'LEFT JOIN persons AS presenters ON events.presenterID=presenters.personID '
                + 'LEFT JOIN names AS presenternames ON presenters.nameID=presenternames.nameID '
                + 'LEFT JOIN contacts AS presentercontacts ON presenters.contactID=presentercontacts.contactID '
                + 'LEFT JOIN affiliations AS presenteraffiliations ON presenters.affiliationID=presenteraffiliations.affiliationID '
                + 'LEFT JOIN positions AS presenterpositions ON presenters.positionID=presenterpositions.positionID '
                + 'WHERE events.eventID=?;';
            sys.db.get(sql,[eventID],function(err,row){
                if (err) {return oops(response,err,'readevent(1)')};
                if (row && row.convenorID) {
                    for (var key in row) {
                        data[key] = row[key];
                    }
                    getAttachments();
                } else {
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(JSON.stringify(data))
                }
            });
        };
        
        function getAttachments() {
            var sql = 'SELECT documents.documentID,title '
                + 'FROM attachments '
                + 'JOIN documents ON documents.documentID=attachments.documentID '
                + 'JOIN titles ON titles.titleID=documents.titleID '
                + 'WHERE eventID=?;';
            sys.db.all(sql,[eventID],function(err,rows){
                if (err) {return oops(response,err,'readevent(2)')};
                if (rows && rows.length) {
                    data.attachments = rows;
                }
                getSessions();
            });
        };

        function getSessions() {
            var sql = 'SELECT title,place,startDateTime,endDateTime '
                + 'FROM sessions '
                + 'JOIN titles ON titles.titleID=sessions.titleID '
                + 'JOIN places ON places.placeID=sessions.placeID '
                + 'WHERE eventID=?;';
            sys.db.all(sql,[eventID],function(err,rows){
                if (err) {return oops(response,err,'readevent(3)')};
                if (rows && rows.length) {
                    data.sessions = rows;
                }
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify(data))
            });
        };

    }
    exports.cogClass = cogClass;
})();
