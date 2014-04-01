function LangEngine (document,lang) {
    if (!lang) {
        lang = 'ja';
    }
    this.lang = lang;
    this.document = document;
    this.setLanguage();
};

LangEngine.prototype.strings = {
    ja:{
        valueById:{
            "preview-button":"保存",
            "trash-button":"削除",
            "restore-button":"復帰",
            "publish-button":"出版",
            "republish-button":"再出版",
            "confirm-button":"確認"
        },
        innerHTMLbyId:{
            "time-start":"自",
            "time-end":"至",
            "label-2":"通知の項目を選択",
            "label-4":"研修会の項目を選択",
            "label-6":"ゴミ箱内の項目を選択",
            "explanation-1":"<span class='keyish'>Enter</span> か <span class='keyish'>Tab</span> でフィルドを記憶",
            "explanation-2":"<span class='buttonish'>保存</span> でコンテンツを固定",
            "label-1":"通知：",
            "label-3":"研修会：",
            "label-5":"ゴミ箱：",
            "label-7":"担当者",
            "label-8":"氏名：",
            "label-9":"連絡先：",
            "label-10":"所属：",
            "label-11":"職名：",
            "label-12":"詳細",
            "label-13":"略式題名：",
            "label-14":"前書：",
            "label-15":"本文：",
            "label-16":"添付資料",
            "label-17":"見出し：",
            "label-18":"検索可能",
            "label-19":"発表者",
            "label-20":"氏名：",
            "label-21":"連絡先：",
            "label-22":"所属：",
            "label-23":"職名：",
            "label-24":"発表会の詳細",
            "label-25":"題名："
        },
        valueByClass:{
            "i18n-value-language":"English",
            "i18n-value-clear":"空白",
            "i18n-value-edit":"編集",
            "i18n-value-insert":"差し入れ"
        },
        placeholderByClass:{
            "i18n-placeholder-search":"検索",
            "i18n-placeholder-required":"必須",
            "i18n-placeholder-optional":"任意",
            "i18n-placeholder-required-place":"場所・検索",
            "i18n-placeholder-date":"日程"
        }
    },
    en:{
        valueById:{
            "preview-button":"Save",
            "trash-button":"Trash",
            "restore-button":"Restore",
            "publish-button":"Publish",
            "republish-button":"Republish",
            "confirm-button":"Confirm"
        },
        innerHTMLbyId:{
            "time-start":"start",
            "time-end":"end",
            "label-2":"Select an announcement",
            "label-4":"Select an event",
            "label-6":"Open a trashed item",
            "explanation-1":"<span class='keyish'>Enter</span> or <span class='keyish'>Tab</span> sets a field",
            "explanation-2":"Use <span class='buttonish'>Save</span> to save page data",
            "label-1":"Announcements: ",
            "label-3":"Events: ",
            "label-5":"Trash: ",
            "label-7":"Staff",
            "label-8":"Name:",
            "label-9":"Contact:",
            "label-10":"Affiliation:",
            "label-11":"Position:",
            "label-12":"Details",
            "label-13":"Short Title:",
            "label-14":"Lede:",
            "label-15":"Description",
            "label-16":"Attachments",
            "label-17":"Title:",
            "label-18":"searchable",
            "label-19":"Presenter",
            "label-20":"Name:",
            "label-21":"Contact:",
            "label-22":"Affiliation:",
            "label-23":"Position:",
            "label-24":"Session details",
            "label-25":"Title:"
        },
        valueByClass:{
            "i18n-value-language":"日本語",
            "i18n-value-clear":"Clear",
            "i18n-value-edit":"Edit",
            "i18n-value-insert":"Insert"
        },
        placeholderByClass:{
            "i18n-placeholder-search":"Search",
            "i18n-placeholder-required":"Required",
            "i18n-placeholder-optional":"Optional",
            "i18n-placeholder-required-place":"Place (search)",
            "i18n-placeholder-date":"Date"
        }
    }
};

LangEngine.prototype.setLanguage = function () {
    var node;
    var lang = this.strings[this.lang];
    var document = this.document;
    for (var id in lang.valueById) {
        node = document.getElementById(id);
        node.setAttribute('value',lang.valueById[id]);
    }
    for (var id in lang.innerHTMLbyId) {
        node = document.getElementById(id);
        console.log("id="+id);
        node.innerHTML = lang.innerHTMLbyId[id];
    }
    for (var cls in lang.valueByClass) {
        nodes = document.getElementsByClassName(cls);
        for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
            node = nodes[i];
            node.setAttribute('value',lang.valueByClass[cls]);
        }
    }
    for (var cls in lang.placeholderByClass) {
        nodes = document.getElementsByClassName(cls);
        for (var i=0,ilen=nodes.length;i<ilen;i+=1) {
            node = nodes[i];
            node.setAttribute('placeholder',lang.placeholderByClass[cls]);
        }
    }
}

LangEngine.prototype.toggle = function () {
    if (this.lang === 'ja') {
        this.lang = 'en';
    } else {
        this.lang = 'ja';
    }
    this.setLanguage();
};
