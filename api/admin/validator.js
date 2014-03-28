(function () {
    function getValidator (pageName,callName) {
        if (callName) {
            return function (params) {
                if (this.sys.validAdmin(params)
                    && params.page === pageName
                    && params.cmd === callName) {
                    
                    return true;
                }
                return false;
            }
        } else {
            return function (params) {
                if (this.sys.validAdmin(params)
                    && params.page === pageName
                    && this.sys.validStaff(params)) {
                    
                    return true;
                }
                return false;
            }
        };
    }
    exports.getValidator = getValidator;
})();
