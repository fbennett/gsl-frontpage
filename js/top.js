function buildTimes(){};

function initializePage () {
    lastFocusedElement = document.getElementsByClassName('field')[0];
    var uploaderNodeWidth = document.getElementById('uploader-attachment').offsetWidth;
    document.getElementById('uploader-attachment-filename').style.width = (uploaderNodeWidth + 'px');
    var hiddenIframe = document.getElementById('hidden-iframe-id');
    hiddenIframe.addEventListener('load',completedUpload);
    setKeyboardHandlers();
    setSearchableBlurHandlers();
    setSearchableFocusHandlers();
    setFieldFocusHandlers();
    setupSearchNodeHandlers();
    setButtons();
};

function setupSearchNodeHandlers () {
    var searchableFields = document.getElementsByClassName('search');
    for (var i=0,ilen=searchableFields.length;i<ilen;i+=1) {
        var field = searchableFields[i];
        var dropdown = document.getElementById(field.id + '-dropdown');
        var fieldName = field.id.split('-')[1]
        var specs = [
            {
                event:'click',
                handler:getClickDropdown(field.id),
                capture:true
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

function setKeyboardHandlers() {
    var nodes = document.getElementsByClassName('person-master');
    var nameKeydownHandler = getSearchableKeydownHandler('name');
    var nameKeyupHandler = Cowboy.throttle(250,getSearchableKeyupHandler('name'));
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        var node = nodes[i];
        node.addEventListener('keydown',nameKeydownHandler);
        node.onkeyup = nameKeyupHandler;
    }
    var nodes = document.getElementsByClassName('person-servant');
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        var node = nodes[i];
        var fieldName = node.id.split('-')[1];
        if (!window[fieldName + 'KeydownHandler']) {
            window[fieldName + 'KeydownHandler'] = Cowboy.throttle(250,getSearchableKeydownHandler(fieldName));
        }
        if (!window[fieldName + 'KeyupHandler']) {
            window[fieldName + 'KeyupHandler'] = Cowboy.throttle(250,getSearchableKeyupHandler(fieldName));
        }
        if (!window[fieldName + 'Set']) {
            window[fieldName + 'Set'] = getServantFieldSetter(fieldName);
        }
        node.addEventListener('keydown',window[fieldName + 'KeydownHandler']);
        node.onkeyup = window[fieldName + 'KeyupHandler'];
    }
    var node = document.getElementById('uploader-attachment');
    attachmentKeydownHandler = getSearchableKeydownHandler('attachment');
    node.addEventListener('keydown',attachmentKeydownHandler);
    attachmentKeyupHandler = getSearchableKeyupHandler('attachment')
    node.addEventListener('keyup',Cowboy.throttle(250,attachmentKeyupHandler));
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

