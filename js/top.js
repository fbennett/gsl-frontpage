function buildTimes(){};

function initializePage () {
    lastFocusedElement = document.getElementsByClassName('field')[0];
    var uploaderNodeWidth = document.getElementById('attachment-uploader').offsetWidth;
    document.getElementById('attachment-uploader-filename').style.width = (uploaderNodeWidth + 'px');
    setKeyboardHandlers();
    setSearchableBlurHandlers();
    setSearchableFocusHandlers();
    setFieldFocusHandlers();
    setDropdownHandlers();
    setButtons();
};

function setDropdownHandlers() {
    var convenorDropdown = document.getElementById('convenor-name').getElementsByClassName('combo')[0];
    convenor.addEventListener('keydown',keyPersonMasterDropdown);
    convenor.addEventListener('blur',blurSelectedSearchDropdown);
    var presenterDropdown = document.getElementById('presenter-name').getElementsByClassName('combo')[0];
    presenter.addEventListener('keydown',keyPersonMasterDropdown)
    presenter.addEventListener('blur',blurSelectedSearchDropdown);
}

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
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        var node = nodes[i];
        node.addEventListener('keydown',keyPersonMasterTab);
        node.addEventListener('keyup',Cowboy.throttle(250,keyPersonMasterEnter));
    }
    var nodes = document.getElementsByClassName('person-servant');
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        var node = nodes[i];
        node.addEventListener('keydown',keyPersonServantTab);
        node.addEventListener('keyup',Cowboy.throttle(250,keyPersonServantEnter));
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

