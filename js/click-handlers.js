function getClickDropdown (fieldID) {
    return function (event) {
        var fieldNode = document.getElementById(fieldID);
        var fieldName = fieldNode.id.split('-')[1];
        window[fieldName + 'Pull'](fieldNode,event.target.value);
        var dropdown = document.getElementById(fieldID + '-dropdown');
        dropdown.classList.remove('block-dropper-blur');
        enableClearButton(fieldNode);
        moveFocusForward(fieldNode);
        dropdown.style.display = 'none';
    };
};
