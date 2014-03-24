(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;
        var eventID = params.eventid;

        var pages = sys.pages;

        function sendPage (response,data) {
            var page;
            sys.convertAllDates(data,sys.getJsEpoch);

            if (data.presenterName) {
                page = pages.composePreview(data,'events');
            } else {
                page = pages.composePreview(data,'events');
            }
            pages.setPreviewVirtual('@@MESSAGE@@',function() {
                return page;
            });
            page = pages.composePreview({});

            response.writeHead(200, {'Content-Type': 'text/html'});
            response.end(page)
        };

        sys.getEventData(response,eventID,sendPage);

    }
    exports.cogClass = cogClass;
})();
