function buildTimes(){};

function initializePage () {
    lastFocusedElement = document.getElementsByClassName('field')[0];
    var uploaderNodeWidth = document.getElementById('attachment-uploader').offsetWidth;
    document.getElementById('attachment-uploader-filename').style.width = (uploaderNodeWidth + 'px');
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
        //var select = dropdown.getElementsByClassName('combo')[0];
        console.log("XXX getClickDropdown: "+field.id);
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


//,
//            {
//                event:'blur',
//                handler:getBlurDropdown(field.id),
//                capture:true
//            }


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
    window['nameKeydownHandler'] = getSearchableKeydownHandler('name');
    window['nameKeyupHandler'] = getSearchableKeyupHandler('name');
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        var node = nodes[i];
        node.addEventListener('keydown',window['nameKeydownHandler']);
        node.addEventListener('keyup',Cowboy.throttle(250,window['nameKeyupHandler']));
    }
    var nodes = document.getElementsByClassName('person-servant');
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        var node = nodes[i];
        var fieldName = node.id.split('-')[1];
        if (!window[fieldName + 'KeydownHandler']) {
            window[fieldName + 'KeydownHandler'] = getSearchableKeydownHandler(fieldName);
        }
        if (!window[fieldName + 'KeyupHandler']) {
            window[fieldName + 'KeyupHandler'] = getSearchableKeyupHandler(fieldName);
        }
        if (!window[fieldName + 'Set']) {
            window[fieldName + 'Set'] = getServantFieldSetter(fieldName);
        }
        node.addEventListener('keydown',window[fieldName + 'KeydownHandler']);
        node.addEventListener('keyup',Cowboy.throttle(250,window[fieldName + 'KeyupHandler']));
    }
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

