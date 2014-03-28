(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;
        var eventID = params.eventid;
        var pages = sys.pages;

        // Set the data acquisition code below as a function in sys, and set processData as a callback
        // Data acquisition can then be repurposed for the local feed

        removeOldEvents();

        function removeOldEvents () {
            
            sys.fs.readdir('outbound/Events',function(err,files){
                if (err) {
                    console.log('Events dir apparently does not yet exist. Ignoring error. '+err);
                } else {
                    for (var i=0,ilen=files.length;i<ilen;i+=1) {
                        var file = files[i];
                        try {
                            sys.fs.unlinkSync('outbound/Events/' + file);
                        } catch (e) {
                            console.log("OOPS: "+e);
                        }
                    }
                }
                removeOldAnnouncements();
            });
        };

        function removeOldAnnouncements () {
            sys.fs.readdir('outbound/Announcements',function(err,files){
                if (err) {
                    console.log('Announcements dir apparently does not yet exist. Ignoring.');
                } else {
                    for (var i=0,ilen=files.length;i<ilen;i+=1) {
                        var file = files[i];
                        try {
                            sys.fs.unlinkSync('outbound/Announcements/' + file);
                        } catch (e) {
                            console.log("OOPS: "+e);
                        }
                    }
                }
                setPublishedToggle();
            });
        };

        function setPublishedToggle () {
            var sql = 'UPDATE events SET published=1 WHERE eventID=?;';
            sys.db.run(sql,eventID,function(err){
                if (err) {return oops(response,err,'publish(1)')};
                getEvents();
            });
        };

        function getEvents () {
            var sql = 'SELECT eventID FROM events WHERE status>-1 AND published=1 ORDER BY pageDate DESC';
            sys.db.all(sql,function(err,rows){
                if (err||!rows) {return oops(response,err,'publish(2)')};
                sys.runEvents(rows,response,processData)
            });
        };
        
        function processData(data) {
            pages.reset();
            pages.composeIndex(data);
            for (var i=0,ilen=data.events.length;i<ilen;i+=1) {
                pages.composeCalendar(data.events[i]);
            }
            for (var i=0,ilen=data.events.length;i<ilen;i+=1) {
                pages.composeEvent(data.events[i]);
            }
            for (var i=0,ilen=data.announcements.length;i<ilen;i+=1) {
                pages.composeAnnouncement(data.announcements[i]);
            }

            allEventsOnly = {events:data.events.slice()};
            data.events = data.events.slice(0,10);
            data.announcements = data.announcements.slice(0,10);

            pages.composeCalendar(allEventsOnly);
            pages.composeFeed(data);
            pages.composeFeed(data.announcements);
            pages.composeFeed(data.events);
            try {
                for (var key in pages.outboundMap) {
                    var rsync = sys.spawn('rsync',['-av','--rsh=/usr/bin/sshpass -f .sshpass.txt /usr/bin/ssh -l en','outbound/' + key,sys.target_web_hostname + ':' + pages.outboundMap[key]],{env:process.env});
                    rsync.stderr.on('data', function (data) {
                        console.log('rsync stdErr: ' + data);
                    });
                    rsync.stdout.on('data', function (data) {
                        console.log('rsync stdOut: ' + data);
                    });
                }
            } catch (e) {
                console.log("SPAWN OOPS: "+e);
            }
            finishPublication();

            function finishPublication() {
                var params = [sys.getUnixEpoch(pages.now)];
                var sqlStr = [];
                for (var key in pages.touchDateIDs) {
                    sqlStr.push(key);

                }
                if (sqlStr.length) {
                    var sql = 'UPDATE events SET touchDate=? WHERE eventID in (' + sqlStr.join(',') + ')';
                    sys.db.run(sql,params,function(err){
                        if (err) {return oops(response,err,'publish(3)')}
                        respondToClient();
                    });
                } else {
                    respondToClient();
                }
            }

            function respondToClient() {
                var sql = 'SELECT eventID,status,published FROM events WHERE eventID=?;';
                sys.db.get(sql,[eventID],function(err,row){
                    if (err|!row) {return oops(response,err,'publish(4)')}
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(JSON.stringify(row));
                });
                
            }
        };

    }
    exports.cogClass = cogClass;
})();
