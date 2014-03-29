(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;
        var userID = params.id;
        var userKey = params.key;

        var pages = sys.pages;
        pages.reset();
        
        var sql = 'SELECT eventID FROM events WHERE (strftime("%s","now")-strftime("%s",touchDate,"unixepoch"))/60>30 AND NOT published=1 and status=0 ORDER BY pageDate DESC;';
        sys.db.all(sql,function(err,rows){
            if (err) {return oops(response,err,'pending(1)')};

            sys.runEvents(rows,response,processData);

            function processData (data) {

                var page = pages.composeFeed(data,null)

                page = page.replace(/@@USER_ID@@/g,userID)
                    .replace(/@@USER_KEY@@/g,userKey);

                response.writeHead(200, {'Content-Type': 'application/atom+xml'});
                response.end(page)
            }

        });

    }
    exports.cogClass = cogClass;
})();
