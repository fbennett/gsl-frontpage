var datefield=document.createElement("input")
datefield.setAttribute("type", "date")
if (datefield.type!="date"){ //if browser doesn't support input type="date", load files for jQuery UI Date Picker
    document.write('<link href="css/jquery-ui.css" rel="stylesheet" type="text/css" />\n')
    document.write('<script src="js/jquery.min.js"><\/script>\n')
    document.write('<script src="js/jquery-ui.min.js"><\/script>\n')
}
 
function fixDateField (node) {
    if (datefield.type!="date"){ //if browser doesn't support input type="date", initialize date picker widget:
        jQuery(function($){ //on document.ready
            $.datepicker.setDefaults( {dateFormat:'yy-mm-dd'} )
            $('#' + node.id).datepicker();
        })
    }
}

function initDateFields () {
    var nodes = document.getElementsByClassName('date-field');
    for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
        var node = nodes[i];
        fixDateField(node);
    }
}
