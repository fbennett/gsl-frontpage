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
    "session-hour-end":"session-hour-end",
    "event-id":"eventID"
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

    var formNodes = getFormNodes();

    for (var i=0,ilen=formNodes.required.length;i<ilen;i+=1) {
        mapField(data,formNodes.required[i].id,formNodes.required[i].value);
    }

    for (var i=0,ilen=formNodes.optional.length;i<ilen;i+=1) {
        if (formNodes.optional[i].value) {
            mapField(data,formNodes.optional[i].id,formNodes.optional[i].value);
        }
    }

    if (formNodes.presenter.value) {
        mapField(data,formNodes.presenter.id,formNodes.presenter.value);
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
    eventIdNode.value = row.eventID;

    // API read calls and updates (for event & announcement pulldown lists)
    updateMenuList('event');
    updateMenuList('announcement');

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

function getPageContent (event) {
    console.log("EVENT ID: "+event.target.value);
    var adminID = getParameterByName('admin');
    var pageName = getParameterByName('page');
    if (!pageName) {
        pageName = 'top';
    }
    var eventID = event.target.value;
    if (eventID) {
        eventID = parseInt(eventID,10);
    }
    var data = apiRequest(
        '/?admin='
            + adminID
            + '&page=' + pageName
            + '&cmd=readevent'
        , {
            eventid:eventID
        }
    );
    if (false === data) return;
    // Clear form
    clearForm();
    // Populate form
    populateForm(eventID,data);
    // Show current form in pulldown menus
    updateMenuList('event');
    updateMenuList('announcement');
};

function getFormNodes() {
    var ret = {};
    ret.required = document.getElementsByClassName('form-required');
    ret.optional = document.getElementsByClassName('form-optional');
    ret.master = document.getElementsByClassName('person-master');
    ret.servant = document.getElementsByClassName('person-servant');
    ret.presenter = document.getElementById('presenter-name-id');
    ret.session = document.getElementById('session-container');
    ret.attachment = document.getElementById('attachment-container');
    ret.disable = document.getElementsByClassName('default-disable');
    ret.nodisplay = document.getElementsByClassName('default-nodisplay');
    ret.search = document.getElementById('uploader-attachment-searchable');
    return ret;
};

function populateForm (eventID,data) {
    var formNodes = getFormNodes();
    document.getElementById('event-id').value = eventID;

    console.log("JSON: "+JSON.stringify(data,null,2));
};

function clearForm () {
    var formNodes = getFormNodes();
    // Clear required
    for (var i=0,ilen=formNodes.required.length;i<ilen;i+=1) {
        formNodes.required[i].value = "";
        formNodes.required[i].classList.remove('has-content');
    }
    // Clear optional
    for (var i=0,ilen=formNodes.optional.length;i<ilen;i+=1) {
        formNodes.optional[i].value = "";
        formNodes.optional[i].classList.remove('has-content');
    }
    // Clear person master
    for (var i=0,ilen=formNodes.master.length;i<ilen;i+=1) {
        formNodes.master[i].value = "";
        formNodes.master[i].classList.remove('has-content');
    }
    // Clear person servant
    for (var i=0,ilen=formNodes.servant.length;i<ilen;i+=1) {
        formNodes.servant[i].value = "";
        formNodes.servant[i].classList.remove('has-content');
    }
    // Clear attachments
    for (var i=1,ilen=formNodes.attachment.childNodes.length;i<ilen;i+=1) {
        formNodes.attachment.removeChild(formNodes.attachment.childNode[1]);
    }
    // Clear sessions
    for (var i=1,ilen=formNodes.session.childNodes.length;i<ilen;i+=1) {
        formNodes.session.removeChild(formNodes.session.childNode[1]);
    }
    // Disable buttons
    for (var i=0,ilen=formNodes.disable.length;i<ilen;i+=1) {
        formNodes.disable[i].disabled = true;
    }
    // Hide buttons
    for (var i=0,ilen=formNodes.nodisplay.length;i<ilen;i+=1) {
        formNodes.nodisplay[i].style.display = 'none';
    }
    // Clear search toggle
    formNodes.search.checked = false;
};
