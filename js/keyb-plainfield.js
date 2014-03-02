function setFieldState (node,state) {
    if (!node.value) {
        state = 'edit';
    }
    switch (state) {
    case 'view':
        node.classList.add('field-closed');
        node.classList.remove('field-open');
        break;
    case 'edit':
        node.classList.add('field-open');
        node.classList.remove('field-closed');
        break;
    default:
        //
        break;
    }
};

