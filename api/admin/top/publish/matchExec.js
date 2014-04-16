(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.sys.apiError;
        var sys = this.sys;
        var eventID = params.eventid;
        var pages = sys.pages;
        var userKey = params.userkey;
        var userID = null;
        var userRole = null;
        if (sys.admin[userKey]) {
            userID = sys.admin[userKey].id;
            userRole = sys.admin[userKey].role;
        }
        // Set the data acquisition code below as a function in sys, and set processData as a callback
        // Data acquisition can then be repurposed for the local feed

        if (userRole == 1) {
            removeOldEvents();
        } else {
            oops(response,'Failed attempt to publish. User ' + userID +' does not have publishing privileges','publish(0)');
            return;
        }

        function removeOldEvents () {
            
            sys.fs.readdir('style/' + sys.output_style + '/outbound/Events',function(err,files){
                if (err) {
                    console.log('Events dir apparently does not yet exist. Ignoring error. '+err);
                } else {
                    for (var i=0,ilen=files.length;i<ilen;i+=1) {
                        var file = files[i];
                        try {
                            sys.fs.unlinkSync('style/' + sys.output_style + '/outbound/Events/' + file);
                        } catch (e) {
                            console.log("OOPS: "+e);
                        }
                    }
                }
                removeOldAnnouncements();
            });
        };

        function removeOldAnnouncements () {
            sys.fs.readdir('style/' + sys.output_style + '/outbound/Announcements',function(err,files){
                if (err) {
                    console.log('Announcements dir apparently does not yet exist. Ignoring.');
                } else {
                    for (var i=0,ilen=files.length;i<ilen;i+=1) {
                        var file = files[i];
                        try {
                            sys.fs.unlinkSync('style/' + sys.output_style + '/outbound/Announcements/' + file);
                        } catch (e) {
                            console.log("OOPS: "+e);
                        }
                    }
                }
                setPublishedToggle();
            });
        };

        function setPublishedToggle () {
            var sql = 'UPDATE events SET published=1,adminID=? WHERE eventID=?;';
            sys.db.run(sql,[userID,eventID],function(err){
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

            allEventsOnly = {events:data.events.slice()};
            data.events = data.events.slice(0,10);
            data.announcements = data.announcements.slice(0,10);

            pages.composeCalendar(allEventsOnly);
            pages.composeFeed(data);
            pages.composeFeed(data.announcements);
            pages.composeFeed(data.events);
            pages.composeFeed(data);

            for (var i=0,ilen=data.events.length;i<ilen;i+=1) {
                pages.composeEvent(data.events[i]);
            }
            for (var i=0,ilen=data.announcements.length;i<ilen;i+=1) {
                pages.composeAnnouncement(data.announcements[i]);
            }
            pages.composeIndex(data);

            for (var i=0,ilen=data.events.length;i<ilen;i+=1) {
                pages.composeCalendar(data.events[i]);
            }

            rsyncOutput();
            
            function rsyncOutput () {
                var mapLst = [];
                for (var src in pages.outboundMap) {
                    mapLst.push(src)
                }
                mapLst.sort();
                
                rsyncRunUpload(0,mapLst.length);
            
                function rsyncRunUpload(pos,limit) {
                    if (pos == limit) {
                        finishPublication();
                        return
                    }
                    var src = mapLst[pos];
                    var args = null;
                    // For possibilites, we have:
                    if (sys.rsync_binary && sys.sshpass_binary && sys.ssh_binary && sys.account_name && sys.target_hostname) {
                        // * rsync over ssh with sshpass (remote)
                        //     --rsh=/usr/bin/sshpass -f .sshpass.txt /usr/bin/ssh -l en
                        //     sys.target_hostname + ':' + pages.outboundMap[key]
                        //     NEED: rsync_binary, sshpass_binary, ssh_binary, account_name, target_hostname
                        //     NEVER: local_path
                        args = [
                            '-av',
                            '--rsh=' + sys.sshpass_binary + ' -f .sshpass.txt ' + sys.ssh_binary + ' -l ' + sys.account_name,
                            'style/' + sys.output_style + '/outbound/' + src,
                            sys.target_hostname + ':' + pages.outboundMap[src]
                        ];
                    } else if (sys.rsync_binary && sys.ssh_binary && sys.account_name && sys.target_hostname) {
                        // * rsync over ssh with passwordless keys (remote)
                        //     --rsh=/usr/bin/ssh -l en
                        //     sys.target_hostname + ':' + pages.outboundMap[key]
                        //     NEED: rsync_binary, ssh_binary, account_name, target_hostname
                        //     NOT: sshpass_binary
                        //     NEVER: local_path
                        args = [
                            '-av',
                            '--rsh=' + sys.ssh_binary + ' -l ' + sys.account_name,
                            'style/' + sys.output_style + '/outbound/' + src,
                            sys.target_hostname + ':' + pages.outboundMap[src]
                        ];
                    } else if (sys.rsync_binary && sys.fs_local_dir) {
                        // * vanilla rsync (local disk only)
                        //     none
                        //     RELATIVE_PATH_NAME + pages.outboundMap[key]
                        //     NEED: rsync_binary, fs_local_dir
                        //     NEVER: ssh_binary, sshpass_binary, account_name
                        args = [
                            '-av',
                            'style/' + sys.output_style + '/outbound/' + src,
                            sys.fs_local_dir + '/' + pages.outboundMap[src]
                        ];
                    }
                    if (args) {
                        var rsync = sys.spawn(sys.rsync_binary,args,{env:process.env});
                        rsync.stderr.on('data', function (data) {
                            console.log('rsync stdErr: ' + data);
                        });
                        rsync.stdout.on('data', function (data) {
                            console.log('rsync stdOut: ' + data);
                        });
                        rsync.stdout.on('end',function(err){
                            rsyncRunUpload(pos+1,limit);
                        });
                    } else {
                        finishPublication();
                    }
                };
            };

            function finishPublication() {
                var params = [sys.getUnixEpoch(pages.now)];
                var sqlStr = [];
                for (var key in pages.touchDateIDs) {
                    sqlStr.push(key);

                }
                if (sqlStr.length) {
                    console.log("Touch dates for: "+sqlStr.join(','));
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
                sys.purgeStrings(response);
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
