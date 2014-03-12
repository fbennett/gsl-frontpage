function nameSet (event) {
    if (event.target.value) {
        var container = getContainer(event.target);
        // If a value exists, either set the group from it, or set it as solo
        var adminID = getParameterByName('admin');
        var pageName = getParameterByName('page');
        if (!pageName) {
            pageName = 'top';
        }
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

function showSave (fieldNode) {
    fieldNode.classList.add('change-succeeded');
    setTimeout(function(){
        fieldNode.classList.remove('change-succeeded');
        fieldNode.classList.add('has-content');
    },1500);
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

function getSearchableKeydownHandler (fieldName) {
    return function (event) {
        if (['Tab','Down','Esc'].indexOf(event.key) > -1) {
            event.preventDefault();
            console.log("cc "+fieldName+" "+event.key);
            window[fieldName + 'KeyupHandler'](event, event.key);
        }
    };
};

function getSearchableKeyupHandler (fieldName) {
    return function (event, fromKeyDown) {
        console.log("RUN key down handler: ("+event.key+") ("+fromKeyDown+")");
        if (fromKeyDown) {
            event.preventDefault();
        }
        if (event.target.classList.contains('block-sayt')) {
            console.log("block-sayt");
            event.target.classList.remove('block-sayt');
            return;
        }
        if (event.key === 'Enter' || fromKeyDown === 'Tab') {
            event.preventDefault();
            event.target.removeEventListener('blur',blurRestoreFromCache);
            window[fieldName + 'Set'](event);
            event.target.addEventListener('blur',blurRestoreFromCache);
        } else if (fromKeyDown === 'Down') {
            console.log("DOWN");
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
            keyboardSearchThrottle (250,function(){
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
            event.preventDefault();
            var fieldID = event.target.id.split('-').slice(0,2).join('-');
            var fieldNode = document.getElementById(fieldID);
            var fieldName = event.target.id.split('-')[1];
            if (['Enter','Tab'].indexOf(event.key) > -1) {
                if (fieldName === 'name') {
                    var fieldName = fieldNode.id.split('-')[1];
                    window[fieldName + 'Pull'](event.target,event.target.options[event.target.selectedIndex].value);
                } else if (fieldName === 'attachment') {
                    attachmentPull(event.target,event.target.options[event.target.selectedIndex].value);
                } else {
                    fieldNode.value = event.target.options[event.target.selectedIndex].textContent;
                    setServantFields(fieldNode);
                }
                if (fieldName !== 'attachment') {
                    enableClearButton(event.target);
                }
                var dropdown = document.getElementById(fieldID + '-dropdown');
                dropdown.classList.remove('block-dropper-blur');
                fieldNode.classList.remove('block-sayt');
                moveFocusForward(fieldNode);
                dropdown.style.display = 'none';
            } else if ((event.key === 'Up' && event.target.selectedIndex === 0) || event.key === 'Esc') {
                fieldNode.focus();
            }
        }
    }
};

function attachmentSet(event) {
    console.log("RUNNING");
    // Check for perfect *searchable* match on title, use existing DB entry if exists.
    // Otherwise just set the field.
    if (event.target.value) {
        var container = getContainer(event.target);
        // If a value exists, either set the group from it, or set it as solo
        var adminID = getParameterByName('admin');
        var pageName = getParameterByName('page');
        if (!pageName) {
            pageName = 'top';
        }
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
            // Check for match
            for (var i=0,ilen=rows.length;i<ilen;i+=1) {
                row = rows[i];
                if (row.attachment.toLowerCase() === event.target.value.toLowerCase()) {
                    perfectMatch = row;
                    break;
                }
            }
        }
        //if (perfectMatch) {
            // Set document ID and allow upload
        //    moveFocusForward(event.target);
        //} else {
            // Just change the highlight and move forward
        //    moveFocusForward(event.target);
        //}
    }
    moveFocusForward(event.target);
};
