function namePull (node,personID) {
    var container = getContainer(node);
    var adminID = getParameterByName('admin');
    var pageName = getParameterByName('page');
    if (!pageName) {
        pageName = 'top';
    }
    var row = apiRequest(
        '/?admin='
            + adminID
            + '&page=' + pageName
            + '&cmd=getoneperson'
        , {
            personid:personID
        }
    );
    if (false === row) return;
    for (var fieldName in row) {
        var node = document.getElementById(container.id + '-' + fieldName);
        node.value = row[fieldName];
        cache[node.id] = node.value;
        showSave(node);
        if (fieldName === 'name') {
            var idNode = document.getElementById(container.id + '-name-id');
            idNode.value = personID;
            continue;
        }
        node.disabled = true;
    }
    var editButton = document.getElementById(container.id + '-edit');
    editButton.style.display = 'inline';
};

function attachmentPull(node,documentID) {
    console.log("Update from documentID: "+documentID);
    var container = getContainer(node);
    var adminID = getParameterByName('admin');
    var pageName = getParameterByName('page');
    if (!pageName) {
        pageName = 'top';
    }
    var row = apiRequest(
        '/?admin='
            + adminID
            + '&page=' + pageName
            + '&cmd=getonedocument'
        , {
            documentid:documentID
        }
    );
    if (false === row) return;
    console.log("PROCEED");
    addAttachment(row.documentID,row.title);
};

function placePull(node,place) {
    node.classList.add('block-blur-restore');
    var dropdown = document.getElementById(node.id + '-dropdown');
    dropdown.classList.add('block-dropper-blur');
    var select = document.getElementById(node.id + '-dropdown-select');
    
    node.value = place;
    cache[node.id] = place;

    var sessionAddButton = document.getElementById('session-add-button');
    if (checkSessionFieldValues(node)) {
        sessionAddButton.disabled = false;
        sessionAddButton.focus();
    } else {
        sessionAddButton.disabled = true;
        moveFocusForward(node);
    }
    
    dropdown.classList.remove('block-dropper-blur');
    dropdown.style.display = 'none';
};
