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
    var data = {
        pageDate:pageDate,
        touchDate:pageDate
    };
    var required = document.getElementsByClassName('form-required');
    for (var i=0,ilen=required.length;i<ilen;i+=1) {
        mapField(data,required[i].id,required[i].value);
    }
    var optional = document.getElementsByClassName('form-optional');
    for (var i=0,ilen=optional.length;i<ilen;i+=1) {
        if (optional[i].value) {
            mapField(data,optional[i].id,optional[i].value);
        }
    }
    var hasPresenter = false;
    var presenter = document.getElementsByClassName('presenter-required');
    for (var i=0,ilen=presenter.length;i<ilen;i+=1) {
        if (presenter[i].value) {
            hasPresenter = true;
            mapField(data,presenter[i].id,presenter[i].value);
        }
    }
    if (hasPresenter) {
        data.sessions = {};
        // Grab everything. Total free-for-all scramble from UI chaos to API order.
        var sessionNodes = document.getElementsByClassName('session-required');
        for (var i=0,ilen=sessionNodes.length;i<ilen;i+=1) {
            var sessionNode = sessionNodes[i];
            var smartId = new SmartId(sessionNode.id);
            if (!data.sessions[smartId.num]) {
                data.sessions[smartId.num] = {};
            }
            mapField(data.sessions[smartId.num],smartId.id,sessionNode.value);
        }
        var minStartDate = 0;
        // Reprocess sessions to consolidate  date+start and date+end in two dateTime fields
        for (var sessionKey in data.sessions) {
            var session = data.sessions[sessionKey];
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
            data.pageDate = minStartDate;
        }
        data.sessions = convertSessionsObjectToSortedList(data.sessions);
    }
    // If hasAttachment ...
    var attachments = document.getElementsByClassName('attachment-required');
    for (var i=0,ilen=attachments.length;i<ilen;i+=1) {
        if (!data.attachments) {
            data.attachments = [];
        }
        if (attachments[i].value) {
            var smartId = new SmartId(attachments[i].id);
            data.attachments.push(smartId.num);
        }
    }
    console.log("FORM DATA TO SAVE: "+JSON.stringify(data,null,2));
    // API save call
    var adminID = getParameterByName('admin');
    var pageName = getParameterByName('page');
    if (!pageName) {
        pageName = 'top';
    }
    var row = apiRequest(
        '/?admin='
            + adminID
            + '&page=' + pageName
            + '&cmd=saveevent'
        , {
            data:data
        }
    );
    if (false === row) return;

    // Receive eventID and set in form
    console.log("RESULTING EVENT ID: "+row.eventID);


    // API read call (for event/announcement pulldown lists)
    // Update event/announcement pulldown lists in form
    // API read call (for preview)
    // Compose preview popup and display

    // Once this is all working, only template output, mail, and uploads remain!
};

function convertSessionsObjectToSortedList(sessions) {
    var lst = [];
    for (var sessionKey in sessions) {
        lst.push(sessions[sessionKey]);
    };
    lst.sort(function(a,b){
        if (a.startDateTime > b.startDateTime) {
            return 1;
        } else if (a.startDateTime < b.startDateTime) {
            return -1;
        } else {
            return 0;
        }
    });
    return lst;
};

function SmartId (str) {
    var m = str.match(/^([-a-z]+)([0-9]+)(.*)$/);
    this.num = m[2];
    this.id = m[1] + m[3];
};
