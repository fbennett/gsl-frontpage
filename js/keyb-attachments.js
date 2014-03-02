function keyHandlerEnterOnly (event) {
    if (event.key === 'Enter') {
        var adminID = getParameterByName('admin');
        var pageName = getParameterByName('page');
        var documentID = document.getElementById('attachment-upload-id');
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
            node.classList.add('field-closed');
        }, 1000);
    }
};

