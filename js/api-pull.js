function namePull (node,personID) {
    var container = getContainer(node);
    // Check for a perfect match in persons. If found, set the group and move on.
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

