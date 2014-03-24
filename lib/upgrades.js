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
