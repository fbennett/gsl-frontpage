function clearPerson(event) {
    forServants(event.target,function(servant){
        servant.value = '';
        servant.disabled = true;
        servant.classList.remove('has-content');
        servant.classList.remove('block-sayt');
        cache[servant.id] = '';
    });
    disableClearButton(event.target);
    disableEditButton(event.target);
    forMaster(event.target,function(master) {
        master.value = '';
        master.disabled = false;
        master.classList.remove('has-content');
        master.classList.remove('block-sayt');
        cache[master.id] = '';
        document.getElementById(master.id + '-id').value = "";
        master.focus();
    });
};

function editPerson(event) {
    var firstServant = enablePersonServants(event.target);
    disableEditButton(event.target);
    firstServant.focus();
};

function disablePersonServants(node) {
    forServants(node,function(servant){
        servant.disabled = true;
    });
};

function disablePersonMaster(node) {
    forMaster(node,function(master){
        master.disabled = true;
    });
};

function enablePersonServants(node) {
    var firstServant = forServants(node,function(servant){
        servant.disabled = false;
        servant.classList.remove('has-content');
    });
    return firstServant;
};

function enablePersonMaster(node) {
    forMaster(node,function(master){
        master.disabled = false;
        master.classList.remove('has-content');
    });
};

function enableEditButton(node) { 
   var containerID = getContainer(node).id;
    var editButton = document.getElementById(containerID + '-edit');
    editButton.style.display = 'inline';
};

function disableEditButton(node) {
    var containerID = getContainer(node).id;
    var editButton = document.getElementById(containerID + '-edit');
    editButton.style.display = 'none';
};

function enableClearButton(node) {
    var containerID = getContainer(node).id;
    var clearButton = document.getElementById(containerID + '-clear');
    clearButton.disabled = false;
};

function disableClearButton(node) {
    var containerID = getContainer(node).id;
    var clearButton = document.getElementById(containerID + '-clear');
    clearButton.disabled = true;
};

function checkFormComplete () {
    var ok = true;
    var formRequired = document.getElementsByClassName('form-required');
    for (var i=0,ilen=formRequired.length;i<ilen;i+=1) {
        if (!formRequired[i].value) {
            ok = false;
            break;
        }
    }

    var presenterRequired = document.getElementById('presenter-name-id');
    var sessionRequired = document.getElementsByClassName('session-required');
    sessionRequired = sessionRequired ? sessionRequired : [];
    if ((presenterRequired.value && !sessionRequired.length)
        || (!presenterRequired.value && sessionRequired.length)) {

        ok = false;
    }
    var previewButton = document.getElementById('preview-button');
    if (ok) {
        previewButton.disabled = false;
    } else {
        previewButton.disabled = true;
    }
};

function setFormButtons(data) {
    var trashButton = document.getElementById('trash-button');
    var restoreButton = document.getElementById('restore-button');
    var publishButton = document.getElementById('publish-button');
    var republishButton = document.getElementById('republish-button');
    var confirmButton = document.getElementById('confirm-button');
    if (data.eventID) {
        trashButton.disabled = false;
        restoreButton.disabled = false;
        publishButton.disabled = false;
        republishButton.disabled = false;
    } else {
        trashButton.disabled = true;
        restoreButton.disabled = true;
        publishButton.disabled = true;
        republishButton.disabled = true;
    }
    if (role === 2) {
        // If we are a reviewer, we cannot change delete or restore
        // Otherwise, we can. Unless we are a proposer.
        trashButton.disabled = true;
        restoreButton.disabled = true;
        if (data.published) {
            confirmButton.parentNode.style.display = 'none';
            publishButton.parentNode.style.display = 'none';
            republishButton.parentNode.style.display = 'inline';
            republishButton.disabled = true;
        } else if (data.status == 0) {
            confirmButton.parentNode.style.display = 'inline';
            publishButton.parentNode.style.display = 'none';
            republishButton.parentNode.style.display = 'none';
        } else {
            confirmButton.parentNode.style.display = 'none';
            publishButton.parentNode.style.display = 'inline';
            republishButton.parentNode.style.display = 'none';
            publishButton.disabled = true;
        }
    } else if (role === 3) {
        // If we are a proposer, we cannot change delete, restore, publish or republish
        // Otherwise, we can.
        trashButton.disabled = true;
        restoreButton.disabled = true;
        if (data.published) {
            confirmButton.parentNode.style.display = 'none';
            publishButton.parentNode.style.display = 'none';
            republishButton.parentNode.style.display = 'inline';
            republishButton.disabled = true;
        } else {
            confirmButton.parentNode.style.display = 'none';
            publishButton.parentNode.style.display = 'inline';
            publishButton.disabled = true;
            republishButton.parentNode.style.display = 'none';
        }
    } else {
        if (data.status == -1) {
            trashButton.parentNode.style.display = 'none';
            restoreButton.parentNode.style.display = 'inline';
            publishButton.disabled = true;
            republishButton.disabled = true;
        } else if (data.status == 0) {
            trashButton.parentNode.style.display = 'inline';
            restoreButton.parentNode.style.display = 'none';
            publishButton.disabled = false;
            republishButton.disabled = false;
        }
        if (data.published) {
            publishButton.parentNode.style.display = 'none';
            republishButton.parentNode.style.display = 'inline';
        } else {
            publishButton.parentNode.style.display = 'inline';
            republishButton.parentNode.style.display = 'none';
        }
    }
};

function moveFocusForward (node,action) {
    var start = false;
    var inputs = document.getElementsByClassName('field');
    for (var i=0,ilen=inputs.length;i<ilen;i+=1) {
        var input = inputs[i];
        if (input.id === node.id) {
            start = true;
            continue;
        }
        if (start && !input.disabled) {
            input.focus();
            break;
        }
    }
    checkFormComplete();
};

function getContainer(node) {
    var containerID = node.id.split('-')[0];
    return document.getElementById(containerID);
};

function getDropper(node) {
    var container = document.getElementById(node.id + '-dropdown');
    var dropper = container.getElementsByClassName('combo')[0];
    return dropper;
};

function forServants(node,callback) {
    var container = getContainer(node);
    var servants = container.getElementsByClassName('person-servant');
    for (var i=0,ilen=servants.length;i<ilen;i+=1) {
        var servant = servants[i];
        callback(servant);
    }
    return servants[0];
};

function forMaster(node,callback) { 
    var container = getContainer(node);
    var master = container.getElementsByClassName('person-master')[0];
    callback(master);
};

// Loop breaks when callback returns 'break'
// Loop continues when callback returns 'continue'
function forField(node,callback) {
    var container = getContainer(node);
    var fields = container.getElementsByClassName('field');
    for (var i=0,ilen=fields.length;i<ilen;i+=1) {
        var result = callback(fields[i]);
        if (result === 'break') {
            break;
        } else if (result === 'continue') {
            continue;
        }
    }
};

function sameContainer(anode,bnode) {
    var acontainerID = getContainer(anode).id;
    var bcontainerID = getContainer(bnode).id;
    if (acontainerID === bcontainerID) {
        return true;
    } else {
        return false;
    }
};

function addAttachment (documentID, documentTitle) {
    // Get existing values, if any
    page_status.attachments = {};
    var attachmentContainer = document.getElementById('attachment-container');
    for (var i=0,ilen=attachmentContainer.childNodes.length;i<ilen;i+=1) {
        var node = attachmentContainer.childNodes[i];
        var titleNode = node.getElementsByClassName('document-title')[0];
        var m = titleNode.id.match(/^document([0-9]+).*/);
        var id = 0;
        if (m) {
            id = m[1];
        }
        page_status.attachments[id] = titleNode.value;
    }
    
    // Add this documentID and documentTitle to status.attachments IF it is a new one.
    if (!page_status.attachments[documentTitle]) {
        page_status.attachments[documentID] = documentTitle;
    }
    
    // 
    var attachments = [];
    for (var documentID in page_status.attachments) {
        attachments.push({documentID:documentID,documentTitle:page_status.attachments[documentID]});
    }
    
    // XXX Sort the list
    attachments.sort(
        function (a,b) {
            return a.documentTitle.localeCompare(b.documentTitle);
        }
    );
    
    // Clear the DOM nodes
    for (var i=0,ilen=attachmentContainer.childNodes.length;i<ilen;i+=1) {
        attachmentContainer.removeChild(attachmentContainer.childNodes[0]);
    }

    // Add the updated nodes
    for (var i=0,ilen=attachments.length;i<ilen;i+=1) {
        appendAttachmentNode(attachments[i].documentID,attachments[i].documentTitle);
    }
    
    var attachmentIdNode = document.getElementById('uploader-attachment-id');
    var attachmentTitleNode = document.getElementById('uploader-attachment');
    var attachmentUploadFilenameNode = document.getElementById('uploader-attachment-filename');

    // Clear the visible values in the uploader widget
    attachmentTitleNode.value = '';
    attachmentUploadFilenameNode.value = '';
};

function appendAttachmentNode(documentID,documentTitle) {
    var attachmentHtmlTemplate = '<tr>'
        + '  <td class="i18n-innerHTML-title">' + langEngine.strings[langEngine.lang].innerHTMLbyClass['i18n-innerHTML-title'] + '</td>'
        +'   <td class="document">'
        + '    <div>'
        + '      <input id="document@@DOCUMENT_ID@@-attachment" class="document-title field field-closed attachment-required" type="text" size="50" value="@@DOCUMENT_TITLE@@" onblur="soloFieldBlur(event);" onfocus="soloFieldFocus(event);" onkeydown="attachmentTitleKeydown(event);" onkeyup="attachmentTitleKeyup(event);"/>'
        + '    </div>'
        + '  </td>'
        + '  <td rowspan="2">'
        + '    <input type="button" value="' + langEngine.strings[langEngine.lang].valueByClass['i18n-value-remove'] + '" class="i18n-value-remove" onclick="deleteAttachment(@@DOCUMENT_ID@@)">'
        + '  </td>'
        + '</tr>'
        + '<tr>'
        + '  <td></td>'
        + '  <td>'
        + '<div class="document-link"><a href="attachments/@@DOCUMENT_ID@@">attachments/@@DOCUMENT_ID@@</a></div>'
        + '  </td>'
        + '</tr>';

    var attachmentContainer = document.getElementById('attachment-container');
    var attachmentNode = document.createElement('table');
    attachmentNode.setAttribute('id', 'document' + documentID);
    attachmentNode.classList.add('wrapper')
    attachmentNode.classList.add('ephemeral');
    attachmentNode.innerHTML = attachmentHtmlTemplate.replace(/@@DOCUMENT_ID@@/g,documentID).replace(/@@DOCUMENT_TITLE@@/,documentTitle);
    attachmentContainer.appendChild(attachmentNode);
};

function deleteAttachment(documentID) {
    var attachmentNode = document.getElementById('document' + documentID);
    attachmentNode.parentNode.removeChild(attachmentNode);
};

function updateSessionAddButton (node) {
    var sessionAddButton = document.getElementById('session-add-button');
    if (checkSessionFieldValues(node)) {
        sessionAddButton.disabled = false;
        sessionAddButton.focus();
    } else {
        sessionAddButton.disabled = true;
        moveFocusForward(node);
    }
}

function checkSessionFieldValues (node) {
    cache[node.id] = node.value;
    var complete = true;
    var fields = getSessionFieldValues(node);
    for (var fieldKey in fields) {
        if (!fields[fieldKey]) {
            complete = false;
            break
        }
    }
    return complete;
};

function getSessionFieldValues (node) {
    var fields = {};
    var container = getContainer(node);
    var fieldNodes = container.getElementsByClassName('field');
    for (var i=0,ilen=fieldNodes.length;i<ilen;i+=1) {
        var fieldNode = fieldNodes[i];
        if (fieldNode.tagName && fieldNode.tagName.upperCase() === 'SELECT') {
            fields[fieldNode.id.split('-')[1]] = parseInt(fieldNode.selectedIndex,10);
        } else {
            fields[fieldNode.id.split('-')[1]] = fieldNode.value;
        }
    }
    return fields;
};

function clearSessionFieldValues () {
    var node = document.getElementById('session');
    var fields = {};
    var container = getContainer(node);
    var fieldNodes = container.getElementsByClassName('field');
    for (var i=0,ilen=fieldNodes.length;i<ilen;i+=1) {
        var fieldNode = fieldNodes[i];
        fieldNode.value = "";
        delete cache[fieldNode.id];
    }
};

function addSessionNode() {
    var titleNode = document.getElementById('session-title');
    var fields = getSessionFieldValues(titleNode);
    appendSessionNode(fields);
};

function appendSessionNode(fields) {

    var sessionHtmlTemplate = '<tr>'
        + '  <td colspan="2" style="text-align:left;">'
        + '    <input id="session@@SESSION_ID@@-title" value="@@TITLE@@" class="has-content session-required" type="text" size="50"/>'
        + '  </td>'
        + '  <td rowspan="2">'
        + '    <input id="session@@SESSION_ID@@-delete-button" type="button" class="i18n-value-remove" onclick="deleteSession(@@SESSION_ID@@);" value="' + langEngine.strings[langEngine.lang].valueByClass['i18n-value-remove'] + '"/>'
        + '  </td>'
        + '</tr>'
        + '<tr>'
        + '  <td style="text-align:left;">'
        + '    <input id="session@@SESSION_ID@@-place" value="@@PLACE@@" class="has-content session-required" type="text" size="10"/>'
        + '  </td>'
        + '  <td>'
        + '    <span class="day-of-week">@@DOW@@</span>'
        + '    <input id="session@@SESSION_ID@@-date" value="@@DATE@@" class="has-content session-required" size="10" type="date"/>'
        + '    <select id="session@@SESSION_ID@@-hour-start" class="session-required"></select>'
        + '〜'
        + '<select id="session@@SESSION_ID@@-hour-end" class="session-required"></select>'
        + '  </td>'
        + '</tr>'

    // XXX Cannot save before form as a whole is saved, because we need the event ID
    // XXX Use the start time as the ID
    // XXX Harvest nodes from the UI, extract content, and sort by start time on each append

    var date = extractDate(fields.date);
    var time = extractTimeFromIndex(fields.start);
    var dateTime = new Date(year=date.year,month=date.month,day=date.day,hour=time.hour,minute=time.minute);

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
    var sessionID = getRandomKey(16,16);

    var days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    var dow = days[dateTime.getDay()];

    var sessionContainer = document.getElementById('session-container');
    var sessionNode = document.createElement('table');
    sessionNode.setAttribute('id', 'session' + sessionID);
    sessionNode.classList.add('wrapper')
    sessionNode.classList.add('ephemeral');
    sessionNode.innerHTML = sessionHtmlTemplate
        .replace(/@@SESSION_ID@@/g,sessionID)
        .replace(/@@TITLE@@/g,fields.title)
        .replace(/@@PLACE@@/g,fields.place)
        .replace(/@@DATE@@/g,fields.date)
        .replace(/@@DOW@@/g,dow)
    sessionContainer.appendChild(sessionNode);

    var dateNode = document.getElementById('session'+sessionID+'-date');
    fixDateField(dateNode);

    var startNode = document.getElementById('session'+sessionID+'-hour-start');
    buildTimes(startNode,null,fields.start);

    var endNode = document.getElementById('session'+sessionID+'-hour-end');
    buildTimes(endNode,null,fields.end);

    clearSessionFieldValues();
    checkFormComplete();
};

function deleteSession(sessionID) {
    var sessionNode = document.getElementById('session' + sessionID);
    sessionNode.parentNode.removeChild(sessionNode);
};

