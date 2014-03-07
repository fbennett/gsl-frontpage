var cache = {};
var lastFocusedElement;

function clearPerson(event) {
    forServants(event.target,function(servant){
        servant.value = '';
        servant.disabled = true;
        cache[servant.id] = '';
    });
    disableClearButton(event.target);
    disableEditButton(event.target);
    forMaster(event.target,function(master) {
        master.value = '';
        master.disabled = false;
        cache[master.id] = '';
        master.focus();
    });
};

function editPerson(event) {
    var firstServant = forServants(event.target,function(servant){
        servant.disabled = false;
    });
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
    forServants(node,function(servant){
        servant.disabled = false;
    });
};

function enablePersonMaster(node) {
    forMaster(node,function(master){
        master.disabled = false;
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
    clearButton.style.display = 'inline';
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
