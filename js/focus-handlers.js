function focusSearchDropdown (event) {
    console.log("**> focusSearchDropdown(): "+event.target.id);
    var dropdown = document.getElementById(event.target.id + '-dropdown');
    dropdown.style.display = 'block';
};

function rememberFocus (event) {
    console.log("**> rememberFocus(): "+event.target.id);
    lastFocusedElement = event.target;
};
