function focusSearchDropdown (event) {
    var dropdown = document.getElementById(event.target.id + '-dropdown');
    dropdown.style.display = 'block';
};

function rememberFocus (event) {
    lastFocusedElement = event.target;
};
