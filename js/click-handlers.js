function getClickDropdown (fieldID) {
    var fieldNode = document.getElementById(fieldID);
    if (fieldID.split('-')[1] === 'name') {
        return function (event) {
            var fieldName = fieldNode.id.split('-')[1];
            window[fieldName + 'Pull'](fieldNode,event.target.value);
            var dropdown = document.getElementById(fieldID + '-dropdown');
            dropdown.classList.remove('block-dropper-blur');
            enableClearButton(fieldNode);
            moveFocusForward(fieldNode);
            dropdown.style.display = 'none';
        };
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
