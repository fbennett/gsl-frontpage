(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;
        var eventID = params.eventid;
        var pages = sys.pages;

        var result = {
            events:[],
            announcements:[]
        };

        removeOldEvents();

        // XXX Should be made general
        function removeOldEvents () {
            sys.fs.readdir('outbound/Events',function(err,files){
                if (err) {
                    console.log('Events dir apparently does not yet exist. Ignoring. '+err);
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
                removeOldNews();
            });
        };

        function removeOldNews () {
            sys.fs.readdir('outbound/News',function(err,files){
                if (err) {
                    console.log('News dir apparently does not yet exist. Ignoring.');
                } else {
                    for (var i=0,ilen=files.length;i<ilen;i+=1) {
                        var file = files[i];
                        try {
                            sys.fs.unlinkSync('outbound/News/' + file);
                        } catch (e) {
                            console.log("OOPS: "+e);
                            for (var key in sys.fs) {
                                console.log("  "+key);
                            }
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

                result.events = result.events.slice(0,10);
                result.announcements = result.announcements.slice(0,10);

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

            pages.composeIndex(data);
            for (var i=0,ilen=data.events.length;i<ilen;i+=1) {
                pages.composeEvent(data.events[i]);
            }
            for (var i=0,ilen=data.announcements.length;i<ilen;i+=1) {
                pages.composeAnnouncement(data.announcements[i]);
            }
            var feedling = [];
            for (var i=0,ilen=data.events.length;i<ilen;i+=1) {
                var event = data.events[i];
                // The value at 'event' dumps the serialized "page" without writing to disk
                var pageling = [event.pageDate,pages.composeFeed(event,'events')];
                feedling.push(pageling);
            }
            for (var i=0,ilen=data.announcements.length;i<ilen;i+=1) {
                var announcement = data.announcements[i];
                // The value at 'event' dumps the serialized "page" without writing to disk
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

            try {
                var rsync = sys.spawn('rsync',['-av','--rsh=/usr/bin/sshpass -f .sshpass.txt /usr/bin/ssh -l en','outbound/Events/','law.nagoya-u.ac.jp:/var/www/html/en/Events'],{env:process.env});
                rsync.stderr.on('data', function (data) {
                    console.log('rsync stdErr: ' + data);
                });
                rsync.stdout.on('data', function (data) {
                    console.log('rsync stdOut: ' + data);
                });
                var rsync = sys.spawn('rsync',['-av','--rsh=/usr/bin/sshpass -f .sshpass.txt /usr/bin/ssh -l en','outbound/News/','law.nagoya-u.ac.jp:/var/www/html/en/News'],{env:process.env});
                rsync.stderr.on('data', function (data) {
                    console.log('rsync stdErr: ' + data);
                });
                rsync.stdout.on('data', function (data) {
                    console.log('rsync stdOut: ' + data);
                });
                var rsync = sys.spawn('rsync',['-av','--rsh=/usr/bin/sshpass -f .sshpass.txt /usr/bin/ssh -l en','outbound/index.atom','law.nagoya-u.ac.jp:/var/www/html/en/index.atom'],{env:process.env});
                rsync.stderr.on('data', function (data) {
                    console.log('rsync stdErr: ' + data);
                });
                rsync.stdout.on('data', function (data) {
                    console.log('rsync stdOut: ' + data);
                });
                var rsync = sys.spawn('rsync',['-av','--rsh=/usr/bin/sshpass -f .sshpass.txt /usr/bin/ssh -l en','outbound/index.html','law.nagoya-u.ac.jp:/var/www/html/en/index.html'],{env:process.env});
                rsync.stderr.on('data', function (data) {
                    console.log('rsync stdErr: ' + data);
                });
                rsync.stdout.on('data', function (data) {
                    console.log('rsync stdOut: ' + data);
                });
            } catch (e) {
                console.log("SPAWN OOPS: "+e);
            }

            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(['success']));
        };


    }
    exports.cogClass = cogClass;
})();
