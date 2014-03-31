var http = require('http');
var url = require('url');
var qs = require('querystring');
var fs = require('fs');

var dirs = ['www','www/Events','www/Announcements'];
for (var i=0,ilen=dirs.length;i<ilen;i+=1) {
    var dir = dirs[i];
    try {
        fs.readdirSync(dir);
    } catch (e) {
        fs.mkdirSync(dir);
    }
}

http.createServer(function (request, response) {

    var uriObj = url.parse(request.url);
    var params = qs.parse(uriObj.query);
    params.pathname = uriObj.pathname;

    request.on('data', function(){});
    request.on('end', function(){
        var fileOK = true;
        try {
            var filepath = 'www' + uriObj.href;
            content = fs.readFileSync(filepath);
        } catch (e) {
            fileOK = false;
        }
        var mimeType;
        if (fileOK) {
            if (uriObj.href.slice(-4) === '.ics') {
                respondWith('text/calendar');
            } else if (uriObj.href.slice(-5) === '.html') {
                respondWith('text/html');
            } else if (uriObj.href.slice(-5) === '.atom') {
                respondWith('application/atom+xml');
            } else {
                errorWith('Unrecognized file type.');
            }
        } else {
            errorWith('File not found for '+uriObj.href);
        }
        function respondWith(mimeType) {
            response.writeHead(200, {'Content-Type': mimeType});
            response.end(content);
        }
        function errorWith(err) {
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.end(err);
        }
    });
}).listen(8080);
console.log("Listening on http://localhost:8082");

