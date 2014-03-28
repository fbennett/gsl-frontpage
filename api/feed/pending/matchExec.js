(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;


        console.log("Well, I'm here (a) ...");

        var pages = sys.pages;
        pages.reset();
        
        var sql = 'SELECT eventID FROM events WHERE (strftime("%s","now")-strftime("%s",touchDate,"unixepoch"))/60>60 AND NOT published=1  ORDER BY pageDate DESC;';
        sys.db.all(sql,function(err,rows){
            if (err) {return oops(response,err,'pending(1)')};

            sys.runEvents(rows,response,processData);

            function processData (data) {
                var page = pages.composeFeed(data,true)
                response.writeHead(200, {'Content-Type': 'application/atom+xml'});
                response.end(page)
            }

        });

    }
    exports.cogClass = cogClass;
})();
