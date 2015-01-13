function mapField (ret,id,value) {
    if (fieldMap[id]) {
        ret[fieldMap[id]] = value;
    }
};

function previewForm (suppressPreview) {
    var data = {};

    //data.eventID = document.getElementById('event-id').value;

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
        // Includes a time adjustment. See TIMES.txt for details.
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
            session.startDateTime = jstShift(startDateTime);
            // Track minStartDate
            if (!minStartDate || session.startDateTime < minStartDate) {
                minStartDate = session.startDateTime;
            }
            var endDateTime = new Date(year=date.year,month=date.month,day=date.day,hour=end.hour,minute=end.minute);
            session.endDateTime = jstShift(endDateTime);
            // Deletes ...
            delete session['session-date'];
            delete session['session-hour-start'];
            delete session['session-hour-end'];
        }
	data.sessions = convertSessionsObjectToSortedList(data.sessions);
    }
    // If we have a minStartDate value, use it for pageDate
    if (!data.pageDate) {
        if (minStartDate) {
	    data.pageDate = minStartDate;
        } else {
	    data.pageDate = pageDate;
	}
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
    // API save call
    convertAllDatesToRemote(data);
    if (!pageName) {
        pageName = 'top';
    }
    var row = apiRequest(
        '/?admin='
            + adminID
            + '&page=' + pageName
            + '&cmd=saveevent'
        , {
            data:data,
            userkey:userKey
        }
    );
    if (false === row) return;

    // Receive eventID and set in form
    var eventIdNode = document.getElementById('event-id');
    eventIdNode.value = row.eventID;

    // API read calls and updates (for event & announcement pulldown lists)
    updateMenuList('event');
    updateMenuList('announcement');

    // API read call (for preview)
    // Compose preview popup and display
    var path = fixPath('/?admin=' + adminID + '&page=' + pageName + '&cmd=preview&eventid=' + row.eventID);
    if (!suppressPreview) {
        popupCenter(path,'preview',700,500);
    };
    setFormButtons(row);

    // Once this is all working, only mail remains!
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
    var eventID;
    if ("number" === typeof event) {
        eventID = event;
    } else {
        eventID = event.target.value;
    }
    if (eventID) {
        eventID = parseInt(eventID,10);
    }
    var data = apiRequest(
        '/?admin='
            + adminID
            + '&page=' + pageName
            + '&cmd=readevent'
        , {
            eventid:eventID,
            userkey:userKey
        }
    );
    if (false === data) return;
    role = data.role;
    convertAllDatesToLocal(data);
    pageDate = data.pageDate;
    // Clear form
    clearForm();
    // Populate form
    populateForm(eventID,data);
    // Show current form in pulldown menus
    updateMenuList('event');
    updateMenuList('announcement');
    updateMenuList('trash');
    // Wake up buttons
    checkFormComplete();
    setFormButtons(data);
    if ("number" !== typeof event) {
        event.target.blur();
    }
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


var populateMap = {
    convenor: {
        convenorID:'convenor-name-id',
        convenorName:'convenor-name',
        convenorContact:'convenor-contact',
        convenorAffiliation:'convenor-affiliation',
        convenorPosition:'convenor-position'
    },
    presenter: {
        presenterID:'presenter-name-id',
        presenterName:'presenter-name',
        presenterContact:'presenter-contact',
        presenterAffiliation:'presenter-affiliation',
        presenterPosition:'presenter-position'
    },
    details: {
        title:'title',
        description:'description',
        note:'note'
    }
};

function populateForm (eventID,data) {
    var formNodes = getFormNodes();

    document.getElementById('event-id').value = eventID;

    var persons = ['convenor','presenter'];
    for (var i=0,ilen=persons.length;i<ilen;i+=1) {
        var person = persons[i];
        var hasPerson = false;
        for (var key in populateMap[person]) {
            var node = document.getElementById(populateMap[person][key]);
            if (data[key]) {
                hasPerson = true;
                node.value = data[key];
                node.classList.add('has-content');
                node.disabled = true;
                cache[populateMap[person][key]] = data[key];
            }
        }
        if (hasPerson) {
            document.getElementById(person + '-clear').disabled = false;
            document.getElementById(person + '-edit').style.display = 'inline';
        }
    }

    for (var key in populateMap.details) {
        var node = document.getElementById(populateMap.details[key]);
        if (data[key]) {
            hasPerson = true;
            node.value = data[key];
            node.classList.add('has-content');
            cache[populateMap.details[key]] = data[key];
        }
    }

    for (var i=0,ilen=data.attachments.length;i<ilen;i+=1) {
        var attachment = data.attachments[i];
        appendAttachmentNode(attachment.documentID,attachment.title);
    }

    for (var i=0,ilen=data.sessions.length;i<ilen;i+=1) {
        var session = data.sessions[i];
        var fields = prepareFields(session);
        appendSessionNode(fields);
    }
};

function padNumber (num,padlen) {
    if (!padlen) {
        padlen = 0;
    }
    num = '' + num;
    while (num.length < padlen) {
        num = '0' + num;
    }
    return num;
};

function prepareFields (session) {

    //  "startDateTime": 1395882000000,
    //  "endDateTime": 1395885600000

    var ret = {};
    ret.title = session.title;
    ret.place = session.place;
    
    ret.date = inferUiDate(session.startDateTime);
    ret.start = inferUiTimeIndex(session.startDateTime);
    ret.end = inferUiTimeIndex(session.endDateTime);

    return ret;
};


function clearForm () {
    var formNodes = getFormNodes();
    // Clear cache
    cache = {};
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
        formNodes.master[i].disabled = false;
    }
    // Clear person servant
    for (var i=0,ilen=formNodes.servant.length;i<ilen;i+=1) {
        formNodes.servant[i].value = "";
        formNodes.servant[i].classList.remove('has-content');
        formNodes.servant[i].disabled = true;
    }
    // Clear attachments
    for (var i=0,ilen=formNodes.attachment.childNodes.length;i<ilen;i+=1) {
        formNodes.attachment.removeChild(formNodes.attachment.childNodes[0]);
    }
    // Clear sessions
    for (var i=0,ilen=formNodes.session.childNodes.length;i<ilen;i+=1) {
        formNodes.session.removeChild(formNodes.session.childNodes[0]);
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

function trashItem (event) {
    var eventID = document.getElementById('event-id').value;
    var row = apiRequest(
        '/?admin='
            + adminID
            + '&page=' + pageName
            + '&cmd=trashevent'
        , {
            eventid:eventID
        }
    );
    if (false === row) return;

    updateMenuList('event');
    updateMenuList('announcement');
    updateMenuList('trash');
    setFormButtons(row);
    event.target.blur();
};

function restoreItem (event) {
    var eventID = document.getElementById('event-id').value;
    var row = apiRequest(
        '/?admin='
            + adminID
            + '&page=' + pageName
            + '&cmd=restoreevent'
        , {
            eventid:eventID
        }
    );
    if (false === row) return;

    updateMenuList('event');
    updateMenuList('announcement');
    updateMenuList('trash');
    setFormButtons(row);
    event.target.blur();
};

function publishItem (event) {
    previewForm(true);
    var eventID = document.getElementById('event-id').value;
    var row = apiRequest(
        '/?admin='
            + adminID
            + '&page=' + pageName
            + '&cmd=publish'
        , {
            eventid:eventID,
            userkey:userKey
        }
    );
    if (false === row) return;
    updateMenuList('event');
    updateMenuList('announcement');
    updateMenuList('trash');
    showSave(event.target,function(node){
        node.classList.remove('has-content');
        setFormButtons(row);
        node.blur();
    });
};

function republishItem (event) {
    previewForm(true);
    var eventID = document.getElementById('event-id').value;
    var row = apiRequest(
        '/?admin='
            + adminID
            + '&page=' + pageName
            + '&cmd=publish'
        , {
            eventid:eventID,
            userkey:userKey
        }
    );
    if (false === row) return;
    updateMenuList('event');
    updateMenuList('announcement');
    updateMenuList('trash');
    showSave(event.target,function(node){
        node.classList.remove('has-content');
        setFormButtons(row);
        node.blur();
    });
};

function confirmItem (event) {
    previewForm(true);
    var eventID = document.getElementById('event-id').value;
    var row = apiRequest(
        '/?admin='
            + adminID
            + '&page=' + pageName
            + '&cmd=confirmevent'
        , {
            eventid:eventID
        }
    );
    if (false === row) return;
    updateMenuList('event');
    updateMenuList('announcement');
    updateMenuList('trash');
    showSave(event.target,function(node){
        node.classList.remove('has-content');
        setFormButtons(row);
        node.blur();
    });
};
