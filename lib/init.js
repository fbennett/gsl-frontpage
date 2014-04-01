(function () {
    var initClass = function (config) {
        this.config = config;
        this.config.admin = {};
        this.config.membershipKeys = {};
        var fs = require('fs');
        var sqlite3 = require('sqlite3').verbose();
        var events = require("events");
        var eventEmitter = new events.EventEmitter();
        var db;

        // Move any database from old name to new
        try {
            var files = fs.readdirSync('.');
            for (var i=0,ilen=files.length;i<ilen;i+=1) {
                var file = files[i];
                var m = file.match(/^gslfrontpage-([0-9]+)\.sqlite$/);
                if (m) {
                    fs.rename(file,'newswriter-'+m[1]+'.sqlite');
                }
                var m = file.match(/^gslfrontpage-([0-9]+)\.cfg$/);
                if (m) {
                    fs.rename(file,'newswriter-'+m[1]+'.cfg');
                }
            }
        } catch (e) {
            throw 'Ouch.'
        }

        // If style dir does not exist, create it
        try {
            fs.readdirSync('style');
        } catch (e) {
            fs.mkdirSync('style');
        }

        // If style/demo dir does not exist, create it
        try {
            fs.readdirSync('style/demo');
        } catch (e) {
            fs.mkdirSync('style/demo');
        }

        // If style/demo.js does not exist, set a copy from the package
        try {
            fs.readFileSync('style/demo.js');
        } catch (e) {
            var content = fs.readFileSync(__dirname + '/../style/demo.js');
            fs.writeFileSync('style/demo.js',content);
        }

        // If any of style/demo/attachments, style/demo/cache, style/demo/outbound, and style/demo/templates do not exist, create them
        var initDirs = ['attachments','cache','outbound','templates'];
        for (var i=0,ilen=initDirs.length;i<ilen;i+=1) {
            var dir = initDirs[i];
            try {
                fs.readdirSync('style/demo/' + dir);
            } catch (e) {
                fs.mkdirSync('style/demo/' + dir);
            }
        }

        // If style/demo/templates is empty, populate from package
        try {
            var files = fs.readdirSync('style/demo/templates');
            if (!files.length) {
                files = fs.readdirSync(__dirname + '/../style/demo/templates');
                for (var i=0,ilen=files.length;i<ilen;i+=1) {
                    var filename = files[i];
                    var file = fs.readFileSync(__dirname + '/../style/demo/templates/' + filename);
                    fs.writeFileSync('style/demo/templates/' + filename,file);
                }
            }
        } catch (e) {
            console.log("Error initializing directories: "+e);
            return false;
        }

        // Getting sane about this
        // When the DB is ready, we emit an event
        // The event is picked up, and items are scheduled by scheduleAllMail
        // The schedule controllers are set on config(sys).admin
        // When an event is rescheduled, the controller is destroyed, and we reschedule with scheduleMail
        // So we need those two functions, and that's it
        // They should just be bare objects, available on scheduler
        // Nothing else is required

        try {
            var fh = fs.openSync('newswriter-' + config.newswriter_port + '.sqlite', 'r')
            fs.close(fh);
            openDatabase(getStarted);
        } catch (e) {
            if (e.code === 'ENOENT') {
                openDatabase(initEverything);
            } else {
                throw e;
            }
        }

        function initEverything () {
            var sql = fs.readFileSync(__dirname + '/../resource/schema.sql').toString();
            sql += "INSERT INTO version VALUES ('newswriter'," + getNewSchemaVersion() + ");"
            db.exec(sql,function(err){
                if (err) throw "Error initializing database: " + err;
                setupAdmin(showUrl);
            });
        };

        function setupAdmin(callback) {
            db.run("INSERT OR IGNORE INTO admin VALUES (NULL,?,?,?,?,NULL)",['admin',getRandomKey(8,36), 1,0], function (err) {
                if (err) console.log("Error in setupAdmin(): "+err);
                setupReviewer(callback);
            });
        };

        function setupReviewer(callback) {
            db.run("INSERT OR IGNORE INTO admin VALUES (NULL,?,?,?,?,NULL)",['reviewer',getRandomKey(8,36), 2,0], function (err) {
                if (err) console.log("Error in setupReviewer(): "+err);
                callback();
            });
        };

        function openDatabase (callback) {
            eventEmitter.on('databaseIsReady',function (db) {
                console.log("Done. Ready to shake, rattle and roll!");
            });
            db = new sqlite3.Database('newswriter-' + config.newswriter_port + '.sqlite');
            process.on('SIGINT', function() {
                console.log('\nGot SIGINT. So that\'s it, then.');
                try {
                    db.close();
                } catch (e) {
                    console.log("Database already closed, apparently");
                }
                process.exit();
            });
            process.on('exit', function() {
                try {
                    db.close();
                } catch (e) {}
                console.log('About to exit.');
            });
            setForeignKeyConstraints(callback);
        };

        function setForeignKeyConstraints(callback) {
            db.run('PRAGMA foreign_keys = ON;',function(err){
                if (err) {throw 'Error while turning on foreign key constraints: '+err};
                callback();
            });
        };
            
        // Check if we're versioning yet
        function getStarted () {
            db.get("SELECT name FROM sqlite_master WHERE type=? AND name=?",
                   ['table','version'],
                   function(err,row){
                       if (err) {
                           throw 'Error: init(1): '+err;
                       };
                       if (!row || !row.name) {
                           createVersionTable();
                       } else {
                           checkSchemaName();
                       }
                   });
        };
        
        function createVersionTable () {
            db.exec(
                "CREATE TABLE version (schema TEXT PRIMARY KEY, version INT NOT NULL);"
                    + "CREATE INDEX schema ON version(schema);"
                    + "INSERT INTO version VALUES ('newswriter',1);",
                function(err){
                    if (err) {throw 'Error: init(2): '+err};
                    checkSchemaVersion();
                }
            );
        };

        function checkSchemaName() {
            var sql = 'SELECT COUNT(*) AS oldName FROM version WHERE schema=?';
            db.get(sql,['gslfrontpage'],function(err,row){
                if (row && row.oldName > 0) {
                    renameSchema();
                } else {
                    checkSchemaVersion();
                }
            });
        };

        function renameSchema() {
            var sql = "INSERT INTO version (schema,version) SELECT 'newswriter',version FROM version WHERE schema='gslfrontpage';"
                + "DELETE FROM version WHERE schema='gslfrontpage';";
            db.exec(sql,function(err){
                checkSchemaVersion();
            });
        };

        function getNewSchemaVersion () {
            var sql = fs.readFileSync(__dirname + '/../resource/schema.sql').toString();
            var schemaVersion =       parseInt(sql.match(/^-- ([0-9]+)/)[1],10);
            return schemaVersion;
        };

        function checkSchemaVersion () {
            var schemaVersion = getNewSchemaVersion();
            db.get('SELECT version FROM version WHERE schema=?',['newswriter'],function(err,row){
                if (err||!row) {
                    db.run('INSERT INTO version VALUES(?,?)',['newswriter',dbVersion],function(){
                        checkSchemaVersion2(schemaVersion,schemaVersion);
                    });
                } else {
                    var dbVersion = parseInt(row.version,10);
                    checkSchemaVersion2(dbVersion,schemaVersion);
                }
            });
        };

        function checkSchemaVersion2 (dbVersion,schemaVersion) {
            if (schemaVersion > dbVersion) {
                var upgraderModule = require('./upgrades.js');
                var upgrader = new upgraderModule.upgraderClass(db,dbVersion,schemaVersion);
                upgrader.run(showUrl);
            } else {
                showUrl();
            }
        };
        
        /* Utility stuff */
        function purgeStrings () {
            //var sql = "DELETE FROM strings"
            //    + " WHERE stringID NOT IN"
            //    + "   (SELECT DISTINCT stringID FROM questions"
            //    + "    UNION SELECT stringID FROM choices"
            //    + "    UNION SELECT stringID FROM comments);"
            //db.run(sql,function(err){
            //    if (err) console.log("Error in purgeStrings(): "+err);
            //})
        };

        function showUrl () {
            purgeStrings();
            db.all('SELECT adminID,name,adminKey,role FROM admin ORDER BY role ASC,adminID ASC',[],function(err,rows){

                // URL-generation engine provided by opts

                for (var i=0,ilen=rows.length;i<ilen;i+=1) {
                    var row = rows[i];
                    
                    if (i === 0) {
                        config.urlEngine.init(row.adminID,row.adminKey);
                        console.log("\nAdmin URL: " + config.urlEngine.page(row.adminID,row.adminKey) + '\n');
                        config.admin.admin = {key:row.adminKey,role:row.role,id:row.adminID,sched:null};
                    }
                    config.admin[row.adminKey] = {name:row.name,role:row.role,id:row.adminID,sched:null};
                    var url = config.urlEngine.page(row.adminID,row.adminKey);
                    if (row.role == 1) {
                        console.log("Editor URL for " + row.name + ': ' + url);
                    }
                    if (row.role == 2) {
                        console.log("Reviewer URL for " + row.name + ': ' + url);
                    }
                }
                // Emit an event to say the DB is ready and waiting
                eventEmitter.emit('databaseIsReady',db);
            });
        };

        function getRandomKey(len, base) {
            // Modified from http://jsperf.com/random-md5-hash-implementations
            len = len ? len : 16;
            base = base ? base : 16;
            var _results;
            _results = [];
            for (var i=0;i<len;i+=1) {
                _results.push((Math.random() * base | 0).toString(base));
            }
            return _results.join("");
        };
        this.config.getRandomKey = getRandomKey;
        this.config.db = db;
    };
    initClass.prototype.getInit = function () {
        return this.config;
    };
    exports.initClass = initClass;
})();

