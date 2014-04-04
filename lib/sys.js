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

        var apiError = function (response,err,str) {
            if (str) {
                str = " in " + str;
            } else {
                str = "";
            }
            if (err) {
                console.log("Error" + str + ": " + err)
                } else {
                    console.log("Warning" + str + ": no results returned");
                }
            sys.db.run('ROLLBACK TRANSACTION',function(err){
                response.writeHead(500, {'Content-Type': 'text/plain'});
                response.end('server-side error or warning');
            });
        };

        function validAdmin (params) {
            return params.admin
                && this.admin[params.admin]
                && this.admin[params.admin].role
                && this.admin[params.admin].role == 1
                ? this.admin[params.admin].name : false
        };
        function validStaff (params) {
            return params.key
                && this.admin[params.key]
                && this.admin[params.key].id
                && this.admin[params.key].id == params.id
                ? this.admin[params.key].name : false
        };

        var result = {
            events:[],
            announcements:[]
        };

        function runEvents(eventIdRows,response,processDataCallback) {
            result.events = [];
            result.announcements = [];
            var iterator = harvestIterator(0,eventIdRows.length,eventIdRows,response,processDataCallback);
            if (iterator) {
                iterator();
            }
        }

        function harvestIterator (pos,limit,rows,response,processDataCallback) {
            if (pos === limit) {
                for (var key in result) {
                    for (var i=0,ilen=result[key].length;i<ilen;i+=1) {
                        sys.convertAllDates(result[key][i],sys.getJsEpoch);
                    }
                }

                processDataCallback(result);
                return;
            };
            var eventID = rows[pos].eventID;
            var iterateMe = function(carrier,data) {
                //if (data.status > -1 && data.published) {
                    if (data.presenterName) {
                        carrier.events.push(data);
                    } else {
                        carrier.announcements.push(data);
                    }
                //}
                var harvestRunner = harvestIterator(pos+1,limit,rows,response,processDataCallback);
                if (harvestRunner) harvestRunner();
            }
            return function () {
                sys.getEventData(response,eventID,iterateMe,result);
            }
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
                    + 'presenternames.name AS presenterName,presentercontacts.contact AS presenterContact,presenteraffiliations.affiliation AS presenterAffiliation,presenterpositions.position AS presenterPosition,events.pageDate,events.touchDate,status,published,admin.name AS staffName '
                    + 'FROM events '
                    + 'JOIN admin USING(adminID) '
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
                    if (err) {return apiError(response,err,'readevent(1)')};
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
                    if (err) {return apiError(response,err,'readevent(2)')};
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
                    if (err) {return apiError(response,err,'readevent(3)')};
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
                    //console.log("Converting: "+key+" which is "+data[key]);
                    data[key] = converter(data[key]);
                    //console.log("  now "+data[key]);
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
            
            this.touchDateIDs = {};
            var date = new Date();
            this.now = date.getTime();
            
            this.outboundMap = {
                'Events/':sys.fs_events_dir,
                'Announcements/':sys.fs_announcements_dir,
                'Events/index.atom':sys.fs_event_feed_file,
                'Announcements/index.atom':sys.fs_announcement_feed_file,
                'calendar.ics':sys.fs_calendar_file,
                'index.html':sys.fs_top_page_file,
                'index.atom':sys.fs_top_feed_file
            };

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
        
        pageEngine.prototype.reset = function() {
            this.touchDateIDs = {};
            var date = new Date();
            this.now = date.getTime();
        };

        pageEngine.prototype.masterComposer = function(name,ext,pathGen,virtuals,data,dumpString) {
            // A little namespace pollution here
            this.name = name.toLowerCase();
            this.ext = ext;
            this.page = this.getTemplate();
            this.virtuals = virtuals;

            if (data.events || data.announcements) {
                this.processTemplate('announcements',data.announcements);
                this.processTemplate('events',data.events);
            } else if (data.attachments || data.sessions) {
                this.processTemplate('attachments',data.attachments);
                this.processTemplate('sessions',data.sessions);
            } else {
                if (data.length && data[0].presenterName) {
                    this.processTemplate('events',data);
                } else {
                    this.processTemplate('announcements',data);
                }
            }
            var path = pathGen(data);
            var page = this.processTemplate(dumpString,data);
            if ("undefined" !== typeof dumpString) {
                return page;
            } else {
                this.writePage(path,page);
                return page;
            }
        };

        pageEngine.prototype.processTemplate = function(dSeg,data,myBlock) {
            //console.log("processTemplate(): "+dSeg);
            var block;

            var name = this.name;
            var sys = this.sys;
            var virtuals = this.virtuals;
            var maps = this.maps;
            var me = this;

            var mSeg;
            if (!dSeg || ['announcements','events'].indexOf(dSeg) > -1) {
                mSeg = 'main';
            } else {
                mSeg = dSeg;
            }

            if (myBlock) {
                block = myBlock;
            } else if (!dSeg) {
                dSeg = name;
                block = this.page;
            } else {
                heading = this.getTemplate(dSeg + '-heading');
                block = this.getTemplate(dSeg);
            }
            if (!data) {
                return block;
            }
            // We could have a keyed object, or a list of keyed objects.
            if ("undefined" === typeof data.length || name === dSeg) {
                block = runTemplate(block,data);
                if (dSeg === name) {
                    if (data.eventID) {
                        console.log("Finished: "+name+"-main-"+data.eventID);
                        var cacheCode = name + '-main-' + data.eventID;
                        block = this.substituteTouchDate(block,cacheCode,data);
                    } else {
                        var segment = '';
                        if (data.length) {
                            if (data[0].presenterName) {
                                segment = '-events';
                            } else {
                                segment = '-announcements';
                            }
                        }
                        //console.log("Finished: "+name+"-main" + segment);
                        // Use @@NOW@@ or something, not @@TOUCH_DATE@@, in non-event, non-attachment zones
                    }
                }
            } else {
                var template = block;
                block = '';
                for (var i=0,ilen=data.length;i<ilen;i+=1) {
                    var ipos = i;
                    if (data.length < 2) {
                        ipos = -1;
                    }
                    if (dSeg !== name) {
                        if (data[i].sessions) {
                            this.processTemplate('sessions',data[i].sessions);
                        };
                        if (data[i].attachments) {
                            this.processTemplate('attachments',data[i].attachments);
                        };
                    }
                    var newBlock = runTemplate(template,data[i],ipos);
                    if (data[i].eventID) {
                        console.log("Finished: "+name+"-sub-"+data[i].eventID);
                        var cacheCode = name + '-sub-' + data[i].eventID;
                        newBlock = this.substituteTouchDate(newBlock,cacheCode,data[i]);
                    }
                    block += newBlock;
                }
            }
            
            function runTemplate (block,datum,pos) {
                //console.log("  runTemplate(): "+dSeg);
                if (virtuals[name]['@@LEDE@@']) {
                    substituteVirtual('@@LEDE@@',name);
                }
                var blockVirtuals = ['@@SESSIONS@@','@@ATTACHMENTS@@','@@EVENTS@@','@@ANNOUNCEMENTS@@'];
                for (var i=0,ilen=blockVirtuals.length;i<ilen;i+=1) {
                    var virtual = blockVirtuals[i];
                    if (virtuals[name][virtual]) {
                        if (substituteVirtual(virtual,name)) {
                            virtuals[name][virtual] = function(){return ''};
                        }
                    }
                }
                for (var key in virtuals[dSeg]) {
                    substituteVirtual(key,dSeg);
                }
                function substituteVirtual(key,dSeg) {
                    if (block.indexOf(key) === -1) return false;
                    var blockBefore = block;
                    var rex = new RegExp(key,'g');
                    var retVal = rex.exec(block);
                    var chip = virtuals[dSeg][key].call(me,datum,pos);
                    if (chip) {
                        block = block.replace(rex,chip);
                    } else {
                        block = block.replace(rex,'');
                        retVal = false;
                    }
                    return retVal;
                    //if (blockBefore === block) {
                    //    return retVal;
                    //} else {
                    //    return retVal;
                    //}
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

            this.virtuals[name]['@@' + dSeg.toUpperCase() + '@@'] = function() {
                return block;
            }
            return block;
        };

        pageEngine.prototype.substituteTouchDate = function(newBlock,cacheCode,data) {
            var ret = newBlock;
            var virt = this.virtuals[this.name]['@@TOUCH_DATE@@'];
            if (virt) {
                // Check cache for file
                try {
                    this.sys.fs.readdirSync('style/' + this.sys.output_style + '/cache');
                } catch (e) {
                    this.sys.fs.mkdirSync('style/' + this.sys.output_style + '/cache');
                }
                var oldBlock = null;
                try {
                    oldBlock = this.sys.fs.readFileSync('style/' + this.sys.output_style + '/cache/' + cacheCode).toString();
                } catch (e) {}
                // Compare cache copy with generated copy, and raise hasDiff if not equivalent
                // Write to file if hasCache is false or hasDiff is true
                if (!oldBlock || oldBlock !== newBlock) {
                    this.sys.fs.writeFileSync('style/' + this.sys.output_style + '/cache/' + cacheCode,newBlock);
                }
                if (oldBlock && oldBlock == newBlock) {
                    console.log("No change, using old touchDate");
                    // Replace @@TOUCH_DATE@@ with touchDate if hasCache is true and hasDiff is false
                    ret = newBlock.replace(/@@TOUCH_DATE@@/g,virt.call(this,data));
                } else {
                    // Replace @@TOUCH_DATE@@ with now() otherwise, and flag event for touchDate action
                    console.log("Item has changed. Using this.now for touchDate");
                    ret = newBlock.replace(/@@TOUCH_DATE@@/g,virt.call(this,{touchDate:this.now}));
                    this.touchDateIDs[data.eventID] = this.now;
                }
            }
            return ret;
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
                ret = sys.fs.readFileSync('style/' + sys.output_style + '/templates/' + name).toString();
            } catch (e) {
                ret = '';
            }
            return ret;
        };

        pageEngine.prototype.writePage = function(path,page) {
            var sys = this.sys;
            path = 'style/' + sys.output_style + '/outbound/' + path;

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

        var purgeStrings = function() {

            // No need to purge sessions and attachments tables, as they are cleared
            // and rewritten for target event rows on each update.

            // The tricky ones are documents and persons, which are identified
            // by ID in the form for saving, and so cannot be arbitrarily clobbered,
            // since another user might have an unsaved form open that relies on
            // an unattached ID. For these, we require that they touch date be
            // older than one week.

            function purgeError(err) {
                console.log("Error while purging: "+err);
                return false;
            };

            purgePersons();

            var simplePurgeData = [
                {
                    stringTable:'places',
                    stringIdName:'placeID',
                    consumerTable:'sessions'
                },
                {
                    stringTable:'notes',
                    stringIdName:'noteID',
                    consumerTable:'events'
                },
                {
                    stringTable:'descriptions',
                    stringIdName:'descriptionID',
                    consumerTable:'events'
                },
                {
                    stringTable:'names',
                    stringIdName:'nameID',
                    consumerTable:'persons'
                },
                {
                    stringTable:'positions',
                    stringIdName:'positionID',
                    consumerTable:'persons'
                },
                {
                    stringTable:'affiliations',
                    stringIdName:'affiliationID',
                    consumerTable:'persons'
                },
                {
                    stringTable:'contacts',
                    stringIdName:'contactID',
                    consumerTable:'persons'
                }
            ];
            
            function purgePersons() {
                var sql = 'DELETE FROM persons WHERE (strftime("%s","now")-strftime("%s",touchDate,"unixepoch"))/60>10080 '
                    + 'AND personID NOT IN (SELECT personID FROM events);';
                sys.db.run(sql,function(err){
                    if (err) {return purgeError(err)};
                    deleteDocuments();
                });
            };

            function deleteDocuments() {
                var sql = 'SELECT documentID FROM documents WHERE (strftime("%s","now")-strftime("%s",touchDate,"unixepoch"))/60>10080 '
                    + 'AND documentID NOT IN (SELECT documentID FROM events);';
                sys.db.all(sql,function(err,rows){
                    if (err) {return purgeError(err)};
                    for (var i=0,ilen=rows.length;i<ilen;i+=1) {
                        var row = rows[i];
                        var docPath = 'style/' + sys.output_style + '/attachments/' + row.documentID;
                        try {
                            sys.fs.unlinkSync(docPath);
                        } catch (e) {
                            console.log("Attempt to delete " + docPath + " failed");
                        }
                    }
                    purgeDocuments();
                });
            };

            function purgeDocuments() {
                var sql = 'DELETE FROM documents WHERE (strftime("%s","now")-strftime("%s",touchDate,"unixepoch"))/60>10080 '
                    + 'AND documentID NOT IN (SELECT documentID FROM events);';
                sys.db.run(sql,function(err){
                    if (err) {return purgeError(err)};
                    simplePurge(0,simplePurgeData.length);
                });
            };

            function simplePurge(pos,limit) {
                if (pos === limit) {
                    purgeTitles();
                    return;
                }
                var info = simplePurgeData[pos];
                var sql = 'DELETE FROM ' + info.stringTable + ' ' 
                    + 'WHERE ' + info.stringIdName + ' NOT IN (SELECT ' + info.stringIdName + ' FROM ' + info.consumerTable +');';
                sys.db.run(sql,function(err){
                    if (err) {return purgeError(err)};
                    simplePurge(pos+1,limit);
                });
            };

            function purgeTitles() {
                var sql = 'DELETE FROM titles '
                    + 'WHERE titleID NOT IN (SELECT titleID FROM events) '
                    + 'AND titleID NOT IN (SELECT titleID FROM sessions) '
                    + 'AND titleID NOT IN (SELECT titleID FROM documents);';
                sys.db.run(sql,function(err){
                    if (err) {return purgeError(err)};
                    return true;
                });
            };
        };

        this.sys.purgeStrings = purgeStrings;
        this.sys.apiError = apiError;
        this.sys.runEvents = runEvents;
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
        this.sys.validStaff = validStaff;
        return this.sys;
    };
    exports.sysClass = sysClass;
})();
