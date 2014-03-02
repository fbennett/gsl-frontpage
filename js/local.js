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

