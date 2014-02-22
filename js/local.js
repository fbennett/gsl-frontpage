var lastFocusNode = null;

function setFieldGroupState (node,state,calledFromHeading) {
    if (calledFromHeading) {
        var tableID = node.parentNode.id.replace(/-heading$/,'');
        var table = document.getElementById(tableID);
    } else {
        var table = getAncestorByName(node,'TABLE');
    }
    var input = getInputNodes(table);
    switch (state) {
    case 'clear':
        console.log("Focusing");
        for (var i=1,ilen=input.fields.length;i<ilen;i+=1) {
            input.fields[i].value = '';
            input.fields[i].disabled = true;
            input.fields[i].placeholder = '';
        }
        input.fields[0].value = '';
        input.fields[0].disabled = false;
        input.buttons[0].disabled = true;
        input.fields[0].focus();
        input.fields[0].focus();
        console.log("  done");
        input.buttons[1].style.display = 'none';
        break;
    case 'edit':
        for (var i=1,ilen=input.fields.length;i<ilen;i+=1) {
            input.fields[i].disabled = false;
            input.fields[i].placeholder = 'Required';
        }
        input.fields[0].disabled = true;
        input.buttons[0].disabled = false;
        input.fields[1].focus();
        input.buttons[1].style.display = 'none';
        break;
    case 'view':
        // Only permit view mode if all fields are filled in.
        // Otherwise, this function should leave the fields open
        // and return the first empty node, so that it can be focused
        // by the calling function.
        for (var i=0,ilen=input.fields.length;i<ilen;i+=1) {
            if (!input.fields[i].value) {
                return input.fields[i];
            }
        }
        for (var i=0,ilen=input.fields.length;i<ilen;i+=1) {
            input.fields[i].disabled = true;
            input.fields[i].placeholder = '';
            input.buttons[1].style.display = 'inline';
        }
        break;
    default:
        break;
    }
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

function setDeleteAddButtonState (node) {
    var table = getAncestorByName(node,'TABLE');
    var addButton = table.getElementsByClassName('add-button');
    if (addButton && addButton.length) {
        addButton = addButton[0];
    } else {
        addButton = null;
    }
    if (addButton) {
        var deleteButton = table.getElementsByClassName('delete-button');
        if (deleteButton && deleteButton.length) {
            deleteButton = deleteButton[0];
        }
        var inputs = table.getElementsByClassName('input');
        var showDeleteButton = false;
        var enableAddButton = true;
        for (var i=0,ilen=inputs.length;i<ilen;i+=1) {
            var input = inputs[i];
            if (input.value && input.value != 0) {
                showDeleteButton = true;
            } else {
                enableAddButton = false;
            }
        }
        if (showDeleteButton) {
            deleteButton.style.visibility = 'visible';
        } else {
            deleteButton.style.visibility = 'hidden';
        }
        if (enableAddButton) {
            addButton.disabled = false;
        } else {
            addButton.disabled = true;
        }
    }
}

function fieldFocusHandler (ev) {
    if (lastFocusNode) {
        if (lastFocusNode !== ev.target) {
            if (lastFocusNode.classList.contains('kb-tab-only') || lastFocusNode.classList.contains('solo')) {
                setFieldState(lastFocusNode,'view');
                setDeleteAddButtonState (lastFocusNode);
            } else {
                var lastTable = getAncestorByName(lastFocusNode,'TABLE');
                var thisTable = getAncestorByName(ev.target,'TABLE');
                if (lastTable !== thisTable) {
                    var emptyNode = setFieldGroupState(lastTable,'view');
                    if (emptyNode) {
                        emptyNode.focus();
                    }
                }
            }
            if (ev.target.classList.contains('kb-tab-only') || ev.target.classList.contains('solo')) {
                setFieldState(ev.target,'edit');
            }
        }
    }
    lastFocusNode = ev.target;
};

function fieldBlurHandler (ev) {
    var input;
    if (ev.target.classList.contains('kb-tab-enter')) {
        var hasAllValues = true;
        input = getInputNodes(ev.target);
        for (var i=0,ilen=input.fields.length;i<ilen;i+=1) {
            if (!input.fields[i].value) {
                hasAllValues = false;
                break;
            }
        }
        if (hasAllValues) {
            console.log("  Save data ok: "+Date("now"));
        }
    }
};

function fixUploadWidgetWidth () {
    var nodes = document.getElementsByClassName('attachment-upload-widget');
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        var node = nodes[i];
        var titleNodeID = 'attachment-title-' + node.id.split('-').slice(-1)[0];
        var titleNode = document.getElementById(titleNodeID);
        var titleNodeWidth = titleNode.offsetWidth;;
        node.style.width = titleNodeWidth + 'px';
    }
    var nodes = document.getElementsByClassName('kb-tab-enter');
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        nodes[i].onfocus = fieldFocusHandler;
        nodes[i].onblur = fieldBlurHandler;
        nodes[i].onkeydown = keyHandlerTabPrep;
        nodes[i].onkeyup = keyHandlerTabEnter;
    }
    var nodes = document.getElementsByClassName('kb-tab-only');
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        nodes[i].onfocus = fieldFocusHandler;
        nodes[i].onblur = fieldBlurHandler;
    }
}

function getAncestorByName (node,name) {
    if (node && node.tagName !== name) {
        return getAncestorByName(node.parentNode,name);
    } else {
        return node;
    }
}

function getInputNodes (node) {
    var ret = {fields:[],buttons:[]};
    var table = getAncestorByName(node,'TABLE');
    if (!table) {
        return ret;
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

function keyHandlerTabEnter (ev,fromTab) {
    var idSplit = ev.target.id.split('-');
    var tableName = idSplit.slice(-1)[0];
    var searchName = idSplit.slice(-2,-1)[0];
    var dropper = document.getElementById(idSplit.slice(0,-1).join('-') + '-dropdown');
    if (ev.key === 'Enter' || fromTab) {
        if (ev.target.value) {
            var input = getInputNodes(ev.target);
            var nextNodeIndex = 0;
            var lastNode = false;
            for (var i=0,ilen=input.fields.length;i<ilen;i+=1) {
                if (i === 0 && input.fields[0].classList.contains('locking')) {
                    setFieldGroupState(ev.target,'edit');
                }
                if (input.fields[i] === ev.target && i<(input.fields.length-1)) {
                    nextNodeIndex = i+1;
                }
            }
            if (nextNodeIndex) {
                input.fields[nextNodeIndex].focus();
            } else {
                var table = getAncestorByName(ev.target,'TABLE');
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
        if (dropper) {
            dropper.style.display = 'none';
        }
    } else if (ev.key === 'Esc') {
        setFieldGroupState(ev.target,'clear');
        if (dropper) {
            dropper.style.display = 'none';
        }
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
                + '&cmd=search-' + tableName + '-' + searchName
            , {
                str:ev.target.value.toLowerCase()
            }
        );
        if (false === rows) return;
        for (i=0,ilen=dropper.childNodes.length;i<ilen;i+=1) {
            dropper.removeChild(dropper.childNodes[0]);
        }
        dropper.style.display = 'block';
        for (var i=0,ilen=rows.length;i<ilen;i+=1) {
            var option = document.createElement('div');
            option.innerHTML = rows[i].name;
            dropper.appendChild(option);
        }
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
    if (xhr.getResponseHeader('content-type') === 'text/html') {
        document = xhr.responseXML;
    }
    if (200 != xhr.status) {
        return false;
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

