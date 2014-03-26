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
                            ret = this.wordwrap(data.note) + '\n\n';
                        }
                        return ret;
                    },
                    '@@DESCRIPTION@@':function(data) {
                        var ret = '';
                        if (data.description) {
                            ret = this.wordwrap(data.description);
                        }
                        return ret;
                    }
                },
                events:{
                    '@@NAME_AND_TITLE@@':function(data) {
                        var ret;
                        if (data.note) {
                            ret = this.wordwrap(data.title);
                        } else {
                            ret = data.presenterName + ': ' + data.title;
                        }
                        return ret;
                    },
                    '@@DESCRIPTION@@':function(data) {
                        var ret = '';
                        if (data.description) {
                            ret = this.wordwrap(data.description);
                        }
                        return ret;
                    },
                    '@@LEDE@@':function(data) {
                        var ret;
                        if (data.note) {
                            ret = this.markdown(data.note);
                        } else {
                            ret = this.wordwrap('We are pleased to announce a @@HOST@@presentation by @@PRESENTER_POSITION@@ @@PRESENTER_NAME@@ of @@PRESENTER_AFFILIATION@@:\n\n   @@TITLE@@');
                        }
                        return ret;
                    },
                    '@@HOST@@':function(data) {
                        var ret = '';
                        if (data.convenorAffiliation !== data.presenterAffiliation) {
                            ret = data.convenorAffiliation + ' ';
                        }
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
                        var startMinutes = this.padNumber(startTime.getMinutes(),2);
                        var startHours = startTime.getHours();
                        if (data.startDateTime !== data.endDateTime) {
                            var endTime = new Date(data.endDateTime);
                            var endMinutes = this.padNumber(endTime.getMinutes(),2);
                            var endHours = endTime.getHours();
                            ret = startHours + ':' + startMinutes + ' - ' + endHours + ':' + endMinutes;
                        } else {
                            ret = 'at ' + startHours + ':' + startMinutes;
                        }
                        return ret;
                    }
                },
                attachments:{
                    '@@HOST_NAME@@':function(data) {
                        return this.proxy_hostname;
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
                            ret = this.markdown(data.note);
                        } else {
                            ret = this.markdown('We are pleased to announce a @@HOST@@presentation by @@PRESENTER_POSITION@@ @@PRESENTER_NAME@@ of @@PRESENTER_AFFILIATION@@:\n\n> @@TITLE@@');
                        }
                        return ret;
                    },
                    '@@DESCRIPTION@@':function(data) {
                        var ret = '';
                        if (data.description) {
                            ret = this.markdown(data.description);
                        }
                        return ret;
                    },
                    '@@HOST@@':function(data) {
                        var ret = '';
                        if (data.convenorAffiliation !== data.presenterAffiliation) {
                            ret = data.convenorAffiliation + ' ';
                        }
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
                        var startMinutes = this.padNumber(startTime.getMinutes(),2);
                        var startHours = startTime.getHours();
                        if (data.startDateTime !== data.endDateTime) {
                            var endTime = new Date(data.endDateTime);
                            var endMinutes = this.padNumber(endTime.getMinutes(),2);
                            var endHours = endTime.getHours();
                            ret = startHours + ':' + startMinutes + ' - ' + endHours + ':' + endMinutes;
                        } else {
                            ret = 'at ' + startHours + ':' + startMinutes;
                        }
                        return ret;
                    }
                },
                attachments:{}
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
                            ret = this.markdown(data.note);
                        }
                        return ret;
                    },
                    '@@DESCRIPTION@@':function(data) {
                        var ret = '';
                        if (data.description) {
                            ret = this.markdown(data.description);
                        }
                        return ret;
                    }
                },
                sessions:{},
                attachments:{}
            }
        );

        pages.registerComposer(
            'Calendar',
            'ics',
            function (data) {
                return 'Events/' + data.eventID + '.ics'
            },
            {
                calendar:{
                    '@@NAME_AND_TITLE@@':function(data) {
                        return data.presenterName + ': ' + data.title;
                    }
                },
                sessions:{
                    '@@SESSION_NUMBER@@':function(data,pos) {
                        return (pos + 1);
                    },
                    '@@NOW@@':function(data) {
                        var date = new Date();
                        return this.utcCalendarDate(date);
                    },
                    '@@START_DATE_TIME@@':function(data) {
                        var date = new Date(data.startDateTime);
                        return this.utcCalendarDate(date);
                    },
                    '@@END_DATE_TIME@@':function(data) {
                        var date = new Date(data.endDateTime);
                        return this.utcCalendarDate(date);
                    },
                    '@@TITLE@@':function(data) {
                        return data.title;
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
                        ret = 'events.atom';
                    } else {
                        ret = 'announcements.atom';
                    }
                }
                return ret;
            },
            {
                feed:{
                    '@@SEGMENT@@':function(data) {
                        var ret = 'index'
                        if (data.length) {
                            if (data[0].presenterName) {
                                ret = 'events';
                            } else {
                                ret = 'announcements';
                            }
                        }
                        return ret;
                    },
                    '@@NOW@@':function(data) {
                        var date = new Date();
                        return this.utcFeedDate(date);
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
                    '@@NAME_AND_TITLE@@':function(data) {
                        return data.presenterName + ': ' + data.title;
                    },
                    '@@TOUCH_DATE@@':function(data) {
                        var date = new Date(data.touchDate);
                        return this.utcFeedDate(date);
                    },
                    '@@LEDE@@':function(data) {
                        var ret;
                        if (data.note) {
                            ret = this.markdown(data.note);
                        } else {
                            ret = this.markdown('We are pleased to announce a @@CONVENOR_AFFILIATION@@presentation by @@PRESENTER_POSITION@@ @@PRESENTER_NAME@@ of @@PRESENTER_AFFILIATION@@:\n\n> @@TITLE@@.');
                        }
                        return ret;
                    },
                    '@@DESCRIPTION@@':function(data) {
                        var ret = '';
                        if (data.description) {
                            ret = this.markdown(data.description);
                        }
                        return ret;
                    }
                },
                announcements:{
                    '@@NAME_AND_TITLE@@':function(data) {
                        return data.title;
                    },
                    '@@TOUCH_DATE@@':function(data) {
                        var date = new Date(data.touchDate);
                        return this.utcFeedDate(date);
                    },
                    '@@NOTE@@':function(data) {
                        var ret = '';
                        if (data.note) {
                            ret = this.markdown(data.note);
                        }
                        return ret;
                    },
                    '@@DESCRIPTION@@':function(data) {
                        var ret = '';
                        if (data.description) {
                            ret = this.markdown(data.description);
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
                        var startMinutes = this.padNumber(startTime.getMinutes(),2);
                        var startHours = startTime.getHours();
                        if (data.startDateTime !== data.endDateTime) {
                            var endTime = new Date(data.endDateTime);
                            var endMinutes = this.padNumber(endTime.getMinutes(),2);
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
