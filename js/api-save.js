function savePersonFields (node) {
    var base = node.id.split('-')[0];
    var personIdNode = document.getElementById(base + '-name-id');
    var personID = personIdNode.value;

    var fields = {};
    var data = {};
    forField(node,function(field){
        // Save individual fields here
        var fieldName = field.id.split('-')[1];
        fields[fieldName] = field.value;
        cache[field.id] = field.value;
        showSave(field);
        var colname = field.id.split('-')[1];
        data[colname] = field.value;
    });

    // console.log(JSON.stringify(row,null,2));

    // API call
    var adminID = getParameterByName('admin');
    var pageName = getParameterByName('page');
    if (!pageName) {
        pageName = 'top';
    }
    var row = apiRequest(
        '/?admin='
            + adminID
            + '&page=' + pageName
            + '&cmd=savetopersons'
        , {
            data:data,
            personid:personID
        }
    );
    if (false === row) return;
    // Refresh personID
    personIdNode.value = row.personID;
};



