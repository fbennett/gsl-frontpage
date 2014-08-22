function buildTimes (node,placeholder,initIndex) {
    var timesHTML;
    if (initIndex) {
        timesHTML = '';
    } else {
        timesHTML = '<option id="time-' + placeholder + '" value="">' + placeholder + '</option>\n';
    }
    for (var j=8,jlen=20;j<jlen;j+=1) {
        for (var k=0,klen=60;k<klen;k+=15) {
            var time = j + ':';
            var minutes = '' + k;
            while (minutes.length < 2) {
                minutes = '0' + minutes;
            }
            time += minutes;
            var styling = ''
            if (!k) {
                styling = 'style="font-weight:bold;" '
            }
            timesHTML += '<option ' + styling + 'value="' + time + '">' + time + '</option>\n'
        }
    }
    if (node) {
        node.innerHTML = timesHTML;
        if (initIndex) {
            node.selectedIndex = (initIndex-1);
        }
    } else {
        var nodes = document.getElementsByClassName('times');
        for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
            var node = nodes[i];
            node.innerHTML = timesHTML;
        }
    }
};

var adminID;
var pageName;
var userKey;
var role;
var keyCodeMap;
var langEngine;

function initializePage () {
    keyCodeMap = {
        13:'Enter',
        9:'Tab',
        27:'Esc',
        38:'Up',
        40:'Down'
    }

    var sessionHourStart = document.getElementById('session-start');
    buildTimes(sessionHourStart,'start');
    var sessionHourEnd = document.getElementById('session-end');
    buildTimes(sessionHourEnd,'end');

    var defaultLanguage = document.getElementById('default-language').textContent;
    langEngine = new LangEngine(document,defaultLanguage);

    adminID = getParameterByName('admin');
    userKey = getParameterByName('key');
    pageName = getParameterByName('page');
    if (!pageName) {
        pageName = 'top';
    }
    updateMenuList('event');
    updateMenuList('announcement');
    updateMenuList('trash');
    
    pageDate = new Date().getTime();
    lastFocusedElement = document.getElementsByClassName('field')[0];
    
    var eventList = document.getElementById('event-list');
    eventList.addEventListener('change',getPageContent);
    
    var announcementList = document.getElementById('announcement-list');
    announcementList.addEventListener('change',getPageContent);
    
    var uploaderNodeWidth = document.getElementById('uploader-attachment').offsetWidth;
    document.getElementById('uploader-attachment-filename').style.width = (uploaderNodeWidth + 'px');

    var titleNode = document.getElementById('title');
    var descriptionNode = document.getElementById('description');
    var noteNode = document.getElementById('note');
    descriptionNode.style.width = (titleNode.offsetWidth + 'px');
    noteNode.style.width = (titleNode.offsetWidth + 'px');

    var titleNode = document.getElementById('title');
    titleNode.addEventListener('keydown',eventTitleKeyup);
    //titleNode.addEventListener('blur',blurEventFieldRestoreFromCache);
    titleNode.addEventListener('blur',blurEventFieldOptional);
    titleNode.addEventListener('focus',eventFieldFocus);

    var descriptionNode = document.getElementById('description');
    descriptionNode.addEventListener('keydown',descriptionKeyup);
    //descriptionNode.addEventListener('blur',blurEventFieldRestoreFromCache);
    descriptionNode.addEventListener('blur',blurEventFieldOptional);
    descriptionNode.addEventListener('focus',eventFieldFocus);

    var noteNode = document.getElementById('note');
    noteNode.addEventListener('keydown',noteKeyup);
    noteNode.addEventListener('blur',blurEventFieldOptional);
    noteNode.addEventListener('focus',eventFieldFocus);

    var hiddenIframe = document.getElementById('hidden-iframe-id');
    hiddenIframe.addEventListener('load',completedUpload);

    setKeyboardHandlers();
    setSearchableBlurHandlers();
    setSearchableFocusHandlers();
    setFieldFocusHandlers();
    setupSearchListHandlers();
    setButtons();
    var eventID = getParameterByName('eventid');
    if (eventID) {
        getPageContent(parseInt(eventID,10));
    }
};

function setupSearchListHandlers () {
    var searchableFields = document.getElementsByClassName('search');
    for (var i=0,ilen=searchableFields.length;i<ilen;i+=1) {
        var field = searchableFields[i];
        var dropdown = document.getElementById(field.id + '-dropdown');
        var fieldName = field.id.split('-')[1]
        var specs = [
            {
                event:'click',
                handler:getClickDropdown(field.id),
                capture:false
            },
            {
                event:'keydown',
                handler:getKeyDropdown(field.id),
                capture:true
            }
        ];
        for (var j=0,jlen=specs.length;j<jlen;j+=1) {
            var spec = specs[j];
            dropdown.addEventListener(spec.event,spec.handler,spec.capture);
        }
    }
};

function setFieldFocusHandlers () {
    var fields = document.getElementsByClassName('field');
    for (var i=0,ilen=fields.length;i<ilen;i+=1) {
        fields[i].addEventListener('focus',rememberFocus);
    }
};

function setButtons() {
    var clearButtons = document.getElementsByClassName('clear-person');
    for (var i=0,ilen=clearButtons.length;i<ilen;i+=1) {
        var clearButton = clearButtons[i];
        clearButton.addEventListener('click',clearPerson);
    }
    var editButtons = document.getElementsByClassName('edit-person');
    for (var i=0,ilen=editButtons.length;i<ilen;i+=1) {
        var editButton = editButtons[i];
        editButton.addEventListener('click',editPerson);
    }
};

var nameKeyupHandler = null;

function setKeyboardHandlers() {
    var nodes = document.getElementsByClassName('person-master');
    nameKeyupHandler = getSearchableKeyupHandler('name');
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        var node = nodes[i];
        node.onkeydown = nameKeyupHandler;
    }
    var nodes = document.getElementsByClassName('person-servant');
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        var node = nodes[i];
        var fieldName = node.id.split('-')[1];
        if (!window[fieldName + 'KeyupHandler']) {
            window[fieldName + 'KeyupHandler'] = getSearchableKeyupHandler(fieldName);
        }
        if (!window[fieldName + 'Set']) {
            window[fieldName + 'Set'] = getServantFieldSetter(fieldName);
        }
        node.onkeydown = window[fieldName + 'KeyupHandler'];
    }

    // The only solo field requiring keyboard-driven postprocessing is the session title
    var node = document.getElementById('session-title');
    node.addEventListener('keydown',sessionTitleKeyup);
    node.addEventListener('blur',blurRestoreFromCache);
    node.addEventListener('focus',blockBlurRestore);

    var node = document.getElementById('uploader-attachment');
    attachmentKeyupHandler = getSearchableKeyupHandler('attachment')
    node.addEventListener('keydown',attachmentKeyupHandler);

    var node = document.getElementById('session-place');
    placeKeyupHandler = getSearchableKeyupHandler('place')
    node.addEventListener('keydown',placeKeyupHandler);
};

function setSearchableBlurHandlers() {
    var nodes = document.getElementsByClassName('search');
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        var node = nodes[i];
        node.addEventListener('blur',blurSearchDropdown);
        node.addEventListener('blur',blurRestoreFromCache);
        node.addEventListener('focus',blockBlurRestore);
    }
};

function setSearchableFocusHandlers() {
    var nodes = document.getElementsByClassName('search');
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        var node = nodes[i];
        node.addEventListener('focus',focusSearchDropdown,true);
    }
};

