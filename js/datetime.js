/*
 * Parsing utilities
 */
function extractDate(str) {
    var ret = {};
    var m = str.match(/^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})$/);
    ret.year = parseInt(m[1],10);
    ret.month = (parseInt(m[2],10)-1);
    ret.day = parseInt(m[3],10);
    return ret;
};

function extractTime(str) {
    var ret = {};
    var m = str.match(/^([0-9]+):([0-9]+)$/);
    ret.hour = m[1];
    ret.minute = m[2];
    return ret;
};

function extractTimeFromIndex(idx) {
    var ret = {};
    ret.hour = Math.floor(((idx-1)/4)+8);
    ret.minute = (((idx-1)%4)*15);
    return ret;
};

function inferUiDate (jsEpoch) {
    var jsDate = new Date(jsEpoch);
    return (jsDate.getFullYear() + '-' + (jsDate.getMonth()+1) + '-' + jsDate.getDate());
};

function inferUiTimeIndex (jsEpoch) {
    // Set from JST
    jsEpoch = jsEpoch + 32400000;
    var jsDate = new Date(jsEpoch);
    // Not actually UTC, but same difference
    var hours = jsDate.getUTCHours();
    var minutes = jsDate.getUTCMinutes();
    // Why the offset of one unit here? I guess selectedIndex starts from 1?
    var timeIndex = ((((hours - 8) * 60) + minutes)/15)+1;
    return timeIndex;
};


/*
 * Convert on read from API
 */

function jsEpochFromUNIX (unixEpoch) {
    return (unixEpoch*1000);
};

function serverDateToClient (unixEpoch) {
    return jsEpochFromUNIX(unixEpoch);
};

function convertDatesToLocal(data) {
    var dateKeys = {
        touchDate:true,
        uploadDate:true,
        startDateTime:true,
        endDateTime:true,
        pageDate:true
    }
    for (var key in data) {
        if (dateKeys[key] && data[key]) {
            data[key] = serverDateToClient(data[key]);
        }
    }
};

function convertAllDatesToLocal(data) {
    convertDatesToLocal(data);
    var segments = ['attachments','sessions'];
    for (var i=0,ilen=segments.length;i<ilen;i+=1) {
        var segment = segments[i];
        if (data[segment] && data[segment].length) {
            for (var j=0,jlen=data[segment].length;j<jlen;j+=1) {
                var obj = data[segment][j];
                convertDatesToLocal(obj);
            }
        }
    }
    
};

/*
 * Convert for write to API
 */

function unixEpochFromJS (jsEpoch) {
    return (jsEpoch/1000);
};

function clientDateToServer (jsEpoch) {
    return unixEpochFromJS(jsEpoch);
};

function convertDatesToRemote(data) {
    var dateKeys = {
        touchDate:true,
        uploadDate:true,
        startDateTime:true,
        endDateTime:true,
        pageDate:true
    }
    for (var key in data) {
        if (dateKeys[key] && data[key]) {
            data[key] = clientDateToServer(data[key]);
        }
    }
};

function convertAllDatesToRemote(data) {
    convertDatesToRemote(data);
    var segments = ['attachments','sessions'];
    for (var i=0,ilen=segments.length;i<ilen;i+=1) {
        var segment = segments[i];
        if (data[segment] && data[segment].length) {
            for (var j=0,jlen=data[segment].length;j<jlen;j+=1) {
                var obj = data[segment][j];
                convertDatesToRemote(obj);
            }
        }
    }
    
};



/*
 * Apply time adjustment (so that times chosen in UI
 * when outside JST are registered as JST times).
 */

function jstShift (date) {
    var relativeOffset = (date.getTimezoneOffset() * 60 * 1000) - (-32400000);
    var utcEpoch = date.getTime();
    return (utcEpoch - relativeOffset);
};

