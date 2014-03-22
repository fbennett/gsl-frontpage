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
                processData(result);
                return;
            };
            var eventID = rows[pos].eventID;
            var iterateMe = function(carrier,data) {
                if (data.status > -1 && data.published) {
                    if (data.presenter) {
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

            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(['success']));
        };
        
    }
    exports.cogClass = cogClass;
})();
