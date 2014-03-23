(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;
        var eventID = params.eventid;

        var result = {
            events:[],
            announcements:[]
        };

        setPublishedToggle();

        function setPublishedToggle () {
            var sql = 'UPDATE events SET published=1 WHERE eventID=?;';
            sys.db.run(sql,eventID,function(err){
                if (err) {return oops(response,err,'publish(1)')};
                getEvents();
            });
        };

        function getEvents () {
            var sql = 'SELECT eventID FROM events';
            sys.db.all(sql,function(err,rows){
                if (err||!rows) {return oops(response,err,'publish(2)')};
                harvestIterator(0,rows.length,rows)();
            });
        };

        function harvestIterator (pos,limit,rows) {
            if (pos === limit) {
                for (var key in result) {
                    for (var i=0,ilen=result[key].length;i<ilen;i+=1) {
                        sys.convertAllDates(result[key][i],sys.getJsEpoch);
                    }
                }
                processData(result);
                return;
            };
            var eventID = rows[pos].eventID;
            var iterateMe = function(carrier,data) {
                if (data.status > -1 && data.published) {
                    if (data.presenterName) {
                        carrier.events.push(data);
                    } else {
                        carrier.announcements.push(data);
                    }
                }
                var harvestRunner = harvestIterator(pos+1,limit,rows);
                if (harvestRunner) harvestRunner();
            }
            return function () {
                sys.getEventData(response,eventID,iterateMe,result);
            }
        };
        
        function processData(data) {
            console.log(JSON.stringify(data,null,2));

            var pages = new pageEngine(sys);
            pages.registerComposer(
                'Index',
                'html',
                function (data) {
                    return 'index.html'
                },
                {
                    index:{},
                    announcements:{},
                    events:{
                        '@@DATE@@':function(data) {
                            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                            var date = new Date(data.pageDate);
                            return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
                        },
                        '@@DOW@@':function(data) {
                            var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                            var date = new Date(data.pageDate);
                            return days[date.getDay()];
                        },
                        '@@NAME_AND_TITLE@@':function(data) {
                            return data.presenterName + ': ' + data.title;
                        }
                    }
                }
            );

            pages.registerComposer(
                'Event',
                'html',
                function (data) {
                    return 'Events/' + data.eventID + '.html'
                },
                {
                    event:{
                        '@@MONTH@@':function(data) {
                            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                            var date = new Date(data.pageDate);
                            return months[date.getMonth()];
                        },
                        '@@DAY@@':function(data) {
                            var date = new Date(data.pageDate);
                            return date.getDate();
                        },
                        '@@DOW@@':function(data) {
                            var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                            var date = new Date(data.pageDate);
                            return days[date.getDay()];
                        },
                        '@@DATE@@':function(data) {
                            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                            var date = new Date(data.pageDate);
                            return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
                        },
                        '@@NAME_AND_TITLE@@':function(data) {
                            return data.presenterName + ': ' + data.title;
                        },
                        '@@NOTE@@':function(data) {
                            var ret = '';
                            if (data.note) {
                                ret = this.markdown(data.note);
                            }
                            return ret;
                        },
                        '@@DESCRIPTION@@':function(data) {
                            var ret = '';
                            if (data.description) {
                                ret = this.markdown(data.description);
                            }
                            return ret;
                        },
                        '@@HOST@@':function(data) {
                            var ret = '';
                            if (data.convenorAffiliation !== data.presenterAffiliation) {
                                ret = data.convenorAffiliation;
                            }
                            return ret;
                        }
                    },
                    sessions:{
                        '@@MONTH@@':function(data) {
                            var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                            var date = new Date(data.startDateTime);
                            return months[date.getMonth()];
                        },
                        '@@DAY@@':function(data) {
                            var date = new Date(data.startDateTime);
                            return date.getDate();
                        },
                        '@@TIME@@':function(data) {
                            var ret;
                            var startTime = new Date(data.startDateTime);
                            var startMinutes = this.padNumber(startTime.getMinutes(),2);
                            var startHours = startTime.getHours();
                            if (data.startDateTime !== data.endDateTime) {
                                var endTime = new Date(data.endDateTime);
                                var endMinutes = this.padNumber(endTime.getMinutes(),2);
                                var endHours = endTime.getHours();
                                ret = startHours + ':' + startMinutes + ' - ' + endHours + ':' + endMinutes;
                            } else {
                                ret = 'at ' + startHours + ':' + startMinutes;
                            }
                            return ret;
                        }
                    },
                    attachments:{}
                }
            );

            pages.registerComposer(
                'Announcement',
                'html',
                function (data) {
                    return 'News/' + data.eventID + '.html'
                },
                {
                    announcement:{
                        '@@DOW@@':function(data) {
                            var date = new Date(data.pageDate);
                            var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                            return days[date.getDay()];
                        },
                        '@@DATE@@':function(data) {
                            var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                            var date = new Date(data.pageDate);
                            var day = date.getDate();
                            var month = months[date.getMonth()];
                            var year = date.getFullYear();
                            return day + ' ' + month + ' ' + year;
                        },
                        '@@NOTE@@':function(data) {
                            var ret = '';
                            if (data.note) {
                                ret = this.markdown(data.note);
                            }
                            return ret;
                        },
                        '@@DESCRIPTION@@':function(data) {
                            var ret = '';
                            if (data.description) {
                                ret = this.markdown(data.description);
                            }
                            return ret;
                        }
                    },
                    sessions:{},
                    attachments:{}
                }
            );

            pages.registerComposer(
                'Calendar',
                'ics',
                function (data) {
                    return 'Events/' + data.eventID + '.ics'
                },
                {
                    calendar:{
                        '@@NAME_AND_TITLE@@':function(data) {
                            return data.presenterName + ': ' + data.title;
                        }
                    },
                    sessions:{
                        '@@SESSION_NUMBER@@':function(data,pos) {
                            return (pos + 1);
                        },
                        '@@NOW@@':function(data) {
                            var date = new Date();
                            return this.utcCalendarDate(date);
                        },
                        '@@START_DATE_TIME@@':function(data) {
                            var date = new Date(data.startDateTime);
                            return this.utcCalendarDate(date);
                        },
                        '@@END_DATE_TIME@@':function(data) {
                            var date = new Date(data.endDateTime);
                            return this.utcCalendarDate(date);
                        },
                        '@@TITLE@@':function(data) {
                            return data.title;
                        }
                    },
                    attachments:{}
                }
            );

            pages.registerComposer(
                'Feed',
                'atom',
                function (data) {
                    return 'index.atom'
                },
                {
                    feed:{
                        '@@NOW@@':function(data) {
                            var date = new Date();
                            return this.utcFeedDate(date);
                        }
                    },
                    events:{},
                    announcements:{},
                    attachments:{},
                    sessions:{}
                }
            );
            
            //pages.composeIndex(data);
            var feedling = [];
            for (var i=0,ilen=data.events.length;i<ilen;i+=1) {
                var event = data.events[i];
                // The value at 'event' dumps the serialized "page" without writing to disk
                var pageling = [event.pageDate,pages.composeFeed(event,'events')];
                feedling.push(pageling);
            }
            for (var i=0,ilen=data.announcements.length;i<ilen;i+=1) {
                var announcement = data.announcements[i];
                // True dumps the serialized "page" without writing to disk
                var pageling = [announcement.pageDate,pages.composeFeed(announcement,'announcements')];
                feedling.push(pageling);
            }
            feedling.sort(function(a,b){
                if (a[0]>b[0]) {
                    return 1;
                } else if (a[0]<b[0]) {
                    return -1;
                } else {
                    return 0;
                }
            });
            var feedEntries = [];
            for (var i=0,ilen=feedling.length;i<ilen;i+=1) {
                feedEntries.push(feedling[i][1]);
            }
            pages.setFeedVirtual('@@ENTRIES@@',function() {
                return feedEntries.join('\n')
            });
            pages.composeFeed({});

            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(['success']));
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
                this.processTemplate('announcements',data.announcements);
                this.processTemplate('events',data.events);
            } else {
                console.log("OOPSIE: "+JSON.stringify(data,null,2));
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
            }
        };

        pageEngine.prototype.processTemplate = function(dSeg,data) {
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
            // We could have a keyed object, or a list of keyed objects.
            console.log("dSeg: "+dSeg);
            if ("undefined" === typeof data.length) {
                block = runTemplate(block,data);
            } else {
                var template = block;
                block = '';
                for (var i=0,ilen=data.length;i<ilen;i+=1) {
                    block += runTemplate(template,data[i],i);
                }
            }

            function runTemplate (block,datum,pos) {
                console.log("dSeg: "+dSeg);
                if (virtuals[dSeg]['@@SESSIONS@@']) {
                    substituteVirtual('@@SESSIONS@@',dSeg);
                    delete virtuals[dSeg]['@@SESSIONS'];
                }
                if (virtuals[dSeg]['@@ATTACHMENTS@@']) {
                    substituteVirtual('@@ATTACHMENTS@@',dSeg);
                    delete virtuals[dSeg]['@@ATTACHMENTS'];
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

    }
    exports.cogClass = cogClass;
})();


/* 


{
  "events": [
    {
      "eventID": 2,
      "attachments": [
        {
          "documentID": 1,
          "title": "Map"
        }
      ],
      "sessions": [
        {
          "title": "Workshop",
          "place": "Law room 906",
          "startDateTime": 1395802800,
          "endDateTime": 1395802800
        },
        {
          "title": "One more",
          "place": "Law room 906",
          "startDateTime": 1396222200,
          "endDateTime": 1396225800
        }
      ],
      "convenorID": 2,
      "convenorName": "Frank Bennett",
      "convenorContact": "2239",
      "convenorAffiliation": "GSL",
      "convenorPosition": "Associate Professor",
      "title": "Multilingual Zotero",
      "description": "This will be an informal session. Problems and style debugging issues will have priority, so if you are having difficulties, bring them to the session. Other topics covered will be determined by the interest of participants.",
      "note": "If you have specific problems you would like to discuss, please bring along your PC so we can examine the issues directly.",
      "presenter": "Frank Bennett",
      "presenterID": 2,
      "presenterName": "Frank Bennett",
      "presenterContact": "2239",
      "presenterAffiliation": "GSL",
      "presenterPosition": "Associate Professor",
      "pageDate": 1395802800,
      "status": 0,
      "published": 1
    }
  ],
  "announcements": [
    {
      "eventID": 4,
      "attachments": [
        {
          "documentID": 1,
          "title": "Map"
        }
      ],
      "sessions": [],
      "convenorID": 1,
      "convenorName": "Saori Okuda",
      "convenorContact": "2232",
      "convenorAffiliation": "GSL",
      "convenorPosition": "Overseas Student Advisor",
      "title": "New Announcement",
      "description": "My description",
      "note": "My note",
      "presenter": null,
      "presenterID": null,
      "presenterName": null,
      "presenterContact": null,
      "presenterAffiliation": null,
      "presenterPosition": null,
      "pageDate": 1395449701.549,
      "status": 0,
      "published": 1
    }
  ]
}

*/
