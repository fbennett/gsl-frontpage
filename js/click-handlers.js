function getClickDropdown (fieldID) {
    var fieldNode = document.getElementById(fieldID);
    if (fieldID.split('-')[1] === 'name') {
        return function (event) {
            namePull(fieldNode,event.target.value);
            var dropdown = document.getElementById(fieldID + '-dropdown');
            dropdown.classList.remove('block-dropper-blur');
            enableClearButton(fieldNode);
            moveFocusForward(fieldNode);
            dropdown.style.display = 'none';
        };
    } else if (fieldID.split('-')[1] === 'attachment') {
        console.log("Setting attachment click handler, I guess");
        return function (event) {
            console.log("attachment dropdown: click event");
            attachmentPull(fieldNode,event.target.value);
        }
    } else if (fieldID.split('-')[1] === 'place') {
        return function (event) {
            placePull(fieldNode,event.target.textContent);
        }
    } else {
        return function (event) {
            fieldNode.value = event.target.textContent;

            console.log("RUNNING else branch function in getClickDropdown");
            setServantFields(fieldNode);

            var dropdown = document.getElementById(fieldID + '-dropdown');
            dropdown.classList.remove('block-dropper-blur');
            enableClearButton(fieldNode);
            moveFocusForward(fieldNode);
            dropdown.style.display = 'none';
        };
    }
};

function setAddButtonState (node,action) {
    var addButton = document.getElementById('session-add-button');
    if (checkSessionFieldValues(node)) {
        console.log("ENABLING");
        addButton.disabled = false;
        addButton.focus();
    } else {
        console.log("DISABLING");
        moveFocusForward(node,action);
        addButton.disabled = true;
    }
};

function eventTitleClick (event) {
    event.target.classList.remove('has-content');
};
