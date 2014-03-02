function initializePage () {
    var nodes = document.getElementsByClassName('attachment-upload-widget');
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        var node = nodes[i];
        //var titleNodeID = 'attachment-attachment-' + node.id.split('-').slice(-1)[0];
        //var titleNode = document.getElementById(titleNodeID);
        //var titleNodeWidth = titleNode.offsetWidth;;
        //node.style.width = titleNodeWidth + 'px';
    }
    var nodes = document.getElementsByClassName('kb-tab-enter');
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        nodes[i].addEventListener('focus',fieldFocusHandler);
        nodes[i].addEventListener('keydown',keyHandlerTabPrep);
        nodes[i].onkeyup = Cowboy.throttle(250,keyHandlerTabEnter);
        nodes[i].addEventListener('blur', function(event){
            var ev = event;
            setTimeout(
                function() {
                    clearDropper(ev.target)
                },1000)});
    }
    var nodes = document.getElementsByClassName('kb-tab-only');
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        nodes[i].onfocus = fieldFocusHandler;
    }
    var hiddenIframe = document.getElementById('hidden-iframe-id');
    hiddenIframe.addEventListener('load',completedUpload);
    var testdrop = document.getElementById('convenor-name-dropdown');
    testdrop.size = 7;
};
