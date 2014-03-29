(function () {
    var initClass = function (config,mailer) {
        this.config = config;
        this.config.admin = {};
        this.config.membershipKeys = {};
        var fs = require('fs');
        var sqlite3 = require('sqlite3').verbose();
        var events = require("events");
        var eventEmitter = new events.EventEmitter();
        var db;

        // Getting sane about this
        // When the DB is ready, we emit an event
        // The event is picked up, and items are scheduled by scheduleAllMail
        // The schedule controllers are set on config(sys).admin
        // When an event is rescheduled, the controller is destroyed, and we reschedule with scheduleMail
        // So we need those two functions, and that's it
        // They should just be bare objects, available on scheduler
        // Nothing else is required

        try {
            var fh = fs.openSync('gslfrontpage-' + config.real_port + '.sqlite', 'r')
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
            sql += "INSERT INTO version VALUES ('gslfrontpage'," + getNewSchemaVersion() + ");"
            db.exec(sql,function(err){
                if (err) throw "Error initializing database: " + err;
                setupAdmin(showUrl);
            });
        };

        function setupAdmin(callback) {
            db.run("INSERT OR IGNORE INTO admin VALUES (NULL,?,?,?,?,NULL)",['admin',getRandomKey(8,36), 1,0], function (err) {
                if (err) console.log("Error in setupAdmin(): "+err);
                callback();
            });
        };

        function openDatabase (callback) {
            eventEmitter.on('databaseIsReady',function (db) {
                console.log("Done. Ready to shake, rattle and roll!");
            });
            db = new sqlite3.Database('gslfrontpage-' + config.real_port + '.sqlite');
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
                           checkSchemaVersion();
                       }
                   });
        };
        
        function createVersionTable () {
            db.exec(
                "CREATE TABLE version (schema TEXT PRIMARY KEY, version INT NOT NULL);"
                    + "CREATE INDEX schema ON version(schema);"
                    + "INSERT INTO version VALUES ('gslfrontpage',1);",
                function(err){
                    if (err) {throw 'Error: init(2): '+err};
                    checkSchemaVersion();
                }
            );
        };

        function getNewSchemaVersion () {
            var sql = fs.readFileSync(__dirname + '/../resource/schema.sql').toString();
            var schemaVersion =       parseInt(sql.match(/^-- ([0-9]+)/)[1],10);
            return schemaVersion;
        };

        function checkSchemaVersion () {
            var schemaVersion = getNewSchemaVersion();
            db.get('SELECT version FROM version WHERE schema=?',['gslfrontpage'],function(err,row){
                if (err||!row) {
                    db.run('INSERT INTO version VALUES(?,?)',['gslfrontpage',dbVersion],function(){
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
            db.all('SELECT adminID,name,adminKey,role FROM admin ORDER BY role ASC',[],function(err,rows){

                function makeAdminUrl(config,row) {
                    var port = ':' + config.real_port;
                    var stub = '/';
                    var adminstuff = 'admin=' + row.adminKey + '&';
                    if (config.proxy_hostname.match(/.*\..*/)
                        && config.proxy_hostname !== '127.0.0.1') {

                        port = '';
                        stub = config.gslfrontpage_path + 'admin.html';
                        adminstuff = '';
                    }
                    return "http://" + config.proxy_hostname + port + stub + '?' + adminstuff + 'id=' + row.adminID + '&key=' + row.adminKey;
                };

                for (var i=0,ilen=rows.length;i<ilen;i+=1) {
                    var row = rows[i];
                    
                    if (row.name === 'admin') {
                        console.log("\nAdmin URL: " + makeAdminUrl(config,row) + '\n');
                        config.admin.admin = {key:row.adminKey,role:row.role,id:row.adminID,sched:null};
                    }
                    config.admin[row.adminKey] = {name:row.name,role:row.role,id:row.adminID,sched:null};
                    if (row.role == 1) {
                        console.log("Editor URL for " + row.name + ': ' + makeAdminUrl(config,row));
                    }
                    if (row.role == 2) {
                        console.log("Reviewer URL for " + row.name + ': ' + makeAdminUrl(config,row));
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

