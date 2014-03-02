function startingUpload (ev) {
    status.uploadID = ev.id;
    var uploadButton = document.getElementById('attachment-upload-button');
    var form = document.getElementById('attachment-upload-widget');
    form.action = '?admin=' + getParameterByName('admin') + '&cmd=upload';
    var uploadExtension = document.getElementById('attachment-upload-extension');
    uploadExtension.value = '';
    var uploadMimeType = document.getElementById('attachment-upload-mimetype');
    uploadMimeType.value = 'application/octet-stream';
    var uploadFilename = document.getElementById('attachment-upload-filename');
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
    var ret = JSON.parse(body.textContent)
    var tableNode = document.getElementById('wrapper-attachment-0');
    addAttachment(tableNode,ret.documentID,ret.documentTitle);
    status.uploadID = null;
};

function addAttachment (tableNode, documentID, documentTitle) {
    console.log("(1)");
    // Get existing values, if any
    status.attachments = {};
    var attachmentContainer = document.getElementById('attachment-container');
    for (var i=0,ilen=attachmentContainer.childNodes.length;i<ilen;i+=1) {
        var attachmentNode = attachmentContainer.childNodes[i];
        var fieldNode = attachmentNode.getElementsByClassName('field')[0];
        var id = fieldNode.getElementsByClassName('input-id')[0].value;
        var title = fieldNode.getElementsByClassName('input-title')[0].value;
        status.attachments[title] = id;
    }

    console.log("(2)");
    // Add this documentID and documentTitle to status.attachments IF it is a new one.
    if (!status.attachments[documentTitle]) {
        status.attachments[documentTitle] = documentID;
    }

    // 
    var attachments = [];
    for (var title in status.attachments) {
        attachments.push({documentID:status.attachments[title],documentTitle:title});
    }
    
    console.log("(3): "+JSON.stringify(attachments,null,2));
    // XXX Sort the list
    attachments.sort(
        function (a,b) {
            return a.documentTitle.localeCompare(b.documentTitle);
        }
    );

    // Clear the DOM nodes
    for (var i=0,ilen=attachmentContainer.childNodes.length;i<ilen;i+=1) {
        attachmentContainer.removeChild(attachmentContainer.childNodes[0]);
    }
    console.log("(4)");

    // Add the updated nodes
    for (var i=0,ilen=attachments.length;i<ilen;i+=1) {
        appendAttachmentNode(attachmentContainer,attachments[i].documentID,attachments[i].documentTitle);
    }


    var attachmentIdNode = document.getElementById('attachment-id-0');
    var attachmentTitleNode = document.getElementById('attachment-attachment-0');
    var attachmentUploadFilenameNode = document.getElementById('attachment-upload-filename');

    // Clear the visible values in the uploader widget
    attachmentTitleNode.value = '';
    attachmentUploadFilenameNode.value = '';
    console.log("(5)");

    // Clear the dropper
    clearDropper(attachmentTitleNode);
};

function deleteAttachment(ev) {
    var tableNode = getAncestorByName(ev.target,'TABLE');
    tableNode.parentNode.removeChild(tableNode);
};

var attachmentHtmlTemplate = '<tr>'
    + '  <td>Title:</td>'
    +'   <td class="field">'
    + '    <div>'
    + '      <input class="input-id" type="text" style="display:none;" value="@@DOCUMENT_ID@@"/>'
    + '      <input class="input-title field-closed" type="text" size="50" value="@@DOCUMENT_TITLE@@" onkeyup="keyHandlerEnterOnly(event)"/>'
    + '    </div>'
    + '  </td>'
    + '  <td rowspan="2">'
    + '    <input type="button" value="Delete" onclick="deleteAttachment(event)">'
    + '  </td>'
    + '</tr>'
    + '<tr>'
    + '  <td></td>'
    + '  <td class="field">'
    + '<div class="document-link"><a href="/attachments/@@DOCUMENT_ID@@">attachments/@@DOCUMENT_ID@@</a></div>'
    + '  </td>'
    + '</tr>';

function appendAttachmentNode(node,documentID,documentTitle) {
    var attachmentNode = document.createElement('table');
    attachmentNode.classList.add('wrapper')
    attachmentNode.classList.add('ephemeral');
    attachmentNode.innerHTML = attachmentHtmlTemplate.replace(/@@DOCUMENT_ID@@/g,documentID).replace(/@@DOCUMENT_TITLE@@/,documentTitle);
    node.appendChild(attachmentNode);
};
