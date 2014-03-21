var status = {
    sent:false,
    reviewed:false,
    uploadID:null,
    attachments:{}
}

var lastFocusNode = null;

var keyboardSearchTimeout = null;

function updateMenuList(type,selectedId) {
    var selectedId = document.getElementById('event-id').value;
    if (selectedId) {
        selectedId = parseInt(selectedId,10);
    } else {
        selectedId = 0;
    }
    var adminID = getParameterByName('admin');
    var pageName = getParameterByName('page');
    if (!pageName) {
        pageName = 'top';
    }
    var rows = apiRequest(
        '/?admin='
            + adminID
            + '&page=' + pageName
            + '&cmd=get' + type + 'list'
    );
    if (false === rows) return;
    var node = document.getElementById(type + '-list');
    node.removeEventListener('change',getPageContent);
    for (var i=1,ilen=node.childNodes.length;i<ilen;i+=1) {
        node.removeChild(node.childNodes[1]);
    };
    var selectedIndex = 0;
    for (var i=0,ilen=rows.length;i<ilen;i+=1) {
        var row = rows[i];
        var option = document.createElement('option');
        option.value = row.eventID;
        option.innerHTML = row.title;
        node.appendChild(option);
        if (option.value == selectedId) {
            selectedIndex = (i+1);
        }
    };
    node.selectedIndex = selectedIndex;
    node.addEventListener('change',getPageContent);
};

function SmartId (str) {
    var m = str.match(/^([-a-z]+)([0-9]+)(.*)$/);
    this.num = m[2];
    this.id = m[1] + m[3];
};

function keyboardSearchThrottle (delay,callback) {
    return function (event) {
        if (keyboardSearchTimeout) {
            clearTimeout(keyboardSearchTimeout);
        }
        keyboardSearchTimeout = setTimeout(function() {
            callback(event);
        },delay);
    }
};

var mimeTypes = {
    txt: 'text/plain',
    doc: 'application/word',
    pdf: 'application/pdf'
}

function setFileExtension (node) {
    var uploadButton = document.getElementById('uploader-attachment-button');
    uploadButton.disabled = false;
    return;
};

function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    var ret = match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    if (name === 'page' || !ret) {
        ret = 'top';
    }
    return ret;
}

function fixPath (path) {
    var match = RegExp('https?://[^/]*/(.*?)([?#]|$)').exec(window.location.href);
    // If a stub exists, assume secure operation, so:
    var stub =  match && match[1];
    if (stub) {
        //   (1) remove &admin= value from URL
        path = path.replace(/(\?)(?:admin=[^&]*)*(.*?)(?:&admin=[^&]*)*/,'$1$2');
        //   (2) if URL begins with '/?', append stub to '/'
        path = path.replace(/^(\/)(\?)/, '$1' + stub + '$2');
        //   (3) remove any port designation from URL
        path = path.replace(/(https?:\/\/[^\/]*):[0-9]+/, '$1');
    }
    return path;
}

function apiRequest (url, obj, returnAsString) {
    url = fixPath(url);
    if ("object" === typeof obj) {
        obj = JSON.stringify(obj);
    } else if (!obj) {
        obj = null;
    }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, false);
    xhr.setRequestHeader("Content-type","application/json");
    xhr.send(obj);
    if (200 != xhr.status) {
        return false;
    }
    if (xhr.getResponseHeader('content-type') === 'text/html') {
        document = xhr.responseXML;
    }
    var ret = xhr.responseText;
    if (!returnAsString) {
        ret = JSON.parse(ret);
    }
    return ret;
}

function markdown (txt) {
    if (!txt) return '<p>&nbsp;</p>';
    txt = txt.replace(/(:-?\))/g,'(\u0298\u203f\u0298)');
    txt = txt.replace(/(:-\/)/g,'_(\u0361\u0e4f\u032f\u0361\u0e4f)_');
    txt = txt.replace(/\(\(([a-zA-Z1-9])\)\)/g, function (aChar) {
        var c, val, offset;
        if (aChar[2].match(/[a-z]/)) {
            val = (aChar.charCodeAt(2) - 97)
            offset = 9424;
        } else if (aChar[2].match(/[A-Z]/)) {
            val = (aChar.charCodeAt(2) - 65)
            offset = 9398;
        } else {
            val = (aChar.charCodeAt(2) - 49)
            offset = 9312;
        }
        return String.fromCharCode(val + offset);
    });
    return marked.parse(txt);
}

// From http://stackoverflow.com/questions/4068373/center-a-popup-window-on-screen
function popupCenter(url, title, w, h) {
    // Fixes dual-screen position                         Most browsers      Firefox
    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

    width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 2) - (h / 2)) + dualScreenTop;
    var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

    // Puts focus on the newWindow
    if (window.focus) {
        console.log("FOCUS");
        newWindow.focus();
    }
}