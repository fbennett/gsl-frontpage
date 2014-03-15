var fieldMap = {
    "convenor-name-id":"convenorID",
    "presenter-name-id":"presenterID",
    "title":"title",
    "description":"description",
    "note":"note",
    "document-attachment":"documentID",
    "session-title":"title",
    "session-place":"place",
    "session-date":"session-date",
    "session-hour-start":"session-hour-start",
    "session-hour-end":"session-hour-end"
};

function mapField (ret,id,value) {
    if (fieldMap[id]) {
        ret[fieldMap[id]] = value;
    }
};

function previewForm () {
    var ret = {
        pageDate:pageDate
    };
    var required = document.getElementsByClassName('form-required');
    for (var i=0,ilen=required.length;i<ilen;i+=1) {
        mapField(ret,required[i].id,required[i].value);
    }
    var optional = document.getElementsByClassName('form-optional');
    for (var i=0,ilen=optional.length;i<ilen;i+=1) {
        if (optional[i].value) {
            mapField(ret,optional[i].id,optional[i].value);
        }
    }
    var hasPresenter = false;
    var presenter = document.getElementsByClassName('presenter-required');
    for (var i=0,ilen=presenter.length;i<ilen;i+=1) {
        if (presenter[i].value) {
            hasPresenter = true;
            mapField(ret,presenter[i].id,presenter[i].value);
        }
    }
    if (hasPresenter) {
        ret.sessions = {};
        // Grab everything. Total free-for-all scramble from UI chaos to API order.
        var sessionNodes = document.getElementsByClassName('session-required');
        for (var i=0,ilen=sessionNodes.length;i<ilen;i+=1) {
            var sessionNode = sessionNodes[i];
            var smartId = new SmartId(sessionNode.id);
            if (!ret.sessions[smartId.num]) {
                ret.sessions[smartId.num] = {};
            }
            ret.sessions[smartId.num][smartId.id] = sessionNode.value;
        }
        var minStartDate = 0;
        // Reprocess sessions to consolidate  date+start and date+end in two dateTime fields
        for (var sessionKey in ret.sessions) {
            var session = ret.sessions[sessionKey];
            // Extract from date
            var date = extractDate(session['session-date']);
            // Extract from start
            var start = extractTime(session['session-hour-start']);
            // Extract from end
            var end = extractTime(session['session-hour-end']);
            // Compose ...
            var startDateTime = new Date(year=date.year,month=date.month,day=date.day,hour=start.hour,minute=start.minute);
            session.startDateTime = startDateTime.getTime();
            // Track minStartDate
            if (!minStartDate || session.startDateTime < minStartDate) {
                minStartDate = session.startDateTime;
            }
            var endDateTime = new Date(year=date.year,month=date.month,day=date.day,hour=end.hour,minute=end.minute);
            session.endDateTime = endDateTime.getTime();
            // Deletes ...
            delete session['session-date'];
            delete session['session-hour-start'];
            delete session['session-hour-end'];
        }
        // If we have a minStartDate value, use it for pageDate
        if (minStartDate) {
            ret.pageDate = minStartDate;
        }
    }
    // If hasAttachment ...
    var attachments = document.getElementsByClassName('attachment-required');
    for (var i=0,ilen=attachments.length;i<ilen;i+=1) {
        if (!ret.attachments) {
            ret.attachments = [];
        }
        if (attachments[i].value) {
            var smartId = new SmartId(attachments[i].id);
            ret.attachments.push(smartId.num);
        }
    }
    console.log("FORM DATA TO SAVE: "+JSON.stringify(ret,null,2));
    // API save call
    // Receive eventID and set in form
    // API read call (for event/announcement pulldown lists)
    // Update event/announcement pulldown lists in form
    // API read call (for preview)
    // Compose preview popup and display

    // Once this is all working, only template output, mail, and uploads remain!
};

function SmartId (str) {
    var m = str.match(/^([-a-z]+)([0-9]+)(.*)$/);
    this.num = m[2];
    this.id = m[1] + m[3];
};
