function blockBlurRestore (event) {
    console.log("--> blockBlurRestore()");
    if (sameContainer(event.target,lastFocusedElement)) {
        console.log("      yes");
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
    console.log("--> unblockBlurRestore(): "+event.target.id);
    console.log("      yes");
    forField(event.target,function(field){
        field.classList.remove('block-blur-restore');
    });
};

function blurSearchDropdown (event) {
    var node = event.target;
    var id = node.id;
    var dropdown = document.getElementById(id + '-dropdown');
    dropdown.style.display = 'none';
};

function blurRestoreFromCache (event) {
    setTimeout(function(){
    console.log("--> blurRestoreFromCache()");
    //console.log("      initEvent: "+event.initEvent());
    console.log("      originalTarget: "+event.originalTarget.id);
    console.log("      target: "+event.target.id);
    //for (var key in event) {
    //    console.log("  key: "+key);
    //}
    if (event.target.classList.contains('block-blur-restore')) {
        var arg = {target:lastFocusedElement}
        unblockBlurRestore(arg);
        return;
    } else {
        var arg = {target:lastFocusedElement}
        unblockBlurRestore(arg);
    }
    console.log("      yes");
    var complete = true;
    forField(event.target,function(field){
        if (!cache[field.id]) {
            complete = false;
            return 'break';
        }
    });
    if (complete) {
        // XXX If complete in cache, just restore field content and close
        forField(event.target,function(field){
            field.value = cache[field.id];
        });
        disablePersonServants(event.target);
        disablePersonMaster(event.target);
        enableEditButton(event.target);
        enableClearButton(event.target);
    } else {
        // XXX If incomplete in cache, clear the person and set to initial mode
        forField(event.target,function(field){
            field.value = '';
        });
        disablePersonServants(event.target);
        enablePersonMaster(event.target);
        disableEditButton(event.target);
        disableClearButton(event.target);
        
    }
    },100);
};
