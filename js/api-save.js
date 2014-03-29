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

    // API call
    var row = apiRequest(
        '/?admin='
            + adminID
            + '&page=' + pageName
            + '&cmd=savetopersons'
        , {
            data:data,
            personid:personID,
            touchdate:clientDateToServer(pageDate)
        }
    );
    if (false === row) return;
    // Refresh personID
    personIdNode.value = row.personID;
};

function startingUpload (ev) {
    status.uploadID = ev.id;
    var uploadButton = document.getElementById('uploader-attachment-button');
    var form = document.getElementById('uploader');
    
    // XXX We need to be a bunch more clever here.
    
    var admin = '';
    if (adminID) {
        admin = 'admin=' + adminID + '&';
    }
    form.action = '?' + admin + 'cmd=upload';


    var uploadPagedate = document.getElementById('uploader-attachment-pagedate');
    uploadPagedate.value = clientDateToServer(parseInt(pageDate,10));
    var uploadExtension = document.getElementById('uploader-attachment-extension');
    uploadExtension.value = '';
    var uploadMimeType = document.getElementById('uploader-attachment-mimetype');
    uploadMimeType.value = 'application/octet-stream';
    var uploadFilename = document.getElementById('uploader-attachment-filename');
    var fileName = uploadFilename.files[0].name;
    var m = fileName.match(/.*\.([a-zA-Z]+$)/);
    if (m) {
        // XXX Get and set the extension, if any
        uploadExtension.value = m[1].toLowerCase();
        // XXX Set the mimeType
        uploadMimeType.value = mimeTypes[m[1].toLowerCase()] ? mimeTypes[m[1].toLowerCase()] : 'application/octet-stream';
    }
};

function completedUpload (ev) {
    // Rewrite uploader node, wake up delete button
    var iframe = ev.target;
    var innerDocument = iframe.contentDocument || iframe.contentWindow.document;
    var body = innerDocument.getElementsByTagName('BODY')[0];
    console.log("returned in completedUpload(): "+body.textContent);
    var ret = JSON.parse(body.textContent)
    addAttachment(ret.documentID,ret.documentTitle);
    status.uploadID = null;
    var uploadButton = document.getElementById('uploader-attachment-button');
    uploadButton.disabled = true;
    var searchableToggle = document.getElementById('uploader-attachment-searchable');
    searchableToggle.checked = false;
};

