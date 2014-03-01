var status = {
    sent:false,
    reviewed:false,
    uploadID:null,
    attachments:{}
}

var lastFocusNode = null;

/*
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function(b,c){var $=b.jQuery||b.Cowboy||(b.Cowboy={}),a;$.throttle=a=function(e,f,j,i){var h,d=0;if(typeof f!=="boolean"){i=j;j=f;f=c}function g(){var o=this,m=+new Date()-d,n=arguments;function l(){d=+new Date();j.apply(o,n)}function k(){h=c}if(i&&!h){l()}h&&clearTimeout(h);if(i===c&&m>e){l()}else{if(f!==true){h=setTimeout(i?k:l,i===c?e-m:e)}}}if($.guid){g.guid=j.guid=j.guid||$.guid++}return g};$.debounce=function(d,e,f){return f===c?a(d,e,false):a(d,f,e!==false)}})(this);


function initializePage () {
    var nodes = document.getElementsByClassName('attachment-upload-widget');
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        var node = nodes[i];
        //var titleNodeID = 'attachment-attachment-' + node.id.split('-').slice(-1)[0];
        //var titleNode = document.getElementById(titleNodeID);
        //var titleNodeWidth = titleNode.offsetWidth;;
        //node.style.width = titleNodeWidth + 'px';
    }
    var nodes = document.getElementsByClassName('kb-tab-enter');
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        nodes[i].addEventListener('focus',fieldFocusHandler);
        nodes[i].addEventListener('keydown',keyHandlerTabPrep);
        nodes[i].onkeyup = Cowboy.throttle(250,keyHandlerTabEnter);
        nodes[i].addEventListener('blur', function(event){
            var ev = event;
            setTimeout(
                function() {
                    clearDropper(ev.target)
                },1000)});
    }
    var nodes = document.getElementsByClassName('kb-tab-only');
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        nodes[i].onfocus = fieldFocusHandler;
    }
    var hiddenIframe = document.getElementById('hidden-iframe-id');
    hiddenIframe.addEventListener('load',completedUpload);
}

function keyHandlerEnterOnly (event) {
    if (event.key === 'Enter') {
        var adminID = getParameterByName('admin');
        var pageName = getParameterByName('page');
        var documentIDnode = getAncestorByName(event.target,'TABLE');
        var documentID = documentIDnode.getElementsByClassName('input-id')[0].value;
        var title = event.target.value;

        var ret = apiRequest(
            '/?admin='
                + adminID
                + '&page=top'
                + '&cmd=updateattachmenttitle'
            , {
                documentid:documentID,
                title:title
            }
        );
        if (false === ret) return;
        var node = event.target;
        node.classList.add('change-succeeded');
        setTimeout(function() {
            node.classList.remove('change-succeeded');
        }, 1000);
    }
};

function keyHandlerTabEnter (event,fromTab) {
    var idSplit = event.target.id.split('-');
    var searchName = idSplit.slice(-2,-1)[0];
    var tableName = searchName + 's';
    if (tableName === 'names') {
        tableName = 'persons';
    }
    if (searchName === 'name') {
        searchName = 'person';
    }
    var dropper = document.getElementById(idSplit.slice(0,-1).join('-') + '-dropdown');
    if (event.key === 'Enter' || fromTab) {
        if (event.target.value) {
            moveFocusForward(event.target);
        }
        clearDropper(event.target);
    } else if (event.key === 'Esc') {
        setFieldGroupState(event.target,'clear');
    } else if (dropper) {
        // Expose search lister with updated field value, call API, and populate list
        var adminID = getParameterByName('admin');
        var pageName = getParameterByName('page');
        if (!pageName) {
            pageName = 'top';
        }
        
        var rows = apiRequest(
            '/?admin='
                + adminID
                + '&page=' + pageName
                + '&cmd=search' + tableName
            , {
                str:event.target.value.toLowerCase()
            }
        );
        if (false === rows) return;
        for (i=0,ilen=dropper.childNodes.length;i<ilen;i+=1) {
            dropper.removeChild(dropper.childNodes[0]);
        }
        if (!rows.length) {
            dropper.style.display = 'none';
        } else {
            dropper.style.display = 'block';
        }
        for (var i=0,ilen=rows.length;i<ilen;i+=1) {
            var option = document.createElement('div');
            option.innerHTML = rows[i][searchName];
            option.classList.add('dropdown-option');
            option.onclick = window['set' + searchName.slice(0,1).toUpperCase() + searchName.slice(1) + 'Fields'];
            option.value = rows[i][searchName + 'ID'];
            dropper.appendChild(option);
        }
    }
};

function setSearchable (ev) {
    var node = document.getElementById('attachment-upload-searchable');
    node.checked = ev.target.checked;
};

function startingUpload (ev) {
    status.uploadID = ev.id;
    var title = document.getElementById('attachment-upload-title').value;
    var uploadButton = document.getElementById('attachment-upload-button');
    var form = document.getElementById('attachment-upload-widget');
    form.action = '?admin=' + getParameterByName('admin') + '&cmd=upload';
    var inputTitle = document.getElementById('attachment-attachment-0');
    var uploadTitle = document.getElementById('attachment-upload-title');
    uploadTitle.value = inputTitle.value;
    var uploadExtension = document.getElementById('attachment-upload-extension');
    uploadExtension.value = '';
    var uploadMimeType = document.getElementById('attachment-upload-mimetype');
    uploadMimeType.value = 'application/octet-stream';
    var uploadFilename = document.getElementById('attachment-upload-filename');
    var fileName = uploadFilename.files[0].name;
    var m = fileName.match(/.*\.([a-zA-Z]+$)/);
    if (m) {
        // XXX Get and set the extension, if any
        uploadExtension.value = m[1].toLowerCase();
        // XXX Set the mimeType
        uploadMimeType.value = mimeTypes[m[1].toLowerCase()] ? mimeTypes[m[1].toLowerCase()] : 'application/octet-stream';
    }
};

function completedUpload (ev) {
    // Rewrite uploader node, wake up delete button
    var iframe = ev.target;
    var innerDocument = iframe.contentDocument || iframe.contentWindow.document;
    var body = innerDocument.getElementsByTagName('BODY')[0];
    var ret = JSON.parse(body.textContent)
    var tableNode = document.getElementById('wrapper-attachment-0');
    addAttachment(tableNode,ret.documentID,ret.documentTitle);
    status.uploadID = null;
};

function buildTimes (node) {
    var timesHTML = '<option value="0">Time</option>\n';
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
}

function clearDropper(node) {
    var idSplit = node.id.split('-');
    var dropper = document.getElementById(idSplit.slice(0,-1).join('-') + '-dropdown');
    if (dropper) {
        dropper.style.display = 'none';
    }
}

function setFieldGroupState (node,state,calledFromButton) {
    if (calledFromButton) {
        var tableID = node.parentNode.id.replace(/-heading$/,'');
        var table = document.getElementById(tableID);
    } else {
        var table = getAncestorByName(node,'TABLE');
    }
    var input = getInputNodes(table);
    if (state === 'clear') {
        clearDropper(node);
        for (var i=1,ilen=input.fields.length;i<ilen;i+=1) {
            input.fields[i].value = null;
            input.fields[i].disabled = true;
        }
        for (var i=0,ilen=input.ids.length;i<ilen;i+=1) {
            input.ids[i].value = null;
        }
        input.fields[0].value = null;
        if (calledFromButton) {
            var fieldsHeading = document.getElementById(table.id + '-heading');
            var personIdNode = fieldsHeading.getElementsByClassName('input-id')[0];
            personIdNode.setAttribute('value','');
            input.buttons[0].disabled = false;
            // Let the DOM catch up
            setTimeout(function(){
                input.fields[0].focus();
            }, 100);
        }
        input.fields[0].disabled = false;
        input.buttons[0].disabled = true;
        input.buttons[1].style.display = 'none';
    } else if (state === 'edit') {
        for (var i=1,ilen=input.fields.length;i<ilen;i+=1) {
            input.fields[i].disabled = false;
        }
        input.fields[0].disabled = true;
        input.buttons[0].disabled = false;
        if (calledFromButton) {
            input.fields[1].focus();
        }
        input.buttons[1].style.display = 'none';
    } else if (state === 'view') {
        // Only permit view mode if all fields are filled in.
        // Otherwise, leave the fields open and return the first 
        // empty node, so that it can be focused by the caller
        for (var i=0,ilen=input.fields.length;i<ilen;i+=1) {
            if (!input.fields[i].value && !input.fields[i].disabled && !input.fields[i].classList.contains('optional')) {
                return input.fields[i];
            }
        }
        for (var i=0,ilen=input.fields.length;i<ilen;i+=1) {
            if (input.fields[i].value) {
                if (input.fields[i].classList.contains('optional')) {
                    //input.fields[i].classList.add('field-closed');
                } else {
                    input.fields[i].disabled = true;
                }
            }
        }
        if (input.buttons[0]) {
            input.buttons[0].style.display = 'inline';
            input.buttons[0].disabled = false;
            input.buttons[1].style.display = 'inline';
        }
    }
};

function setFieldState (node,state) {
    if (!node.value) {
        state = 'edit';
    }
    switch (state) {
    case 'view':
        node.classList.add('field-closed');
        node.classList.remove('field-open');
        break;
    case 'edit':
        node.classList.add('field-open');
        node.classList.remove('field-closed');
        break;
    default:
        //
        break;
    }
};

function setDeleteButtonState (node) {
    var table = getAncestorByName(node,'TABLE');
    var deleteButton = table.getElementsByClassName('delete-button');
    if (deleteButton && deleteButton.length) {
        deleteButton = deleteButton[0];
    } else {
        deleteButton = null;
    }
    if (deleteButton) {
        var inputs = table.getElementsByClassName('input');
        var enableDeleteButton = false;
        for (var i=0,ilen=inputs.length;i<ilen;i+=1) {
            var input = inputs[i];
            if (input.value && input.value != 0) {
                enableDeleteButton = true;
            }
        }
        if (enableDeleteButton) {
            deleteButton.disabled = false;
        } else {
            deleteButton.disabled = true;
        }
    }
}

function fieldFocusHandler (ev) {
    if (lastFocusNode && lastFocusNode.classList.contains('input')) {
        if (lastFocusNode !== ev.target) {
            var saveLastFields = !lastFocusNode.disabled;
            if (lastFocusNode.classList.contains('kb-tab-only') || lastFocusNode.classList.contains('solo')) {
                setFieldState(lastFocusNode,'view');
                setDeleteButtonState (lastFocusNode);
            } else {
                var lastTable = getAncestorByName(lastFocusNode,'TABLE');
                var thisTable = getAncestorByName(ev.target,'TABLE');
                if (lastTable !== thisTable) {
                    if (lastFocusNode.classList.contains('locking')) {
                        clearDropper(lastFocusNode);
                        if (!lastFocusNode.disabled) {
                            lastFocusNode.value = null;
                        }
                    } else {
                        var emptyNode = setFieldGroupState(lastTable,'view');
                        if (emptyNode) {
                            emptyNode.focus();
                            return;
                        }
                    }
                }
            }
            if (ev.target.classList.contains('kb-tab-only') || ev.target.classList.contains('solo')) {
                setFieldState(ev.target,'edit');
            }
            if (lastFocusNode.value && saveLastFields) {
                fieldFakeBlurHandler(lastFocusNode);
            }
        }
    }
    lastFocusNode = ev.target;
};

function fieldFakeBlurHandler (node) {
    var input = null;
    if (node.classList.contains('kb-tab-enter')) {
        var hasAllValues = true;
        input = getInputNodes(node);
        for (var i=0,ilen=input.fields.length;i<ilen;i+=1) {
            if (!input.fields[i].value) {
                hasAllValues = false;
                break;
            }
        }
        if (hasAllValues) {
            console.log("  Save data ok: "+Date("now")+" "+node.id);
            var table = getAncestorByName(node,'TABLE');
            if (table.classList.contains('persons')) {
                savePersonFields(table);
            }
        }
    }
};

function setContactFields(ev) {
    var node = ev.target;
    var tableNode = getAncestorByName(ev.target,'TABLE');
    var fieldNodes = tableNode.getElementsByClassName('field');
    for (var i=0,ilen=fieldNodes.length;i<ilen;i+=1) {
        var input = fieldNodes[i].getElementsByClassName('input')[0];
        var inputName = input.id.split('-').slice(-2,-1)[0];
        if (inputName === 'contact') {
            input.value = node.textContent;
            break;
        }
    }
    clearDropper(input);
    moveFocusForward(input);
}

function setAffiliationFields(ev) {
    var node = ev.target;
    var tableNode = getAncestorByName(ev.target,'TABLE');
    var fieldNodes = tableNode.getElementsByClassName('field');
    for (var i=0,ilen=fieldNodes.length;i<ilen;i+=1) {
        var input = fieldNodes[i].getElementsByClassName('input')[0];
        var inputName = input.id.split('-').slice(-2,-1)[0];
        if (inputName === 'affiliation') {
            input.value = node.textContent;
            break;
        }
    }
    clearDropper(input);
    moveFocusForward(input);
}

function setPositionFields(ev) {
    var node = ev.target;
    var tableNode = getAncestorByName(ev.target,'TABLE');
    var fieldNodes = tableNode.getElementsByClassName('field');
    for (var i=0,ilen=fieldNodes.length;i<ilen;i+=1) {
        var input = fieldNodes[i].getElementsByClassName('input')[0];
        var inputName = input.id.split('-').slice(-2,-1)[0];
        if (inputName === 'position') {
            input.value = node.textContent;
            break;
        }
    }
    clearDropper(input);
    moveFocusForward(input);
}

function setAttachmentFields (ev) {
    console.log("BROKEN");
    var tableNode = getAncestorByName(ev.target,'TABLE');
    var documentID = ev.target.value;
    var documentTitle = ev.target.textContent;
    console.log("WELL? "+tableNode+" "+documentID+" "+documentTitle);
    addAttachment(tableNode,documentID,documentTitle);
};

function addAttachment (tableNode, documentID, documentTitle) {
    console.log("(1)");
    // Get existing values, if any
    status.attachments = {};
    var attachmentContainer = document.getElementById('attachment-container');
    for (var i=0,ilen=attachmentContainer.childNodes.length;i<ilen;i+=1) {
        var attachmentNode = attachmentContainer.childNodes[i];
        var fieldNode = attachmentNode.getElementsByClassName('field')[0];
        var id = fieldNode.getElementsByClassName('input-id')[0].value;
        var title = fieldNode.getElementsByClassName('input-title')[0].value;
        status.attachments[title] = id;
    }

    console.log("(2)");
    // Add this documentID and documentTitle to status.attachments IF it is a new one.
    if (!status.attachments[documentTitle]) {
        status.attachments[documentTitle] = documentID;
    }

    // 
    var attachments = [];
    for (var title in status.attachments) {
        attachments.push({documentID:status.attachments[title],documentTitle:title});
    }
    
    console.log("(3): "+JSON.stringify(attachments,null,2));
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
    console.log("(4)");

    // Add the updated nodes
    for (var i=0,ilen=attachments.length;i<ilen;i+=1) {
        appendAttachmentNode(attachmentContainer,attachments[i].documentID,attachments[i].documentTitle);
    }


    var attachmentIdNode = document.getElementById('attachment-id-0');
    var attachmentTitleNode = document.getElementById('attachment-attachment-0');
    var attachmentUploadTitleNode = document.getElementById('attachment-upload-title');
    var attachmentUploadFilenameNode = document.getElementById('attachment-upload-filename');

    // Clear the visible values in the uploader widget
    attachmentTitleNode.value = '';
    attachmentUploadFilenameNode.value = '';
    console.log("(5)");

    // Clear the dropper
    clearDropper(attachmentTitleNode);
};

function setPersonFields (ev) {
    var tableNode = getAncestorByName(ev.target,'TABLE');
    var fieldNodes = tableNode.getElementsByClassName('field');
    var fields = {};
    for (var i=0,ilen=fieldNodes.length;i<ilen;i+=1) {
        var input = fieldNodes[i].getElementsByClassName('input')[0];
        var inputName = input.id.split('-').slice(-2,-1)[0];
        fields[inputName] = input;
    }
    var fieldsHeading = document.getElementById(tableNode.id + '-heading');
    var personIdNode = fieldsHeading.getElementsByClassName('input-id')[0];

    var personID = ev.target.value;

    personIdNode.setAttribute('value',personID);

    var adminID = getParameterByName('admin');
    var pageName = getParameterByName('page');
    var row = apiRequest(
        '/?admin='
            + adminID
            + '&page=top'
            + '&cmd=getoneperson'
        , {
            personid:personID
        }
    );
    if (false === row) return;
    for (var fieldName in fields) {
        fields[fieldName].value = row[fieldName];
    }
    
    clearDropper(fields.name);
    // true is for honorLock
    setFieldGroupState(fields.name,'view');
    moveFocusForward(fields.name,true);
};

function savePersonFields (tableNode) {
    var fieldNodes = tableNode.getElementsByClassName('field');
    var fieldsHeading = document.getElementById(tableNode.id + '-heading');
    var personIdNode = fieldsHeading.getElementsByClassName('input-id')[0];
    var personID = personIdNode.getAttribute('value');
    var data = {
        personID:personID,
        name:null,
        contact:null,
        affiliation:null,
        position:null
    }
    for (var i=0,ilen=fieldNodes.length;i<ilen;i+=1) {
        var field = fieldNodes[i];
        var node = field.getElementsByClassName('input')[0];
        var value = node.value;
        var fieldName = node.id.split('-').slice(-2,-1)[0];
        data[fieldName] = value;
    }
    setTimeout(function(){
        // perform the save
        var adminID = getParameterByName('admin');
        var pageName = getParameterByName('page');
        var row = apiRequest(
            '/?admin='
                + adminID
                + '&page=top'
                + '&cmd=savetopersons'
            , {
                personid:personID,
                data:data
            }
        );
        if (false === row) return;
        // write the id back to the top-level input-id node
        personIdNode.value = row.personID;
    },1000); 
};

function getAncestorByName (node,name) {
    if (node && node.tagName !== name) {
        return getAncestorByName(node.parentNode,name);
    } else {
        return node;
    }
}

function getInputNodes (node) {
    var ret = {fields:[],buttons:[],ids:[]};
    var table = getAncestorByName(node,'TABLE');
    if (!table) {
        return ret;
    }
    var idnodes = table.getElementsByClassName('input-id');
    if (idnodes && idnodes.length) {
        ret.ids = idnodes;
    }
    var heading = document.getElementById(table.id + '-heading');
    if (heading) {
        ret.buttons = heading.getElementsByTagName('INPUT');
    }
    ret.fields = table.getElementsByClassName('input');
    return ret;
}

function keyHandlerTabPrep (ev) {
    if (ev.key === 'Tab') {
        ev.preventDefault();
        keyHandlerTabEnter(ev,true);
    }
};

function moveFocusForward (node,honorLock) {
    var input = getInputNodes(node);
    var nextNodeIndex = 0;
    var lastNode = false;
    if (!honorLock) {
        for (var i=0,ilen=input.fields.length;i<ilen;i+=1) {
            if (i === 0 && input.fields[0].classList.contains('locking')) {
                setFieldGroupState(node,'edit');
            }
            if (input.fields[i] === node && i<(input.fields.length-1)) {
                nextNodeIndex = i+1;
            }
        }
    }
    if (nextNodeIndex) {
        input.fields[nextNodeIndex].focus();
    } else {
        var table = getAncestorByName(node,'TABLE');
        while (table.nextSibling) {
            table = table.nextSibling;
            if (table.tagName && table.tagName === 'TABLE') {
                var inputs = table.getElementsByTagName('INPUT');
                if (!inputs || !inputs.length) {
                    inputs = table.getElementsByTagName('TEXTAREA');
                } 
                if (inputs.length && !inputs[0].disabled) {
                    inputs[0].focus();
                    break;
                }
            }
        }
    }
}

var mimeTypes = {
    txt: 'text/plain',
    doc: 'application/word',
    pdf: 'application/pdf'
}

function setFileExtension (node) {
    var uploadButton = document.getElementById('attachment-upload-button');
    uploadButton.disabled = false;
    return;

    // Ignore this
    var idSplit = node.id.split('-');
    var mimeNode = document.getElementById('attachment-upload-mimetype');
    var extNode = document.getElementById('attachment-upload-extension');
    var m = node.value.match(/.*\.([a-zA-Z]+)$/);
    if (m) {
        if (mimeTypes[m[1]]) {
            mimeNode.value = mimeTypes[m[1].toLowerCase()];
            extNode.value = "." + m[1].toLowerCase();
        } else {
            mimeNode.value = "application/octet-stream";
            extNode.value = "";
        }
    } else {
        mimeNode.value = "application/octet-stream";
        extNode.value = "";
    }
};

function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function fixPath (path) {
    var match = RegExp('https?://[^/]*/(.*?)([?#]|$)').exec(window.location.href);
    // If a stub exists, assume secure operation, so:
    var stub =  match && match[1];
    if (stub) {
        //   (1) remove &admin= value from URL
        path = path.replace(/(\?)(?:admin=[^&]*)*(.*?)(?:&admin=[^&]*)*/,'$1$2');
        //   (2) if URL begins with '/?', append stub to '/'
        path = path.replace(/^(\/)(\?)/, '$1' + stub + '$2');
        //   (3) remove any port designation from URL
        path = path.replace(/(https?:\/\/[^\/]*):[0-9]+/, '$1');
    }
    return path;
}

function apiRequest (url, obj, returnAsString) {
    url = fixPath(url);
    if ("object" === typeof obj) {
        obj = JSON.stringify(obj);
    } else if (!obj) {
        obj = null;
    }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, false);
    xhr.setRequestHeader("Content-type","application/json");
    xhr.send(obj);
    if (200 != xhr.status) {
        return false;
    }
    if (xhr.getResponseHeader('content-type') === 'text/html') {
        document = xhr.responseXML;
    }
    var ret = xhr.responseText;
    if (!returnAsString) {
        ret = JSON.parse(ret);
    }
    return ret;
}

function markdown (txt) {
    if (!txt) return '<p>&nbsp;</p>';
    txt = txt.replace(/(:-?\))/g,'(\u0298\u203f\u0298)');
    txt = txt.replace(/(:-\/)/g,'_(\u0361\u0e4f\u032f\u0361\u0e4f)_');
    txt = txt.replace(/\(\(([a-zA-Z1-9])\)\)/g, function (aChar) {
        var c, val, offset;
        if (aChar[2].match(/[a-z]/)) {
            val = (aChar.charCodeAt(2) - 97)
            offset = 9424;
        } else if (aChar[2].match(/[A-Z]/)) {
            val = (aChar.charCodeAt(2) - 65)
            offset = 9398;
        } else {
            val = (aChar.charCodeAt(2) - 49)
            offset = 9312;
        }
        return String.fromCharCode(val + offset);
    });
    return marked.parse(txt);
}

function confirmDelete (node,callbackName) {
    var origValue,origEvent;
    if (node.value) {
        origValue = node.value;
        node.value="Delete?";
    } else {
        origValue = node.innerHTML;
        node.innerHTML ="Delete?";
    }
    var origEvent = '' + node.getAttribute('onclick');
    var origStyle = node.parentNode.style;
    node.style.color = 'red';
    node.setAttribute('onclick', callbackName + '(this)');
    setTimeout(function() {
        if (node.value) {
            node.value = origValue;
        } else {
            node.innerHTML = origValue;
        }
        node.style = origStyle;
        node.setAttribute('onclick',origEvent);
    },2000);
}

var attachmentHtmlTemplate = '<tr>'
    + '  <td>Title:</td>'
    +'   <td class="field">'
    + '    <div>'
    + '      <input class="input-id" type="text" style="display:none;" value="@@DOCUMENT_ID@@"/>'
    + '      <input class="input-title" type="text" size="50" value="@@DOCUMENT_TITLE@@" onkeyup="keyHandlerEnterOnly(event)"/>'
    + '    </div>'
    + '  </td>'
    + '  <td rowspan="2">'
    + '    <input type="button" value="Delete" onclick="deleteAttachment(event)">'
    + '  </td>'
    + '</tr>'
    + '<tr>'
    + '  <td></td>'
    + '  <td class="field">'
    + '<div class="document-link"><a href="/attachments/@@DOCUMENT_ID@@">attachments/@@DOCUMENT_ID@@</a></div>'
    + '  </td>'
    + '</tr>';

function appendAttachmentNode(node,documentID,documentTitle) {
    var attachmentNode = document.createElement('table');
    attachmentNode.innerHTML = attachmentHtmlTemplate.replace(/@@DOCUMENT_ID@@/g,documentID).replace(/@@DOCUMENT_TITLE@@/,documentTitle);
    node.appendChild(attachmentNode);
};
