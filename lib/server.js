(function () {
    var http = require('http');
    var serverClass = function (sys, api, utils) {
        this.sys = sys;
        this.api = api;
        this.utils = utils;
    };

    serverClass.prototype.runServer = function () {
        var api = this.api;
        var sys = this.sys;
        var utils = this.utils;
        var oops = this.utils.apiError;
        http.createServer(function (request, response) {
            if(request.method == "OPTIONS"){
                var nowdate = new Date();
                response.writeHead(200, {
                    'Date': nowdate.toUTCString(),
                    'Allow': 'GET,POST,OPTIONS',
                    'Content-Length': 0,
                    'Content-Type': 'text/plain',
                });
                response.end('');
                return;
            }

            var fs = require('fs');
            var qs = require('querystring');
            var url = require('url');
            var uriObj = url.parse(request.url);
            var params = qs.parse(uriObj.query);
            params.pathname = uriObj.pathname;

            serveMe();

            function serveMe() {
            request.on('data', function(data){
                if(typeof this.POSTDATA === "undefined"){
                    this.POSTDATA = "";
                }
                this.POSTDATA += data;
                if(this.POSTDATA.length > 1e6) {
                    this.POSTDATA = "";
                    response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                    request.connection.destroy();
                }
            });
                request.on('end', function(){
                    console.log("this.url="+this.url);
                    
                    if (this.POSTDATA) {
                        var payload;
                        if (!request.headers['content-type'].match(/multipart\/form-data/)) {
                            payload = JSON.parse(this.POSTDATA);
                            for (var key in payload) {
                                params[key] = payload[key];
                            }
                        }
                    }
                    
                    if ('.js' === uriObj.href.slice(-3)) {
                        var myxml = fs.readFileSync(__dirname + '/../' + uriObj.href.replace(/^.*?\/(js|node_modules)\/(.*)/, '$1/$2'));
                        response.writeHead(200, {'Content-Type': 'text/javascript'});
                        response.end(myxml);
                        return;
                    } else if ('.css' === uriObj.href.slice(-4)) {
                        console.log(__dirname + '/' + uriObj.href.replace(/^.*?\/(css\/.*)/, '$1'));
                        var myxml = fs.readFileSync(__dirname + '/../' + uriObj.href.replace(/^.*?\/(css\/.*)/, '$1'));
                        response.writeHead(200, {'Content-Type': 'text/css'});
                        response.end(myxml);
                        return;
                    } else {
                        api(params,request,response);
                    }
                });
            }
        }).listen(this.sys.real_port);
    }
    exports.serverClass = serverClass;
})();
