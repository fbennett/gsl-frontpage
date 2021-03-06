function soloFieldBlur(event) {
    event.target.classList.remove('field-closed');
    event.target.classList.add('field-closed');
    event.target.value = cache[event.target.id];
};

function blockBlurRestore (event) {
    if (sameContainer(event.target,lastFocusedElement)) {
        forField(event.target,function(field){
            field.classList.remove('block-blur-restore');
            field.classList.add('block-blur-restore');
        });
        setTimeout(function(){
            var arg = {target:lastFocusedElement}
            unblockBlurRestore(arg);
        },200);
    }
};

function unblockBlurRestore (event) {
    forField(event.target,function(field){
        field.classList.remove('block-blur-restore');
    });
};

function blurSearchDropdown (event) {
    if (event.target.classList.contains('block-dropper-blur')) {
        event.target.classList.remove('block-dropper-blur');
        return;
    }
    setTimeout(function(){
        var node = event.target;
        var id = node.id;
        var dropdown = document.getElementById(id + '-dropdown');
        dropdown.style.display = 'none';
    },200);
};

// DECOMMISSIONED
// This attempt at an "undo" interface was cumbersome and annoying
function blurEventFieldRestoreFromCache (event) {
    setTimeout(function(){
        if (cache[event.target.id]) {
            event.target.value = cache[event.target.id];
            event.target.classList.remove('has-content');
            event.target.classList.add('has-content');
        } else {
            event.target.value = "";
            event.target.classList.remove('has-content');
        }
    },100);
};

function blurEventFieldOptional (event) {
    setTimeout(function(){
        if (event.target.value) {
            event.target.classList.remove('has-content');
            event.target.classList.add('has-content');
        } else {
            event.target.classList.remove('has-content');
        }
    },100);
};

function blurRestoreFromCache (event) {
    setTimeout(function(){
        if (event.target.classList.contains('block-blur-restore')) {
            var arg = {target:lastFocusedElement}
            unblockBlurRestore(arg);
            return;
        } else {
            var arg = {target:lastFocusedElement}
            unblockBlurRestore(arg);
        }
        var complete = true;
        forField(event.target,function(field){
            if (!cache[field.id]) {
                complete = false;
                return 'break';
            }
        });
        var masterServant = false;
        if (event.target.classList.contains('person-servant') || event.target.classList.contains('person-master')) {
            masterServant = true;
        }
        if (complete) {
            // XXX If complete in cache, just restore field content and close
            forField(event.target,function(field){
                field.value = cache[field.id];
                if (!event.target.classList.contains('session')) {
                    field.classList.remove('has-content');
                    field.classList.add('has-content');
                }
            });
            if (masterServant) {
                disablePersonServants(event.target);
                disablePersonMaster(event.target);
                enableEditButton(event.target);
                enableClearButton(event.target);
            }
        } else {
            // XXX If incomplete in cache, clear the person and set to initial mode
            // XXX ON THE OTHER HAND, be friendly and just leave things as they are.

            //forField(event.target,function(field){
            //    field.value = '';
            //    delete cache[field.id];
            //});
            
            // 
            if (masterServant) {
                disablePersonServants(event.target);
                enablePersonMaster(event.target);
                disableEditButton(event.target);
                disableClearButton(event.target);
            }
        }
        checkFormComplete();
    },100);
};

