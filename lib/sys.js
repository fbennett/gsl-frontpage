(function () {
    var sysClass = function (opts,storage) {
        this.sys = opts;
        this.sys.fs = require('fs');
        this.sys.marked = require('marked');
        this.sys.multiparty = require('multiparty')
    };
    sysClass.prototype.getSys = function () {
        var sys = this.sys;
        function validAdmin (params) {
            return params.admin
                && this.admin[params.admin]
                && this.admin[params.admin].role
                && this.admin[params.admin].role == 1
                ? this.admin[params.admin].name : false
        };
        function markdown (txt,pandocPrep) {
            if (!txt) return '<p>&nbsp;</p>';
            txt = txt.replace(/(:-?\))/g,'(\u0298\u203f\u0298)');
            txt = txt.replace(/(:-\/)/g,'_(\u0361\u0e4f\u032f\u0361\u0e4f)_');
            if (pandocPrep) {
                txt = txt.replace(/<br\/?>/g,'{newline}');
            }
            return this.marked(txt);
        };

        function getEventData(response,eventID,callback,carrier) {

            var data = {
                eventID:eventID,
                attachments:[],
                sessions:[]
            };

            return getEvent();

            function getEvent() {
                
                var sql = 'SELECT convenorID,'
                    + 'convenornames.name AS convenorName,convenorcontacts.contact AS convenorContact,convenoraffiliations.affiliation AS convenorAffiliation,convenorpositions.position AS convenorPosition,'
                    + 'title,description,note,presenternames.name AS presenter,presenterID,'
                    + 'presenternames.name AS presenterName,presentercontacts.contact AS presenterContact,presenteraffiliations.affiliation AS presenterAffiliation,presenterpositions.position AS presenterPosition,events.pageDate,status,published '
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
                        if (carrier) {
                            callback(carrier,data);
                        } else {
                            callback(response,data);
                        }
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
                    if (carrier) {
                        callback(carrier,data);
                    } else {
                        callback(response,data);
                    }
                });
            };
            
        };

        function inferUiDay (unixEpoch) {
            var jsEpoch = unixEpoch * 1000;
            var day = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
            var jsDate = new Date(jsEpoch);
            return day[jsDate.getDay()];
        };

        function inferUiDate (unixEpoch,padding) {
            var jsEpoch = unixEpoch * 1000;
            var jsDate = new Date(jsEpoch);
            var month = padNumber(jsDate.getMonth()+1,padding);
            return (jsDate.getFullYear() + '-' + month + '-' + jsDate.getDate());
        };

        function inferUiTime (unixEpoch,padding) {
            var jsEpoch = unixEpoch * 1000;
            var jsDate = new Date(jsEpoch);
            var hour = padNumber(jsDate.getHours(),padding);
            var minute = padNumber(jsDate.getMinutes(),2);
            return (hour + ':' + minute);
        };

        function padNumber (num,padlen) {
            if (!padlen) {
                padlen = 0;
            }
            num = '' + num;
            while (num.length < padlen) {
                num = '0' + num;
            }
            return num;
        };

        function getUnixEpoch (jsDateTime) {
            return (jsDateTime/1000);
        };

        function getJsEpoch (unixDateTime) {
            return (unixDateTime*1000);
        };

        function convertDates(data) {
            var dateKeys = {
                touchDate:true,
                uploadDate:true,
                startDateTime:true,
                endDateTime:true,
                pageDate:true
            }
            for (var key in data) {
                if (dateKeys[key] && data[key]) {
                    data[key] = getUnixEpoch(data[key]);
                }
            }
        };

        function convertAllDates(data) {
            convertDates(data);
            var segments = ['attachments','sessions'];
            for (var i=0,ilen=segments.length;i<ilen;i+=1) {
                var segment = segments[i];
                if (data[segment] && data[segment].length) {
                    for (var j=0,jlen=data[segment].length;j<jlen;j+=1) {
                        var obj = data[segment][j];
                        convertDates(obj);
                    }
                }
            }
            
        };
        this.sys.getUnixEpoch = getUnixEpoch;
        this.sys.convertAllDates = convertAllDates;
        this.sys.inferUiDay = inferUiDay;
        this.sys.inferUiDate = inferUiDate;
        this.sys.inferUiTime = inferUiTime;
        this.sys.getEventData = getEventData;
        this.sys.spawn = require('child_process').spawn;
        this.sys.markdown = markdown;
        this.sys.validAdmin = validAdmin;
        return this.sys;
    };
    exports.sysClass = sysClass;
})();
