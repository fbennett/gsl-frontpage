(function () {
    var upgraderClass = function (db,fromVersion,toVersion) {
        this.fromVersion = fromVersion;
        this.toVersion = toVersion;
        this.db = db;
    };
    upgraderClass.prototype.run = function (callback) {
        var db = this.db;
        var pos = this.fromVersion-1;
        console.log("Upgrading schema from version " + this.fromVersion + " to version " + this.toVersion);
        var toVersion = this.toVersion;

        var steps = [
            function () {
                db.run('BEGIN TRANSACTION',function(err){
                    reportStep(0,err);
                    performUpgrade();
                });
                function performUpgrade (){
                    db.exec(
                        'ALTER TABLE events ADD COLUMN status INTEGER DEFAULT 0;'
                        ,function(err){
                        reportStep(1,err);
                        setVersion();
                    });
                };
                function setVersion () {
                    db.run('UPDATE version SET version=? WHERE schema=?',[(pos+2),'gslfrontpage'],function(err){
                        reportStep(2,err);
                        closeTransaction();
                    });
                }
                function closeTransaction () {
                    db.run('END TRANSACTION',function(err){
                        reportStep(3,err);
                        nextStep();
                    });
                }
            },
            function () {
                db.run('BEGIN TRANSACTION',function(err){
                    reportStep(0,err);
                    performUpgrade();
                });
                function performUpgrade (){
                    db.exec(
                        'UPDATE persons SET touchDate=(touchDate/1000) WHERE touchDate IS NOT NULL;'
                        + 'UPDATE events SET pageDate=(pageDate/1000) WHERE pageDate IS NOT NULL;'
                        + 'UPDATE sessions SET startDateTime=(startDateTime/1000) WHERE startDateTime IS NOT NULL;'
                        + 'UPDATE sessions SET endDateTime=(endDateTime/1000) WHERE endDateTime IS NOT NULL;'
                        + 'UPDATE documents SET touchDate=(touchDate/1000) WHERE touchDate IS NOT NULL;'
                        + 'UPDATE documents SET uploadDate=(uploadDate/1000) WHERE uploadDate IS NOT NULL;'
                        + 'UPDATE places SET touchDate=(touchDate/1000) WHERE touchDate IS NOT NULL;'
                        ,function(err){
                        reportStep(1,err);
                        setVersion();
                    });
                };
                function setVersion () {
                    db.run('UPDATE version SET version=? WHERE schema=?',[(pos+2),'gslfrontpage'],function(err){
                        reportStep(2,err);
                        closeTransaction();
                    });
                }
                function closeTransaction () {
                    db.run('END TRANSACTION',function(err){
                        reportStep(3,err);
                        nextStep();
                    });
                }
            },
            function () {
                db.run('BEGIN TRANSACTION',function(err){
                    reportStep(0,err);
                    performUpgrade();
                });
                function performUpgrade (){
                    db.exec(
                        'ALTER TABLE events ADD COLUMN touchDate INTEGER;'
                        ,function(err){
                            reportStep(1,err);
                            setVersion();
                        }
                    );
                };
                function setVersion () {
                    db.run('UPDATE version SET version=? WHERE schema=?',[(pos+2),'gslfrontpage'],function(err){
                        reportStep(2,err);
                        closeTransaction();
                    });
                }
                function closeTransaction () {
                    db.run('END TRANSACTION',function(err){
                        reportStep(3,err);
                        nextStep();
                    });
                }
            },
            function () {
                db.run('BEGIN TRANSACTION',function(err){
                    reportStep(0,err);
                    performUpgrade();
                });
                function performUpgrade (){
                    db.exec(
                        'CREATE TEMP TABLE oldSessions AS SELECT * FROM sessions;'
                            + 'DELETE FROM sessions;'
                            + 'CREATE TEMP TABLE oldAttachments AS SELECT * FROM attachments;'
                            + 'DELETE FROM attachments;'
                            + 'CREATE TEMP TABLE oldEvents AS SELECT * FROM events;'
                            + 'DROP TABLE events;'
                            + 'CREATE TABLE events ('
                            + '   eventID INTEGER PRIMARY KEY,'
                            + '   adminID INTEGER NOT NULL,'
                            + '   convenorID INTEGER NOT NULL,'
                            + '   titleID INTEGER NOT NULL,'
                            + '   descriptionID INTEGER NOT NULL,'
                            + '   pageDate INTEGER NOT NULL,'
                            + '   presenterID INTEGER,'
                            + '   noteID INTEGER,'
                            + '   published BOOLEAN,'
                            + '   status INTEGER DEFAULT 0,'
                            + '   touchDate INTEGER NOT NULL,'
                            + '   FOREIGN KEY (adminID) REFERENCES admin(adminID),'
                            + '   FOREIGN KEY (convenorID) REFERENCES persons(personID),'
                            + '   FOREIGN KEY (presenterID) REFERENCES persons(personID),'
                            + '   FOREIGN KEY (titleID) REFERENCES titles(titleID),'
                            + '   FOREIGN KEY (descriptionID) REFERENCES descriptions(descriptionID),'
                            + '   FOREIGN KEY (noteID) REFERENCES notes(noteID)'
                            + ');'
                            + 'INSERT INTO events (eventID,adminID,convenorID,titleID,descriptionID,pageDate,presenterID,noteID,published,status,touchDate) SELECT eventID,1,convenorID,titleID,descriptionID,pageDate,presenterID,noteID,published,status,touchDate FROM oldEvents;'
                            + 'DROP TABLE oldEvents;'
                            + 'INSERT INTO sessions SELECT * FROM oldSessions;'
                            + 'DROP TABLE oldSessions;'
                            + 'INSERT INTO attachments SELECT * FROM oldAttachments;'
                            + 'DROP TABLE oldAttachments;'
                        ,function(err){
                            reportStep(1,err);
                            setVersion();
                        });
                };
                function setVersion () {
                    db.run('UPDATE version SET version=? WHERE schema=?',[(pos+2),'gslfrontpage'],function(err){
                        reportStep(2,err);
                        closeTransaction();
                    });
                }
                function closeTransaction () {
                    db.run('END TRANSACTION',function(err){
                        reportStep(3,err);
                        nextStep();
                    });
                }
            }
        ];

        function reportStep(opno,err) {
            if (err) throw 'Upgrade error at step pos=' + pos + '(' + opno + '): ' + err;
            if (!opno) {
                console.log("* Migrating version " + (pos+1) + " schema to version " + (pos+2));
            }
        };
        function nextStep() {
            pos += 1;
            if (pos === steps.length) {
                callback();
            } else {
                steps[pos]();
            }
        };
        steps[pos]();

    };
    exports.upgraderClass = upgraderClass;
})();
