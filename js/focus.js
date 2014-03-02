function fieldFocusHandler (ev) {
    if (lastFocusNode && lastFocusNode.classList.contains('input')) {
        if (lastFocusNode !== ev.target) {
            var saveLastFields = !lastFocusNode.disabled;
            if (lastFocusNode.classList.contains('kb-tab-only') || lastFocusNode.classList.contains('solo')) {
                setFieldState(lastFocusNode,'view');
                setAddButtonState (lastFocusNode);
            } else {
                var lastTable = getAncestorByName(lastFocusNode,'TABLE');
                var thisTable = getAncestorByName(ev.target,'TABLE');
                if (lastTable !== thisTable) {
                    if (lastFocusNode.classList.contains('locking')) {
                        clearDropper(lastFocusNode);
                        if (!lastFocusNode.disabled) {
                            lastFocusNode.value = null;
                        }
                    } else {
                        var emptyNode = setFieldGroupState(lastTable,'view');
                        if (emptyNode) {
                            emptyNode.focus();
                            return;
                        }
                    }
                }
            }
            if (ev.target.classList.contains('kb-tab-only') || ev.target.classList.contains('solo')) {
                setFieldState(ev.target,'edit');
            }
            if (lastFocusNode.value && saveLastFields) {
                fieldFakeBlurHandler(lastFocusNode);
            }
        }
    }
    lastFocusNode = ev.target;
};

function fieldFakeBlurHandler (node) {
    var input = null;
    if (node.classList.contains('kb-tab-enter')) {
        var hasAllValues = true;
        input = getInputNodes(node);
        for (var i=0,ilen=input.fields.length;i<ilen;i+=1) {
            if (!input.fields[i].value) {
                hasAllValues = false;
                break;
            }
        }
        if (hasAllValues) {
            console.log("  Save data ok: "+Date("now")+" "+node.id);
            var table = getAncestorByName(node,'TABLE');
            if (table.classList.contains('persons')) {
                savePersonFields(table);
            }
        }
    }
};

