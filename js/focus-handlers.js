function soloFieldFocus(event) {
    event.target.classList.remove('field-closed');
    cache[event.target.id] = event.target.value;
};

function focusSearchDropdown (event) {
    if (!event.target.value) {
        var dropper = getDropper(event.target);
        for (var i=0,ilen=dropper.childNodes.length;i<ilen;i+=1) {
            dropper.removeChild(dropper.childNodes[0]);
        }
    }
    var dropdown = document.getElementById(event.target.id + '-dropdown');
     dropdown.style.display = 'block';
};

function rememberFocus (event) {
    lastFocusedElement = event.target;
};
