(function () {
    var pagesClass = function (sys) {
        this.sys = sys;
    };
    pagesClass.prototype.getPages = function () {
        var sys = this.sys;
        var pages = new sys.pageEngine(sys);

        pages.registerComposer(
            'Preview',
            'html',
            function (data) {
                return 'preview.html'
            },
            {
                preview:{},
                announcements:{
                    '@@LEDE@@':function(data) {
                        var ret = '';
                        if (data.note) {
                            ret = this.sys.wordwrap(data.note) + '\n\n';
                        }
                        return ret;
                    },
                    '@@DESCRIPTION@@':function(data) {
                        var ret = '';
                        if (data.description) {
                            ret = this.sys.wordwrap(data.description);
                        }
                        return ret;
                    },
                    '@@CONVENOR_CONTACT@@':function(data) {
                        var ret = '';
                        if (data.convenorContact && data.convenorContact !== 'none') {
                            ret = ' on ' + data.convenorContact;
                        };
                        return ret;
                    }
                },
                events:{
                    '@@NAME_AND_TITLE@@':function(data) {
                        var ret;
                        if (data.note) {
                            ret = this.sys.wordwrap(data.title);
                        } else {
                            ret = data.presenterName + ': ' + data.title;
                        }
                        return ret;
                    },
                    '@@DESCRIPTION@@':function(data) {
                        var ret = '';
                        if (data.description) {
                            ret = this.sys.wordwrap(data.description);
                        }
                        return ret;
                    },
                    '@@LEDE@@':function(data) {
                        var ret;
                        if (data.note) {
                            ret = this.sys.wordwrap(data.note);
                        } else {
                            ret = 'We are pleased to announce a presentation by @@PRESENTER_POSITION@@ @@PRESENTER_NAME@@ of @@PRESENTER_AFFILIATION@@:';
                            ret = this.processTemplate('events',data,ret);
                            ret = this.sys.wordwrap(ret);
                            ret = ret + '\n\n   ' + this.processTemplate('events',data,'@@TITLE@@');
                        }
                        return ret;
                    },
                    '@@CONVENOR_CONTACT@@':function(data) {
                        var ret = '';
                        if (data.convenorContact && data.convenorContact !== 'none') {
                            ret = ' on ' + data.convenorContact;
                        };
                        return ret;
                    }
                },
                sessions:{
                    '@@SESSION_NUMBER@@':function (data,pos) {
                        var ret = '';
                        if (pos > -1) {
                            ret = 'Session ' + (pos+1) + ': ';
                        }
                        return ret;
                    },
                    '@@DOW@@':function(data) {
                        var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                        var date = new Date(data.startDateTime);
                        return days[date.getDay()];
                    },
                    '@@DATE@@':function(data) {
                        var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                        var date = new Date(data.startDateTime);
                        var day = date.getDate();
                        var month = months[date.getMonth()];
                        var year = date.getFullYear();
                        return day + ' ' + month + ' ' + year;
                    },
                    '@@TIME@@':function(data) {
                        var ret;
                        var startTime = new Date(data.startDateTime);
                        var startMinutes = this.sys.padNumber(startTime.getMinutes(),2);
                        var startHours = startTime.getHours();
                        if (data.startDateTime !== data.endDateTime) {
                            var endTime = new Date(data.endDateTime);
                            var endMinutes = this.sys.padNumber(endTime.getMinutes(),2);
                            var endHours = endTime.getHours();
                            ret = startHours + ':' + startMinutes + ' - ' + endHours + ':' + endMinutes;
                        } else {
                            ret = 'at ' + startHours + ':' + startMinutes;
                        }
                        return ret;
                    }
                },
                attachments:{
                    '@@HOST_PATH@@':function(data) {
                        return this.sys.urlEngine.hostpath();
                    }
                }
            }
        );
        
        pages.registerComposer(
            'Index',
            'html',
            function (data) {
                return 'index.html'
            },
            {
                index:{},
                announcements:{},
                events:{
                    '@@PAGE_DATE@@':function(data) {
                        return parseInt(data.pageDate,10);
                    },
                    '@@DATE@@':function(data) {
                        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                        var date = new Date(data.pageDate);
                        return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
                    },
                    '@@DOW@@':function(data) {
                        var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                        var date = new Date(data.pageDate);
                        return days[date.getDay()];
                    },
                    '@@NAME_AND_TITLE@@':function(data) {
                        return data.presenterName + ': ' + data.title;
                    }
                }
            }
        );

        pages.registerComposer(
            'Event',
            'html',
            function (data) {
                return 'Events/' + data.eventID + '.html'
            },
            {
                event:{
                    '@@MONTH@@':function(data) {
                        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                        var date = new Date(data.pageDate);
                        return months[date.getMonth()];
                    },
                    '@@DAY@@':function(data) {
                        var date = new Date(data.pageDate);
                        return date.getDate();
                    },
                    '@@DOW@@':function(data) {
                        var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                        var date = new Date(data.pageDate);
                        return days[date.getDay()];
                    },
                    '@@DATE@@':function(data) {
                        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                        var date = new Date(data.pageDate);
                        return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
                    },
                    '@@NAME_AND_TITLE@@':function(data) {
                        return data.presenterName + ': ' + data.title;
                    },
                    '@@LEDE@@':function(data) {
                        var ret;
                        if (data.note) {
                            ret = this.sys.markdown(data.note);
                        } else {
                            ret = this.sys.markdown('We are pleased to announce a presentation by @@PRESENTER_POSITION@@ @@PRESENTER_NAME@@ of @@PRESENTER_AFFILIATION@@:\n\n> @@TITLE@@');
                        }
                        return ret;
                    },
                    '@@DESCRIPTION@@':function(data) {
                        var ret = '';
                        if (data.description) {
                            ret = this.sys.markdown(data.description);
                        }
                        return ret;
                    },
                    '@@CONVENOR_CONTACT@@':function(data) {
                        var ret = '';
                        if (data.convenorContact && data.convenorContact !== 'none') {
                            ret = ' on ' + data.convenorContact;
                        };
                        return ret;
                    }
                },
                sessions:{
                    '@@MONTH@@':function(data) {
                        var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                        var date = new Date(data.startDateTime);
                        return months[date.getMonth()];
                    },
                    '@@DAY@@':function(data) {
                        var date = new Date(data.startDateTime);
                        return date.getDate();
                    },
                    '@@TIME@@':function(data) {
                        var ret;
                        var startTime = new Date(data.startDateTime);
                        var startMinutes = this.sys.padNumber(startTime.getMinutes(),2);
                        var startHours = startTime.getHours();
                        if (data.startDateTime !== data.endDateTime) {
                            var endTime = new Date(data.endDateTime);
                            var endMinutes = this.sys.padNumber(endTime.getMinutes(),2);
                            var endHours = endTime.getHours();
                            ret = startHours + ':' + startMinutes + ' - ' + endHours + ':' + endMinutes;
                        } else {
                            ret = 'at ' + startHours + ':' + startMinutes;
                        }
                        return ret;
                    }
                },
                attachments:{
                    '@@HOST_PATH@@':function(data) {
                        return this.sys.urlEngine.hostpath();
                    }
                }
            }
        );

        pages.registerComposer(
            'Announcement',
            'html',
            function (data) {
                return 'Announcements/' + data.eventID + '.html'
            },
            {
                announcement:{
                    '@@DOW@@':function(data) {
                        var date = new Date(data.pageDate);
                        var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                        return days[date.getDay()];
                    },
                    '@@DATE@@':function(data) {
                        var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                        var date = new Date(data.pageDate);
                        var day = date.getDate();
                        var month = months[date.getMonth()];
                        var year = date.getFullYear();
                        return day + ' ' + month + ' ' + year;
                    },
                    '@@LEDE@@':function(data) {
                        var ret = '';
                        if (data.note) {
                            ret = this.sys.markdown(data.note);
                        }
                        return ret;
                    },
                    '@@DESCRIPTION@@':function(data) {
                        var ret = '';
                        if (data.description) {
                            ret = this.sys.markdown(data.description);
                        }
                        return ret;
                    },
                    '@@CONVENOR_CONTACT@@':function(data) {
                        var ret = '';
                        if (data.convenorContact && data.convenorContact !== 'none') {
                            ret = ' on ' + data.convenorContact;
                        };
                        return ret;
                    }
                },
                sessions:{},
                attachments:{
                    '@@HOST_PATH@@':function(data) {
                        return this.sys.urlEngine.hostpath();
                    }
                }
            }
        );

        pages.registerComposer(
            'Calendar',
            'ics',
            function (data) {
                var ret;
                if (data.events) {
                    ret = 'calendar.ics';
                } else {
                    ret = 'Events/' + data.eventID + '.ics'
                }
                return ret;
            },
            {
                calendar:{
                    '@@TOUCH_DATE@@':function(data){
                        var ret = '@@TOUCH_DATE@@';
                        if (data.touchDate) {
                            var newDate = new Date(data.touchDate);
                            ret = this.sys.utcFeedDate(newDate);
                        }
                        return ret;
                    },
                    '@@NAME_AND_TITLE@@':function(data) {
                        return data.presenterName + ': ' + data.title;
                    },
                    '@@EVENTS@@':function(data) {
                        return '';
                    }
                },
                events:{
                    '@@NAME_AND_TITLE@@':function(data) {
                        return data.presenterName + ': ' + data.title;
                    }
                },
                sessions:{
                    '@@SESSION_NUMBER@@':function(data,pos) {
                        return (pos + 1);
                    },
                    '@@START_DATE_TIME@@':function(data) {
                        var date = new Date(data.startDateTime);
                        return this.sys.utcCalendarDate(date);
                    },
                    '@@END_DATE_TIME@@':function(data) {
                        var date = new Date(data.endDateTime);
                        return this.sys.utcCalendarDate(date);
                    },
                    '@@TITLE@@':function(data) {
                        return data.title;
                    },
                    '@@TARGET_HOST@@':function(data) {
                        return this.sys.urlEngine.target();
                    },
                    '@@EVENTS_RELATIVE@@':function(data) {
                        return this.sys.target_events_relative;
                    }
                },
                attachments:{}
            }
        );

        pages.registerComposer(
            'Feed',
            'atom',
            function (data) {
                var ret = 'index.atom';
                if (data.length) {
                    if (data[0].presenterName) {
                        ret = 'Events/index.atom';
                    } else {
                        ret = 'Announcements/index.atom';
                    }
                } else {
                    ret = 'index.atom';
                }
                return ret;
            },
            {
                feed:{
                    '@@ORGANIZATION_NAME@@':function(data) {
                        return this.sys.organization_name;
                    },
                    '@@ADMIN_EMAIL@@':function(data) {
                        return this.sys.admin_email;
                    },
                    '@@COPYRIGHT_NOTICE@@':function(data) {
                        return this.sys.copyright_notice;
                    },
                    '@@TOUCH_DATE@@':function(data){
                        var ret = '@@TOUCH_DATE@@';
                        if (data.touchDate) {
                            var newDate = new Date(data.touchDate);
                            ret = this.sys.utcFeedDate(newDate);
                        }
                        return ret;
                    },
                    '@@TARGET_RELATIVE@@':function(data) {
                        var ret = this.sys.urlEngine.target();
                        if (data.length) {
                            if (data[0].presenterName) {
                                ret += ('/' + this.sys.target_events_relative);
                            } else {
                                ret += ('/' + this.sys.target_announcements_relative);
                            }
                        }
                        return ret;
                    },
                    '@@SEGMENT@@':function(data) {
                        var ret = '';
                        if (data.length) {
                            if (data[0].presenterName) {
                                ret += this.sys.target_events_relative;
                            } else {
                                ret += this.sys.target_announcements_relative;
                            }
                        }
                        return ret;
                    },
                    '@@NOW@@':function(data) {
                        var date = new Date();
                        return this.sys.utcFeedDate(date);
                    },
                    '@@ENTRIES@@':function(data) {
                        return '';
                    },
                    '@@ANNOUNCEMENTS@@':function(data) {
                        return '';
                    },
                    '@@ATTACHMENTS@@':function(data) {
                        return '';
                    },
                    '@@EVENTS@@':function(data) {
                        return '';
                    }
                },
                events:{
                    '@@STAFF_NAME@@':function(data) {
                        return data.staffName;
                    },
                    '@@NAME_AND_TITLE@@':function(data) {
                        return data.presenterName + ': ' + data.title;
                    },
                    '@@LEDE@@':function(data) {
                        var ret;
                        if (data.note) {
                            ret = this.sys.markdown(data.note);
                        } else {
                            ret = this.sys.markdown('We are pleased to announce a presentation by @@PRESENTER_POSITION@@ @@PRESENTER_NAME@@ of @@PRESENTER_AFFILIATION@@:\n\n> @@TITLE@@.');
                        }
                        return ret;
                    },
                    '@@DESCRIPTION@@':function(data) {
                        var ret = '';
                        if (data.description) {
                            ret = this.sys.markdown(data.description);
                        }
                        return ret;
                    },
                    '@@LINK_URL@@':function(data) {
                        var ret;
                        if (data.published) {
                            ret = this.sys.urlEngine.target() + '/' + this.sys.target_events_relative + '/' + data.eventID + '.html';
                        } else {
                            ret = this.sys.urlEngine.page('@@USER_ID@@','@@USER_KEY@@',true) + '&amp;eventid=' + data.eventID;
                        }
                        return ret;
                    },
                    '@@TARGET_HOST_TOP@@':function(data) {
                        var ret = this.sys.urlEngine.target();
                        if (this.sys.target_top_relative) {
                            ret += ('/' + this.sys.target_top_relative);
                        }
                        return ret;
                    }
                },
                announcements:{
                    '@@STAFF_NAME@@':function(data) {
                        return data.staffName;
                    },
                    '@@NAME_AND_TITLE@@':function(data) {
                        return data.title;
                    },
                    '@@NOTE@@':function(data) {
                        var ret = '';
                        if (data.note) {
                            ret = this.sys.markdown(data.note);
                        }
                        return ret;
                    },
                    '@@DESCRIPTION@@':function(data) {
                        var ret = '';
                        if (data.description) {
                            ret = this.sys.markdown(data.description);
                        }
                        return ret;
                    },
                    '@@LINK_URL@@':function(data) {
                        var ret;
                        if (data.published) {
                            ret = this.sys.urlEngine.target() + '/' + this.sys.target_announcements_relative + '/' + data.eventID + '.html';
                        } else {
                            ret = this.sys.urlEngine.page('@@USER_ID@@','@@USER_KEY@@',true) + '&amp;eventid=' + data.eventID;
                        }
                        return ret;
                    },
                    '@@TARGET_HOST_TOP@@':function(data) {
                        var ret = this.sys.urlEngine.target();
                        if (this.sys.target_top_relative) {
                            ret += ('/' + this.sys.target_top_relative);
                        }
                        return ret;
                    }
                },
                attachments:{},
                sessions:{
                    '@@TITLE@@':function(data) {
                        var ret = data.title
                        ret = ret.replace(/&/g,'&amp;')
                            .replace(/</g,'&lt;')
                            .replace(/>/g,'&gt;')
                        return ret;
                    },
                    '@@PLACE@@':function(data) {
                        var ret = data.place
                        ret = ret.replace(/&/g,'&amp;')
                            .replace(/</g,'&lt;')
                            .replace(/>/g,'&gt;')
                        return ret;
                    },
                    '@@SESSION_NUMBER@@':function(data,pos) {
                        return (pos + 1);
                    },
                    '@@DOW@@':function(data) {
                        var date = new Date(data.startDateTime);
                        var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                        return days[date.getDay()];
                    },
                    '@@DATE@@':function(data) {
                        var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                        var date = new Date(data.startDateTime);
                        var day = date.getDate();
                        var month = months[date.getMonth()];
                        var year = date.getFullYear();
                        return day + ' ' + month + ' ' + year;
                    },
                    '@@TIME@@':function(data) {
                        var ret;
                        var startTime = new Date(data.startDateTime);
                        var startMinutes = this.sys.padNumber(startTime.getMinutes(),2);
                        var startHours = startTime.getHours();
                        if (data.startDateTime !== data.endDateTime) {
                            var endTime = new Date(data.endDateTime);
                            var endMinutes = this.sys.padNumber(endTime.getMinutes(),2);
                            var endHours = endTime.getHours();
                            ret = startHours + ':' + startMinutes + ' - ' + endHours + ':' + endMinutes;
                        } else {
                            ret = 'at ' + startHours + ':' + startMinutes;
                        }
                        return ret;
                    }
                }
            }
        );
        this.sys.pages = pages;
        return this.sys;
    };
    exports.pagesClass = pagesClass;
})();
