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
                    && !params.cmd) {
                    
                    return true;
                }
                return false;
            }
        };
    }
    exports.getValidator = getValidator;
})();
