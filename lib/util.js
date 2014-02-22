(function () {
    var utilClass = function (sys) {
        this.sys = sys;
    };
    utilClass.prototype.getUtils = function () {
        var sys = this.sys;
        return {
            apiError: function (response,err,str,transaction) {
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
            }
        }
    }
    exports.utilClass = utilClass;
})();
