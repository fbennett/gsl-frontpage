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
        return function (event) {
            console.log('Do attachment dropdown handler stuff');
            attachmentPull(fieldNode,event.target.value);
        }
    } else {
        return function (event) {
            fieldNode.value = event.target.textContent;

            setServantFields(fieldNode);

            var dropdown = document.getElementById(fieldID + '-dropdown');
            dropdown.classList.remove('block-dropper-blur');
            enableClearButton(fieldNode);
            moveFocusForward(fieldNode);
            dropdown.style.display = 'none';
        };
    }
};
