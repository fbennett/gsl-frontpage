function keyPersonMasterTab(event) {
    if (['Tab','Down','Esc'].indexOf(event.key) > -1) {
        event.preventDefault();
        keyPersonMasterEnter(event, event.key);
    }
};

function keyPersonMasterEnter(event, fromKeyDown) {
    if (fromKeyDown) {
        event.preventDefault();
    }
    if (event.target.classList.contains('block-sayt')) {
        event.target.classList.remove('block-sayt');
        return;
    }
    if (event.key === 'Enter' || fromKeyDown === 'Tab') {
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
    } else if (fromKeyDown === 'Down') {
        var dropper = getDropper(event.target);
        if (dropper.childNodes.length) {
            event.target.classList.remove('block-sayt');
            event.target.classList.add('block-sayt');
            event.target.classList.remove('block-dropper-blur');
            event.target.classList.add('block-dropper-blur');
            event.target.classList.remove('block-blur-restore');
            event.target.classList.add('block-blur-restore');
            dropper.selectedIndex = 0;
            dropper.focus();
        }
    } else {
        // Expose search lister with updated field value, call API, and populate list
        var adminID = getParameterByName('admin');
        var pageName = getParameterByName('page');
        if (!pageName) {
            pageName = 'top';
        }
        
        var rows = apiRequest(
            '/?admin='
                + adminID
                + '&page=' + pageName
                + '&cmd=searchpersons'
            , {
                str:event.target.value.toLowerCase()
            }
        );
        if (false === rows) return;

        var dropper = getDropper(event.target);
        for (i=0,ilen=dropper.childNodes.length;i<ilen;i+=1) {
            dropper.removeChild(dropper.childNodes[0]);
        }

        for (var i=0,ilen=rows.length;i<ilen;i+=1) {
            var option = document.createElement('option');
            option.innerHTML = rows[i].person;
            console.log("SET PERSONS");
            option.value = rows[i].personID;
            dropper.appendChild(option);
        }
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

function keyPersonMasterDropdown(event) {
    console.log("eventKey: "+event.key);
    if (event.key === 'Enter') {
        console.log('Set person fields!');
    } else if ((event.key === 'Up' && event.target.selectedIndex === 0) || event.key === 'Esc') {
        blurSelectedSearchDropdown(event);
    }
};
