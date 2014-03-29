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

            if (sys.admin[params.admin]
                && params.cmd === 'upload') {

                var form = new sys.multiparty.Form();
                form.parse(request, function(err, fields, files) {
                    // Put it where you will.
                    var adminID = sys.admin[params.admin];

                    var touchDate = parseInt(fields.pageDate,10);
                    var pageDate = null;
                    if (!fields.searchableTitle) {
                        pageDate = parseInt(fields.pageDate,10);
                    }
                    var attachmentTitle = fields.attachmentTitle[0];
                    var docTxt = fs.readFileSync(files.attachmentDocument[0].path);
                    var mimeType = fields.mimeType[0];
                    var filenameExtension = fields.filenameExtension[0];
                    var dateFlag = !fields.searchableTitle;

                    if (dateFlag) {
                        checkUniqueDocument();
                    } else {
                        checkSearchableDocument();
                    }

                    function checkSearchableDocument () {
                        //console.log("checkSearchableDocument()");
                        var sql = 'SELECT documentID '
                            + 'FROM documents '
                            + 'JOIN titles USING(titleID) '
                            + 'WHERE title=? '
                            + 'AND uploadDate IS NULL;';
                        sys.db.get(sql,[attachmentTitle],function(err,row){
                            if (err) {return oops(response,err,'upload(1)')};
                            if (row && row.documentID) {
                                updateDocument(row.documentID);
                            } else {
                                checkTitle(attachmentTitle);
                            }
                        });
                    };
                    
                    function checkUniqueDocument () {
                        //console.log("checkUniqueDocument() with "+pageDate);
                        var sql = 'SELECT documentID '
                            + 'FROM documents '
                            + 'JOIN titles USING(titleID) '
                            + 'WHERE title=? '
                            + 'AND uploadDate=?;';
                        sys.db.get(sql,[attachmentTitle,pageDate],function(err,row){
                            if (err) {return oops(response,err,'upload(2)')};
                            if (row && row.documentID) {
                                updateDocument(row.documentID);
                            } else {
                                checkTitle(attachmentTitle);
                            }
                        });
                    };
                    
                    function updateDocument(documentID) {
                        //console.log("updateDocument();");
                        // Replace existing file with upload (filesystem operation)
                        fs.writeFileSync(sys.document_path + '/' + documentID,docTxt);
                        var sql = 'UPDATE documents SET mimeType=?,filenameExtension=?,touchDate=? WHERE documentID=?;';
                        sys.db.run(sql,[mimeType,filenameExtension,touchDate,documentID],function(err){
                            if (err) {return oops(response,err,'upload(3)')};
                            finishUpload(documentID);
                        });
                    };

                    function checkTitle (attachmentTitle) {
                        //console.log("checkTitle();");
                        var sql = 'SELECT titleID FROM titles WHERE title=?;';
                        sys.db.get(sql,[attachmentTitle],function(err,row){
                            if (err) {return oops(response,err,'upload(4)')};
                            if (row && row.titleID) {
                                addDocument(row.titleID);
                            } else {
                                addTitle(attachmentTitle);
                            }
                        });
                    };

                    function addTitle(attachmentTitle) {
                        //console.log("addTitle();");
                        var sql = 'INSERT INTO titles VALUES (NULL,?);';
                        sys.db.run(sql,[attachmentTitle],function(err){
                            if (err) {return oops(response,err,'upload(5)')};
                            addDocument(this.lastID);
                        });
                    };

                    function addDocument (titleID) {
                        //console.log("addDocument();");
                        // Insert database row and get ID
                        var sql = 'INSERT INTO documents VALUES (NULL,?,?,?,?,?);';
                        sys.db.run(sql,[titleID,mimeType,filenameExtension,touchDate,pageDate],function(err){
                            if (err) {return oops(response,err,'upload(6)')};
                            saveDocument(this.lastID)
                        });
                    };

                    function saveDocument (documentID) {
                        //console.log("saveDocument();");
                        // Add a document under database ID
                        fs.writeFileSync(sys.document_path + '/' + documentID, docTxt);
                        finishUpload(documentID);
                    };

                    function finishUpload(documentID) {
                        //console.log("finishUpload();");
                        // Send back documentID, so browser can update page
                        response.writeHead(200, {'Content-Type': 'application/json'});
                        response.end(JSON.stringify({documentID:documentID,documentTitle:attachmentTitle}));
                    }
                })
            } else {
                serveMe();
            }
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
                    //console.log("this.url="+this.url);
                    
                    if (this.POSTDATA) {
                        var payload;
                        if (!request.headers['content-type'].match(/multipart\/form-data/)) {
                            payload = JSON.parse(this.POSTDATA);
                            for (var key in payload) {
                                params[key] = payload[key];
                            }
                        }
                    }
                    
                    if (uriObj.href.match(/\/attachments\/[0-9]+$/)) {
                        var m = uriObj.href.match(/attachments\/([0-9]+)$/);
                        var documentID = m[1];
                        var docTxt = fs.readFileSync('./attachments/' + documentID);
                        // XXX Response is governed by a database lookup
                        var sql = 'SELECT title,filenameExtension,mimeType FROM documents JOIN titles USING(titleID) WHERE documentID=?;';
                        sys.db.get(sql,[documentID],function(err,row){
                            if (err) {return oops(response,err,'download(1)')};
                            if (row && row.title) {
                                // Get mime type, title and file extension from the DB
                                var filenameExtension = row.filenameExtension;
                                if (filenameExtension && filenameExtension.slice(0,1) !== '.') {
                                    filenameExtension = '.' + filenameExtension;
                                }
                                response.writeHead(200, {'Content-Type': row.mimeType,
                                                         "Content-Disposition": "attachment; filename=" + encodeURIComponent(row.title + filenameExtension)
                                                        });
                                response.end(docTxt);
                            } else {
                                response.writeHead(404, {'Content-Type': 'text/plain'});
                                response.end('File not found in database');
                            }
                        });
                        return;
                    } else if ('.js' === uriObj.href.slice(-3)) {
                        var myxml = fs.readFileSync(__dirname + '/../' + uriObj.href.replace(/^.*?\/(js|node_modules)\/(.*)/, '$1/$2'));
                        response.writeHead(200, {'Content-Type': 'text/javascript'});
                        response.end(myxml);
                        return;
                    } else if ('.css' === uriObj.href.slice(-4)) {
                        //console.log(__dirname + '/' + uriObj.href.replace(/^.*?\/(css\/.*)/, '$1'));
                        var myxml = fs.readFileSync(__dirname + '/../' + uriObj.href.replace(/^.*?\/(css\/.*)/, '$1'));
                        response.writeHead(200, {'Content-Type': 'text/css'});
                        response.end(myxml);
                        return;
                    } else if ('.png' === uriObj.href.slice(-4)) {
                        //console.log(__dirname + '/' + uriObj.href.replace(/^.*?\/(css\/images\/.*)/, '$1'));
                        var myxml = fs.readFileSync(__dirname + '/../' + uriObj.href.replace(/^.*?\/(css\/images\/.*)/, '$1'));
                        response.writeHead(200, {'Content-Type': 'image/png'});
                        response.end(myxml);
                        return;
                    } else if ('.ico' === uriObj.href.slice(-4)) {
                        //console.log(__dirname + '/' + uriObj.href.replace(/^.*?\/(css\/images\/.*)/, '$1'));
                        var myxml = fs.readFileSync(__dirname + '/../' + uriObj.href.replace(/^.*\/(.*)/, '$1'));
                        response.writeHead(200, {'Content-Type': 'image/x-icon'});
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
