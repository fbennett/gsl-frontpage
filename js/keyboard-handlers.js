function nameSet (event) {
    if (event.target.value) {
        var container = getContainer(event.target);
        // If a value exists, either set the group from it, or set it as solo
        var rows = apiRequest(
            '/?admin='
                + adminID
                + '&page=' + pageName
                + '&cmd=searchname'
            , {
                str:event.target.value.toLowerCase()
            }
        );
        var perfectMatch = false;
        if (rows) {
            // Check for match
            for (var i=0,ilen=rows.length;i<ilen;i+=1) {
                var row = rows[i];
                if (row.name.toLowerCase() === event.target.value.toLowerCase()) {
                    perfectMatch = row;
                }
            }
        }
        if (perfectMatch) {
            namePull(event.target,perfectMatch.personID);
        } else {
            // If no perfect match found, open servants for editing
            event.target.classList.add('has-content');
            var servantNodes = container.getElementsByClassName('person-servant');
            for (var i=0,ilen=servantNodes.length;i<ilen;i+=1) {
                servantNodes[i].disabled = false;
            }
        }
        var clearButton = document.getElementById(container.id + '-clear');
        clearButton.disabled = false;
        moveFocusForward(event.target);
        event.target.disabled = true;
    } else {
        // Otherwise just open the next field
        moveFocusForward(event.target);
    }
};

function showSave (fieldNode,callback) {
    //console.log("(1)");
    fieldNode.classList.add('change-succeeded');
    //console.log("(2)");
    setTimeout(function(){
        //console.log("(3)");
        fieldNode.classList.remove('change-succeeded');
        //console.log("(4)");
        fieldNode.classList.add('has-content');
        //console.log("(5)");
        if (callback) {
            setTimeout(function(){
                //console.log("(6)");
                callback(fieldNode);
            },750);
        }
    },750);
};

function getServantFieldSetter (fieldName) {
    return function (event) {
        var node = event.target;
        setServantFields(node);
    };
};

function setServantFields(node) {
    if (node.value) {
        // If field has content, check for completeness, save if appropriate, and focus next
        var containerID = node.id.split('-')[0];
        var container = document.getElementById(containerID);
        var servantNodes = container.getElementsByClassName('person-servant');
        var complete = true;
        for (var i=0,ilen=servantNodes.length;i<ilen;i+=1) {
            if (!servantNodes[i].value) {
                complete = false;
                break;
            }
        }
        if (complete) {
            savePersonFields(container);
            moveFocusForward(servantNodes[servantNodes.length - 1]);
            enableEditButton(container);
            disablePersonServants(container);
        } else {
            moveFocusForward(node);
        }
    }
};

function getSearchableKeyupHandler (fieldName) {
    return function (event) {
        if (event.target.classList.contains('block-sayt')) {
            event.target.classList.remove('block-sayt');
            return;
        }
        //console.log("keyCode: "+event.keyCode);
        if (['Enter','Tab'].indexOf(keyCodeMap[event.keyCode]) > -1) {
            event.preventDefault();
            //console.log("Running Tab");
            event.target.removeEventListener('blur',blurRestoreFromCache);
            window[fieldName + 'Set'](event);
            event.target.addEventListener('blur',blurRestoreFromCache);
        } else if (keyCodeMap[event.keyCode] === 'Down') {
            event.preventDefault();
            var dropper = getDropper(event.target);
            if (dropper.childNodes.length) {
                event.target.classList.remove('block-sayt');
                event.target.classList.add('block-sayt');
                event.target.classList.remove('block-dropper-blur');
                event.target.classList.add('block-dropper-blur');
                event.target.classList.remove('block-blur-restore');
                event.target.classList.add('block-blur-restore');
                dropper.selectedIndex = 0;
                dropper.focus();
            }
        } else {
            keyboardSearchThrottle (500,function(){
                // Expose search lister with updated field value, call API, and populate list
                var rows = apiRequest(
                    '/?admin='
                        + adminID
                        + '&page=' + pageName
                        + '&cmd=search' + fieldName
                    , {
                        str:event.target.value.toLowerCase()
                    }
                );
                if (false === rows) return;

                var dropper = getDropper(event.target);
                for (i=0,ilen=dropper.childNodes.length;i<ilen;i+=1) {
                    dropper.removeChild(dropper.childNodes[0]);
                }

                // Nip and tuck
                var fieldIDkey = fieldName + 'ID';
                if (fieldName === 'name') {
                    fieldIDkey = 'personID'
                }

                for (var i=0,ilen=rows.length;i<ilen;i+=1) {
                    var option = document.createElement('option');
                    option.innerHTML = rows[i][fieldName];
                    option.value = rows[i][fieldIDkey];
                    dropper.appendChild(option);
                }
            })(event);
        }
    };
};


function getKeyDropdown(fieldID) {
    return function (event) {
        if (event.target.tagName === 'SELECT') {
            var fieldID = event.target.id.split('-').slice(0,2).join('-');
            var fieldNode = document.getElementById(fieldID);
            var fieldName = event.target.id.split('-')[1];
            if (['Enter','Tab'].indexOf(keyCodeMap[event.keyCode]) > -1) {
                event.preventDefault();
                if (fieldName === 'name') {
                    var fieldName = fieldNode.id.split('-')[1];
                    window[fieldName + 'Pull'](event.target,event.target.options[event.target.selectedIndex].value);
                } else if (fieldName === 'attachment') {
                    attachmentPull(event.target,event.target.options[event.target.selectedIndex].value);
                } else if (fieldName === 'place') {
                    placePull(fieldNode,event.target.options[event.target.selectedIndex].textContent);
                } else {
                    fieldNode.value = event.target.options[event.target.selectedIndex].textContent;
                    setServantFields(fieldNode);
                }
                if (fieldName !== 'attachment' && fieldName !== 'place') {
                    enableClearButton(event.target);
                }
                var dropdown = document.getElementById(fieldID + '-dropdown');
                dropdown.classList.remove('block-dropper-blur');
                fieldNode.classList.remove('block-sayt');
                moveFocusForward(fieldNode);
                dropdown.style.display = 'none';
            } else if ((keyCodeMap[event.keyCode] === 'Up' && event.target.selectedIndex === 0) || keyCodeMap[event.keyCode] === 'Esc') {
                event.preventDefault();
                fieldNode.focus();
            }
        }
    }
};

function attachmentSet(event) {
    // Check for perfect *searchable* match on title, use existing DB entry if exists.
    // Otherwise just set the field.
    if (event.target.value) {
        var container = getContainer(event.target);
        // If a value exists, either set the group from it, or set it as solo
        var rows = apiRequest(
            '/?admin='
                + adminID
                + '&page=' + pageName
                + '&cmd=searchattachment'
            , {
                str:event.target.value.toLowerCase()
            }
        );
        var perfectMatch = false;
        var row = null;
        if (rows) {
            convertAllDatesToLocal(rows);
            // Check for match
            for (var i=0,ilen=rows.length;i<ilen;i+=1) {
                row = rows[i];
                if (row.attachment.toLowerCase() === event.target.value.toLowerCase()) {
                    perfectMatch = row;
                    break;
                }
            }
        }
    }
    moveFocusForward(event.target);
};

function attachmentTitleKeyup(event) {
    if (['Enter','Tab'].indexOf(keyCodeMap[event.keyCode]) > -1) {
        event.preventDefault();
        var documentID = 0;
        var m = event.target.id.match(/^document([0-9]+).*/);
        if (m) {
            documentID = parseInt(m[1],10);
        }
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
        cache[node.id] = node.value;
        node.classList.add('change-succeeded');
        node.classList.remove('change-succeeded');
        node.classList.add('field-closed');
        moveFocusForward(node);
    }
};

function sessionTitleKeyup (event) {
    if (['Enter','Tab'].indexOf(keyCodeMap[event.keyCode]) > -1) {
        event.preventDefault();
        updateSessionAddButton(event.target);
    }
};

function placeSet(event) {
    if (event.target.value) {
        // Save to DB
        var ret = apiRequest(
            '/?admin='
                + adminID
                + '&page=top'
                + '&cmd=saveplace'
            , {
                place:event.target.value,
                touchdate:clientDateToServer(pageDate)
            }
        );
        if (false === ret) return;
        
        // Check for completion
        updateSessionAddButton(event.target);
    }
};

function eventTitleKeyup (event) {
    if (['Enter','Tab'].indexOf(keyCodeMap[event.keyCode]) > -1) {
        event.preventDefault();
        if (event.target.value) {
            cache[event.target.id] = event.target.value;
            moveFocusForward(event.target);
        }
    }
};

function noteKeyup (event) {
    if ('Tab' === keyCodeMap[event.keyCode]) {
        event.preventDefault();
        cache[event.target.id] = event.target.value;
        moveFocusForward(event.target);
    }
};

function descriptionKeyup (event) {
    if ('Tab' === keyCodeMap[event.keyCode]) {
        event.preventDefault();
        if (event.target.value) {
            cache[event.target.id] = event.target.value;
            moveFocusForward(event.target);
        }
    }
};
