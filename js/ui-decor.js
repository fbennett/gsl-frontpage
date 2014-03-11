var status = {};
var cache = {};
var lastFocusedElement;

function clearPerson(event) {
    forServants(event.target,function(servant){
        servant.value = '';
        servant.disabled = true;
        servant.classList.remove('has-content');
        servant.classList.remove('block-sayt');
        cache[servant.id] = '';
    });
    disableClearButton(event.target);
    disableEditButton(event.target);
    forMaster(event.target,function(master) {
        master.value = '';
        master.disabled = false;
        master.classList.remove('has-content');
        master.classList.remove('block-sayt');
        cache[master.id] = '';
        document.getElementById(master.id + '-id').value = "";
        master.focus();
    });
};

function editPerson(event) {
    var firstServant = enablePersonServants(event.target);
    disableEditButton(event.target);
    firstServant.focus();
};

function disablePersonServants(node) {
    forServants(node,function(servant){
        servant.disabled = true;
    });
};

function disablePersonMaster(node) {
    forMaster(node,function(master){
        master.disabled = true;
    });
};

function enablePersonServants(node) {
    var firstServant = forServants(node,function(servant){
        servant.disabled = false;
        servant.classList.remove('has-content');
    });
    return firstServant;
};

function enablePersonMaster(node) {
    forMaster(node,function(master){
        master.disabled = false;
        master.classList.remove('has-content');
    });
};

function enableEditButton(node) { 
   var containerID = getContainer(node).id;
    var editButton = document.getElementById(containerID + '-edit');
    editButton.style.display = 'inline';
};

function disableEditButton(node) {
    var containerID = getContainer(node).id;
    var editButton = document.getElementById(containerID + '-edit');
    editButton.style.display = 'none';
};

function enableClearButton(node) {
    var containerID = getContainer(node).id;
    var clearButton = document.getElementById(containerID + '-clear');
    clearButton.disabled = false;
};

function disableClearButton(node) {
    var containerID = getContainer(node).id;
    var clearButton = document.getElementById(containerID + '-clear');
    clearButton.disabled = true;
};

function moveFocusForward (node) {
    var start = false;
    var inputs = document.getElementsByClassName('field');
    for (var i=0,ilen=inputs.length;i<ilen;i+=1) {
        var input = inputs[i];
        if (input.id === node.id) {
            start = true;
            continue;
        }
        if (start && !input.disabled) {
            input.focus();
            break;
        }
    }
};

function getContainer(node) {
    var containerID = node.id.split('-')[0];
    return document.getElementById(containerID);
};

function getDropper(node) {
    var container = document.getElementById(node.id + '-dropdown');
    var dropper = container.getElementsByClassName('combo')[0];
    return dropper;
};

function forServants(node,callback) {
    var container = getContainer(node);
    var servants = container.getElementsByClassName('person-servant');
    for (var i=0,ilen=servants.length;i<ilen;i+=1) {
        var servant = servants[i];
        callback(servant);
    }
    return servants[0];
};

function forMaster(node,callback) { 
    var container = getContainer(node);
    console.log('container='+container)
    console.log('container.id='+container.id)
    var master = container.getElementsByClassName('person-master')[0];
    callback(master);
};

// Loop breaks when callback returns 'break'
// Loop continues when callback returns 'continue'
function forField(node,callback) {
    var container = getContainer(node);
    var fields = container.getElementsByClassName('field');
    for (var i=0,ilen=fields.length;i<ilen;i+=1) {
        var result = callback(fields[i]);
        if (result === 'break') {
            break;
        } else if (result === 'continue') {
            continue;
        }
    }
};

function sameContainer(anode,bnode) {
    var acontainerID = getContainer(anode).id;
    var bcontainerID = getContainer(bnode).id;
    if (acontainerID === bcontainerID) {
        return true;
    } else {
        return false;
    }
};

function addAttachment (documentID, documentTitle) {
    console.log("(1)");
    // Get existing values, if any
    status.attachments = {};
    var attachmentContainer = document.getElementById('attachment-container');
    for (var i=0,ilen=attachmentContainer.childNodes.length;i<ilen;i+=1) {
        var node = attachmentContainer.childNodes[i];
        var id = node.getElementsByClassName('document-id')[0].value;
        var title = node.getElementsByClassName('document-title')[0].value;
        status.attachments[id] = title;
    }
    
    console.log("(2)");
    // Add this documentID and documentTitle to status.attachments IF it is a new one.
    if (!status.attachments[documentTitle]) {
        status.attachments[documentID] = documentTitle;
    }
    
    // 
    var attachments = [];
    for (var documentID in status.attachments) {
        attachments.push({documentID:documentID,documentTitle:status.attachments[documentID]});
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
        appendAttachmentNode(attachments[i].documentID,attachments[i].documentTitle);
    }
    
    var attachmentIdNode = document.getElementById('uploader-attachment-id');
    var attachmentTitleNode = document.getElementById('uploader-attachment');
    var attachmentUploadFilenameNode = document.getElementById('uploader-attachment-filename');

    // Clear the visible values in the uploader widget
    attachmentTitleNode.value = '';
    attachmentUploadFilenameNode.value = '';
    console.log("(5)");
};

var attachmentHtmlTemplate = '<tr>'
    + '  <td>Title:</td>'
    +'   <td class="document">'
    + '    <div>'
    + '      <input class="document-id" type="text" style="display:none;" value="@@DOCUMENT_ID@@"/>'
    + '      <input class="document-title field-closed" type="text" size="50" value="@@DOCUMENT_TITLE@@" onkeyup="updateAttachmentTitle(event)"/>'
    + '    </div>'
    + '  </td>'
    + '  <td rowspan="2">'
    + '    <input type="button" value="Delete" onclick="deleteAttachment(@@DOCUMENT_ID@@)">'
    + '  </td>'
    + '</tr>'
    + '<tr>'
    + '  <td></td>'
    + '  <td>'
    + '<div class="document-link"><a href="/attachments/@@DOCUMENT_ID@@">attachments/@@DOCUMENT_ID@@</a></div>'
    + '  </td>'
    + '</tr>';

function appendAttachmentNode(documentID,documentTitle) {
    console.log("TRY");
    var attachmentContainer = document.getElementById('attachment-container');
    console.log("(1)");
    var attachmentNode = document.createElement('table');
    console.log("(2)");
    attachmentNode.setAttribute('id', 'document-' + documentID);
    attachmentNode.classList.add('wrapper')
    console.log("(3)");
    attachmentNode.classList.add('ephemeral');
    console.log("(4)");
    attachmentNode.innerHTML = attachmentHtmlTemplate.replace(/@@DOCUMENT_ID@@/g,documentID).replace(/@@DOCUMENT_TITLE@@/,documentTitle);
    console.log("(5)");
    attachmentContainer.appendChild(attachmentNode);
    console.log("(6)");
};

function deleteAttachment(documentID) {
    var attachmentNode = document.getElementById('document-' + documentID);
    attachmentNode.parentNode.removeChild(attachmentNode);
};
