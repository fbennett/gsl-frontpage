var pageDate = null;

function buildTimes (node,placeholder) {
    var timesHTML = '<option value="">' + placeholder + '</option>\n';
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
    } else {
        var nodes = document.getElementsByClassName('times');
        for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
            var node = nodes[i];
            node.innerHTML = timesHTML;
        }
    }
};

function initializePage () {
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
    titleNode.addEventListener('keyup',eventTitleKeyup);
    titleNode.addEventListener('keydown',eventTitleKeydown);
    titleNode.addEventListener('blur',blurEventFieldRestoreFromCache);
    titleNode.addEventListener('focus',eventFieldFocus);

    var descriptionNode = document.getElementById('description');
    descriptionNode.addEventListener('keyup',descriptionKeyup);
    descriptionNode.addEventListener('keydown',descriptionKeydown);
    descriptionNode.addEventListener('blur',blurEventFieldRestoreFromCache);
    descriptionNode.addEventListener('focus',eventFieldFocus);

    var noteNode = document.getElementById('note');
    noteNode.addEventListener('keyup',noteKeyup);
    noteNode.addEventListener('keydown',noteKeydown);
    noteNode.addEventListener('blur',blurEventFieldOptional);
    noteNode.addEventListener('focus',eventFieldFocus);

    var hiddenIframe = document.getElementById('hidden-iframe-id');
    hiddenIframe.addEventListener('load',completedUpload);

    var sessionHourStart = document.getElementById('session-start');
    buildTimes(sessionHourStart,'自');
    var sessionHourEnd = document.getElementById('session-end');
    buildTimes(sessionHourEnd,'至');

    setKeyboardHandlers();
    setSearchableBlurHandlers();
    setSearchableFocusHandlers();
    setFieldFocusHandlers();
    setupSearchListHandlers();
    setButtons();
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
var nameKeydownHandler = null;

function setKeyboardHandlers() {
    var nodes = document.getElementsByClassName('person-master');
    nameKeyupHandler = getSearchableKeyupHandler('name');
    nameKeydownHandler = getSearchableKeydownHandler('name');
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        var node = nodes[i];
        node.addEventListener('keydown',nameKeydownHandler);
        node.onkeyup = nameKeyupHandler;
    }
    var nodes = document.getElementsByClassName('person-servant');
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        var node = nodes[i];
        var fieldName = node.id.split('-')[1];
        if (!window[fieldName + 'KeyupHandler']) {
            window[fieldName + 'KeyupHandler'] = getSearchableKeyupHandler(fieldName);
        }
        if (!window[fieldName + 'KeydownHandler']) {
            window[fieldName + 'KeydownHandler'] = getSearchableKeydownHandler(fieldName);
        }
        if (!window[fieldName + 'Set']) {
            window[fieldName + 'Set'] = getServantFieldSetter(fieldName);
        }
        node.onkeyup = window[fieldName + 'KeyupHandler'];
        node.addEventListener('keydown',window[fieldName + 'KeydownHandler']);
    }

    // The only solo field requiring keyboard-driven postprocessing is the session title
    var node = document.getElementById('session-title');
    node.addEventListener('keyup',sessionTitleKeyup);
    node.addEventListener('keydown',sessionTitleKeydown);
    node.addEventListener('blur',blurRestoreFromCache);
    node.addEventListener('focus',blockBlurRestore);

    var node = document.getElementById('uploader-attachment');
    attachmentKeyupHandler = getSearchableKeyupHandler('attachment')
    node.addEventListener('keyup',attachmentKeyupHandler);
    attachmentKeydownHandler = getSearchableKeydownHandler('attachment');
    node.addEventListener('keydown',attachmentKeydownHandler);

    var node = document.getElementById('session-place');
    placeKeyupHandler = getSearchableKeyupHandler('place')
    node.addEventListener('keyup',placeKeyupHandler);
    placeKeydownHandler = getSearchableKeydownHandler('place');
    node.addEventListener('keydown',placeKeydownHandler);
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

