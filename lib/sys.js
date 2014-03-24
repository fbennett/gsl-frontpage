(function () {
    var sysClass = function (opts,storage) {
        this.sys = opts;
        this.sys.fs = require('fs');
        this.sys.marked = require('marked');
        this.sys.multiparty = require('multiparty');
        this.sys.wordwrap = require('wordwrap')(65);
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
                
                var sql = 'SELECT events.eventID,convenorID,'
                    + 'convenornames.name AS convenorName,convenorcontacts.contact AS convenorContact,convenoraffiliations.affiliation AS convenorAffiliation,convenorpositions.position AS convenorPosition,'
                    + 'title,description,note,presenterID,'
                    + 'presenternames.name AS presenterName,presentercontacts.contact AS presenterContact,presenteraffiliations.affiliation AS presenterAffiliation,presenterpositions.position AS presenterPosition,events.pageDate,events.touchDate,status,published '
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

        function inferUiDate (unixEpoch) {
            var jsEpoch = unixEpoch * 1000;
            var jsDate = new Date(jsEpoch);
            return (jsDate.getFullYear() + '-' + (jsDate.getMonth()+1) + '-' + jsDate.getDate());
        };

        function inferUiTime (unixEpoch) {
            var jsEpoch = unixEpoch * 1000;
            var jsDate = new Date(jsEpoch);
            var minute = padNumber(jsDate.getMinutes(),2);
            return (jsDate.getHours() + ':' + minute);
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

        function convertDates(data,converter) {
            if (!converter) {
                converter = getUnixEpoch;
            }
            var dateKeys = {
                touchDate:true,
                uploadDate:true,
                startDateTime:true,
                endDateTime:true,
                pageDate:true
            }
            for (var key in data) {
                if (dateKeys[key] && data[key]) {
                    console.log("Converting: "+key+" which is "+data[key]);
                    data[key] = converter(data[key]);
                    console.log("  now "+data[key]);
                }
            }
        };

        function convertAllDates(data,converter) {
            convertDates(data,converter);
            var segments = ['attachments','sessions'];
            for (var i=0,ilen=segments.length;i<ilen;i+=1) {
                var segment = segments[i];
                if (data[segment] && data[segment].length) {
                    for (var j=0,jlen=data[segment].length;j<jlen;j+=1) {
                        var obj = data[segment][j];
                        convertDates(obj,converter);
                    }
                }
            }
            
        };

        function utcCalendarDate (jsDate) {
            var year = jsDate.getUTCFullYear();
            var month = this.padNumber(jsDate.getUTCMonth()+1,2);
            var day = this.padNumber(jsDate.getUTCDate(),2);
            var hours = this.padNumber(jsDate.getUTCHours(),2);
            var minutes = this.padNumber(jsDate.getUTCMinutes(),2);
            var seconds = this.padNumber(jsDate.getUTCSeconds(),2);
            return year + month + day + 'T' + hours + minutes + seconds + 'Z';
        };

        function utcFeedDate (jsDate) {
            var year = jsDate.getUTCFullYear();
            var month = this.padNumber(jsDate.getUTCMonth()+1,2);
            var day = this.padNumber(jsDate.getUTCDate(),2);
            var hours = this.padNumber(jsDate.getUTCHours(),2);
            var minutes = this.padNumber(jsDate.getUTCMinutes(),2);
            var seconds = this.padNumber(jsDate.getUTCSeconds(),2);
            var milliseconds = this.padNumber(jsDate.getUTCMilliseconds(),3);
            return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds + '.' + milliseconds + 'Z';
        };

        var pageEngine = function (sys) {
            this.sys = sys;
            this.maps = {
                main:{
                    '@@CONVENOR_NAME@@':'convenorName',
                    '@@CONVENOR_CONTACT@@':'convenorContact',
                    '@@CONVENOR_AFFILIATION@@':'convenorAffiliation',
                    '@@CONVENOR_POSITION@@':'convenorPosition',
                    '@@TITLE@@':'title',
                    '@@DESCRIPTION@@':'description',
                    '@@NOTE@@':'note',
                    '@@PRESENTER_NAME@@':'presenterName',
                    '@@PRESENTER_CONTACT@@':'presenterContact',
                    '@@PRESENTER_AFFILIATION@@':'presenterAffiliation',
                    '@@PRESENTER_POSITION@@':'presenterPosition',
                    '@@PAGE_DATE@@':'pageDate',
                    '@@EVENT_ID@@':'eventID'
                },
                sessions:{
                    '@@TITLE@@':'title',
                    '@@PLACE@@':'place',
                    '@@START_DATE_TIME@@':'startDateTime',
                    '@@END_DATE_TIME@@':'endDateTime'
                },
                attachments:{
                    '@@TITLE@@':'title',
                    '@@DOCUMENT_ID@@':'documentID'
                }
            };
            
            this.registerComposer = function (name,ext,pathGen,virtuals) {
                this['compose' + name] = function (data,dumpString) {
                    return this.masterComposer(name,ext,pathGen,virtuals,data,dumpString);
                };
                this['set' + name + 'Virtual'] = function (key,func) {
                    name = name.toLowerCase();
                    virtuals[name][key] = func;
                };
            };
        };

        pageEngine.prototype.masterComposer = function(name,ext,pathGen,virtuals,data,dumpString) {
            // A little namespace pollution here
            this.name = name.toLowerCase();
            this.ext = ext;
            this.page = this.getTemplate();
            this.virtuals = virtuals;

            if (data.events || data.announcements) {
                console.log("Running events or announcements list. THIS SHOULD NOT HAPPEN.");
                this.processTemplate('announcements',data.announcements);
                this.processTemplate('events',data.events);
            } else {
                console.log("Running item. This is okay.");
                this.processTemplate('attachments',data.attachments);
                this.processTemplate('sessions',data.sessions);
            }
            var path = pathGen(data);
            var subSeg;
            if (dumpString) {
                subSeg = dumpString;
            } else {
                subSeg = null;
            }
            var page = this.processTemplate(subSeg,data)
            if (dumpString) {
                return page;
            } else {
                this.writePage(path,page);
                return page;
            }
        };

        pageEngine.prototype.processTemplate = function(dSeg,data) {
            console.log("Running template: "+dSeg);
            var block;
            var name = this.name;
            var sys = this.sys;
            var virtuals = this.virtuals;
            var maps = this.maps;

            var mSeg;
            if (!dSeg || ['announcements','events'].indexOf(dSeg) > -1) {
                mSeg = 'main';
            } else {
                mSeg = dSeg;
            }

            if (!dSeg) {
                dSeg = name;
                block = this.page;
            } else {
                heading = this.getTemplate(dSeg + '-heading');
                block = this.getTemplate(dSeg);
            }
            if (!data) {
                return block;
            }
            console.log("  --> so far, so good");
            // We could have a keyed object, or a list of keyed objects.
            if ("undefined" === typeof data.length) {
                block = runTemplate(block,data);
            } else {
                var template = block;
                block = '';
                for (var i=0,ilen=data.length;i<ilen;i+=1) {
                    var pos = i;
                    if (data.length < 2) {
                        pos = -1;
                    }
                    block += runTemplate(template,data[i],pos);
                }
            }

            function runTemplate (block,datum,pos) {
                if (virtuals[name]['@@LEDE@@']) {
                    substituteVirtual('@@LEDE@@',name);
                }
                if (virtuals[name]['@@SESSIONS@@']) {
                    substituteVirtual('@@SESSIONS@@',name);
                    delete virtuals[name]['@@SESSIONS'];
                }
                if (virtuals[name]['@@ATTACHMENTS@@']) {
                    substituteVirtual('@@ATTACHMENTS@@',name);
                    delete virtuals[name]['@@ATTACHMENTS'];
                }
                for (var key in virtuals[dSeg]) {
                    substituteVirtual(key,dSeg);
                }
                function substituteVirtual(key,dSeg) { 
                    var rex = new RegExp(key,'g');
                    var chip = virtuals[dSeg][key].call(sys,datum,pos);
                    if (chip) {
                        block = block.replace(rex,chip);
                    } else {
                        block = block.replace(rex,'');
                    }
                };

                for (var key in maps[mSeg]) {
                    var rex = new RegExp(key,'g');
                    var chip = datum[maps[mSeg][key]];
                    if (chip) {
                        block = block.replace(rex,chip);
                    } else {
                        block = block.replace(rex,'');
                    }
                }
                return block;
            }

            if (block) {
                block = heading + block;
            }

            console.log("SETTING " + name + " @@"+dSeg.toUpperCase() + '@@');
            this.virtuals[name]['@@' + dSeg.toUpperCase() + '@@'] = function() {
                return block;
            }
            return block;
        };

        pageEngine.prototype.getTemplate = function(dSeg) {
            var name = this.name;
            if (dSeg) {
                name = name + '-' + dSeg;
            }
            name = name + '.' + this.ext;
            // Now call up the template and return it as a string.
            var ret;
            try {
                ret = sys.fs.readFileSync('site/' + name).toString();
            } catch (e) {
                ret = '';
            }
            return ret;
        };

        pageEngine.prototype.writePage = function(path,page) {
            var sys = this.sys;
            path = 'outbound/' + path;

            // Assure directory exists
            var pathLst = path.split('/');
            for (var i=0,ilen=pathLst.length-1;i<ilen;i+=1) {
                var p = pathLst.slice(0,i+1).join('/');
                try {
                    sys.fs.readdirSync(p);
                } catch (e) {
                    sys.fs.mkdirSync(p);
                }
            }
            sys.fs.writeFileSync(path,page);
        };

        this.sys.pageEngine = pageEngine;
        this.sys.utcFeedDate = utcFeedDate;
        this.sys.utcCalendarDate = utcCalendarDate;
        this.sys.padNumber = padNumber;
        this.sys.getJsEpoch = getJsEpoch;
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
