(function () {
    var cogClass = function () {};
    cogClass.prototype.exec = function (params, request, response) {
        var oops = this.utils.apiError;
        var sys = this.sys;
        var eventPage = this.eventPage;
        var announcementPage = this.announcementPage;
        var sessionTemplate = this.sessionTemplate.toString();
        var attachmentTemplate = this.attachmentTemplate.toString();
        var eventID = params.eventid;

        var attachmentMap = {
            '@@TITLE@@':'title',
            '@@DOCUMENT_ID@@':'documentID',
            '@@HOST_NAME@@':'hostName'
        };

        function getAttachments (page,attachmentMap,data) {
            var substr = '';
            if (data.attachments && data.attachments.length) {
                substr = '-----------\nAttachments\n-----------\n\n'
                var port = '';
                if (!sys.proxy_hostname.match(/\./)) {
                    port = ':' + sys.real_port;
                }
                for (var i=0,ilen=data.attachments.length;i<ilen;i+=1) {
                    var attachment = data.attachments[i];
                    attachment.hostName = sys.proxy_hostname + port;
                    template = substituteStrings(attachmentTemplate,attachmentMap,attachment);
                    substr += template;
                }
            };
            return page.replace('@@ATTACHMENTS@@',substr);
        };

        var sessionMap = {
            '@@TITLE@@':'title',
            '@@PLACE@@':'place',
            '@@DOW@@':'dayOfWeek',
            '@@AT@@':'at',
            '@@DATE@@':'date',
            '@@START_TIME@@':'start',
            '@@END_TIME@@':'end',
            '@@SESSION_NUMBER@@':'sessionNumber'
        };

        function getSessions (page,sessionMap,data) {
            var substr = '';
            if (data.sessions && data.sessions.length) {
                for (var i=0,ilen=data.sessions.length;i<ilen;i+=1) {
                    var session = data.sessions[i];
                    // Session number
                    session.sessionNumber = '';
                    if (data.sessions.length > 1) {
                        session.sessionNumber = 'Session ' + (i+1) + ': ';
                    }
                    // Extract date and times
                    session.dayOfWeek = sys.inferUiDay(session.startDateTime);
                    session.date = sys.inferUiDate(session.startDateTime);
                    session.start = sys.inferUiTime(session.startDateTime);
                    session.end = '';
                    session.at = 'at ';
                    if (session.startDateTime !== session.endDateTime) {
                        session.end = ' to ' + sys.inferUiTime(session.endDateTime);
                        session.at = '';
                    }
                    template = substituteStrings(sessionTemplate,sessionMap,session);
                    substr += template;
                }
            }
            return page.replace(/@@SESSIONS@@/,substr);
        };

        var mainMap = {
            '@@NAME_AND_TITLE@@':['nameAndTitle',headLines],
            '@@TITLE@@':'title',
            '@@PRESENTER_NAME@@':'presenterName',
            '@@PRESENTER_POSITION@@':'presenterPosition',
            '@@PRESENTER_AFFILIATION@@':'presenterAffiliation',
            '@@CONVENOR_NAME@@':'convenorName',
            '@@CONVENOR_AFFILIATION@@':'convenorAffiliation',
            '@@CONVENOR_POSITION@@':'convenorPosition',
            '@@CONVENOR_CONTACT@@':'convenorContact',
            '@@DESCRIPTION@@':'description',
            '@@NOTE@@':['note',function(str){return (str + '\n\n')}]
        }

        function substituteStrings (template,keyMap,data) {
            for (var key in keyMap) {
                var dataKey = keyMap[key];
                var suffix = '';
                var strFunc = function (str) {return str};
                if ("string" !== typeof dataKey) {
                    strFunc = dataKey[1];
                    dataKey = dataKey[0];
                }
                var val = data[dataKey];
                if (!val) {
                    val = '';
                    strFunc = function (str) {return str};
                }
                var rex = new RegExp(key,'g');
                template = template.replace(rex,strFunc(val));
            }
            return template;
        };

        function headLines (str) {
            var line = strToLen("=",str.length);
            var str = line + '\n' + str + '\n' + line;
            return str;
        };

        function strToLen (str,len) {
            var newStr = str;
            while (newStr.length < len) {
                newStr += str;
            }
            return newStr;
        };

        function sendPage (response,data) {
            data.nameAndTitle = data.presenterName + ': ' + data.title;
            var page;
            if (data.presenterName) {
                page = eventPage.toString();
                page = substituteStrings(page,mainMap,data);
                page = getAttachments(page,attachmentMap,data);
                page = getSessions(page,sessionMap,data);
            } else {
                page = announcementPage.toString();
                page = substituteStrings(page,mainMap,data);
                page = getAttachments(page,attachmentMap,data);
            }
            console.log("JSON: "+JSON.stringify(data,null,2));
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.end(page)
        };

        sys.getEventData(response,eventID,sendPage);

    }
    exports.cogClass = cogClass;
})();
