(function () {
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;
        var data = params.data;

        checkTitle();

        // Check title
        function checkTitle () {
            var sql = 'SELECT titleID FROM titles WHERE title=?;';
            sys.db.get(sql,[data.title],function(err,row){
                if (err) {return oops(response,err,'saveevent(1)')};
                if (row && row.titleID) {
                    data.title = row.titleID;
                    checkDescription();
                } else {
                    addTitle();
                }
            });
        };
        function addTitle () {
            var sql = 'INSERT INTO titles VALUES (NULL,?);';
            sys.db.run(sql,[data.title],function(err){
                if (err) {return oops(response,err,'saveevent(2)')};
                data.title = this.lastID;
                checkDescription();
            });
        };

        // Check description
        function checkDescription () {
            var sql = 'SELECT descriptionID FROM descriptions WHERE description=?;';
            sys.db.get(sql,[data.description],function(err,row){
                if (err) {return oops(response,err,'saveevent(3)')};
                if (row && row.descriptionID) {
                    data.description = row.descriptionID;
                    checkNote();
                } else {
                    addDescription();
                }
            });
        };
        function addDescription () {
            var sql = 'INSERT INTO descriptions VALUES (NULL,?);';
            sys.db.run(sql,[data.description],function(err){
                if (err) {return oops(response,err,'saveevent(4)')};
                data.description = this.lastID;
                checkNote();
            });
        };
        
        // Check note
        function checkNote () {
            var sql = 'SELECT noteID FROM notes WHERE note=?;';
            sys.db.get(sql,[data.note],function(err,row){
                if (err) {return oops(response,err,'saveevent(5)')};
                if (row && row.noteID) {
                    data.note = row.noteID;
                    checkEvent();
                } else {
                    addNote();
                }
            });
        };
        function addNote () {
            var sql = 'INSERT INTO note VALUES (NULL,?);';
            sys.db.run(sql,[data.note],function(err){
                if (err) {return oops(response,err,'saveevent(6)')};
                data.note = this.lastID;
                checkEvent();
            });
        };

        // Add or update event
        function checkEvent () {
            if (data.eventID) {
                updateEvent();
            } else {
                addEvent();
            }
        };
        function updateEvent () {
            // XXX Plus convenorID, presenterID, pageDate
            var presenterID = data.presenterID;
            if (!data.presenterID) {
                presenterID = null;
            }
            var sql = 'UPDATE events SET title=?, description=?, note=?, convenorID=?, presenterID=?, pageDate=? WHERE eventID=?;';
            
        };
        function addEvent () {

        };
        
        // Clear sessions
        // Add sessions

        // Clear attachments
        // Add attachments
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(this.page)
    }
    exports.cogClass = cogClass;
})();
