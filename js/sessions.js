function buildTimes (node) {
    var timesHTML = '<option value="0">Time</option>\n';
    for (var j=8,jlen=20;j<jlen;j+=1) {
        for (var k=0,klen=60;k<klen;k+=15) {
            var time = j + ':';
            var minutes = '' + k;
            while (minutes.length < 2) {
                minutes = '0' + minutes;
            }
            time += minutes;
            var styling = ''
            if (!k) {
                styling = 'style="font-weight:bold;" '
            }
            timesHTML += '<option ' + styling + 'value="' + time + '">' + time + '</option>\n'
        }
    }
    if (node) {
        node.innerHTML = timesHTML;
    } else {
        var nodes = document.getElementsByClassName('times');
        for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
            var node = nodes[i];
            node.innerHTML = timesHTML;
        }
    }
};

function setAddButtonState (node) {
    var table = getAncestorByName(node,'TABLE');
    var addButton = table.getElementsByClassName('add-button');
    if (addButton && addButton.length) {
        addButton = addButton[0];
    } else {
        addButton = null;
    }
    if (addButton) {
        var inputs = table.getElementsByClassName('input');
        var enableAddButton = false;
        for (var i=0,ilen=inputs.length;i<ilen;i+=1) {
            var input = inputs[i];
            if (input.value && input.value != 0) {
                enableAddButton = true;
            }
        }
        if (enableAddButton) {
            addButton.disabled = false;
        } else {
            addButton.disabled = true;
        }
    }
};
