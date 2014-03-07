function keyPersonMasterTab(event) {
    if (event.key === 'Tab') {
        event.preventDefault();
        keyPersonMasterEnter(event, true);
    }
};

function keyPersonMasterEnter(event, fromTab) {
    if (event.key === 'Enter' || fromTab) {
        event.preventDefault();
        event.target.removeEventListener('blur',blurRestoreFromCache);
        if (event.target.value) {
            // If field has content, open servants, close master, and focus first servant
            var containerID = event.target.id.split('-')[0];
            var container = document.getElementById(containerID);
            var servantNodes = container.getElementsByClassName('person-servant');
            for (var i=0,ilen=servantNodes.length;i<ilen;i+=1) {
                servantNodes[i].disabled = false;
            }
            // Enable clear button
            var clearButton = document.getElementById(containerID + '-clear');
            clearButton.disabled = false;
            moveFocusForward(event.target);
            event.target.disabled = true;
        } else {
            // Otherwise just open the next field
            moveFocusForward(event.target);
        }
        event.target.addEventListener('blur',blurRestoreFromCache);
    }
};

function keyPersonServantTab(event) {
    if (event.key === 'Tab') {
        event.preventDefault();
        keyPersonServantEnter(event, true);
    }
};

function keyPersonServantEnter(event, fromTab) {
    if (event.key === 'Enter' || fromTab) {
        event.preventDefault();
        event.target.removeEventListener('blur',blurRestoreFromCache);
        if (event.target.value) {
            // If field has content, check for completeness, save if appropriate, and focus next
            var containerID = event.target.id.split('-')[0];
            var container = document.getElementById(containerID);
            var servantNodes = container.getElementsByClassName('person-servant');
            var complete = true;
            for (var i=0,ilen=servantNodes.length;i<ilen;i+=1) {
                if (!servantNodes[i].value) {
                    complete = false;
                    break;
                }
            }
            if (complete) {
                savePersonFields(container);
                moveFocusForward(servantNodes[servantNodes.length - 1]);
                enableEditButton(container);
                disablePersonServants(container);
            } else {
                moveFocusForward(event.target);
            }
        }
        event.target.addEventListener('blur',blurRestoreFromCache);
    }
};

