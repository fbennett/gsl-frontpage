function keyHandlerTabEnter (event,fromTab) {
    //else {
    //    var uploadButton = document.getElementById('attachment-upload-button');
    //    if (!event.target.value) {
    //        uploadButton.style.display = 'none';
    //    } else if (document.getElementById('attachment-upload-file').files.length) {
    //        uploadButton.style.display = 'inline';
    //    }
    //}

    // The handlers need access to the following:
    //   * Current input field node [event.target]
    //   * Name for the API call [tableName]
    //   * Field name in search return [could be the same as tableName]
    //   * fromTab toggle [from argument]
    //   * dropper node [dropper]
    //
    // To clean up, the base ID should be a single word identifying
    // the field. The tableName and searchName values should be identical.
    // And dropper should be derived simply by adding -dropper to the base ID.
    // Possibly the setting function (setPersonFields etc) should be a named
    // callback, to make the code more transparent.

    // This handler should be broken into smaller special-purpose handlers: one for use
    // in the two Persons blocks, one for Details, one or more for Sessions,
    // one for Attachments, and one for attachment children. If the nodes
    // are identified by fine-grained classes, they can be applied sensibly.

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

function clearDropper(node) {
    var idSplit = node.id.split('-');
    var dropper = document.getElementById(idSplit.slice(0,-1).join('-') + '-dropdown');
    if (dropper) {
        dropper.style.display = 'none';
    }
};
