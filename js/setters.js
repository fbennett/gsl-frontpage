function personSetter (ev) {
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

