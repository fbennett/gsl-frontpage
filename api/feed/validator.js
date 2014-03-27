(function () {
    function getValidator (pageName,callName) {
        return function (params) {
            if (this.sys.validAdmin(params)
                && params.page === pageName
                && !params.cmd) {
                
                return true;
            }
            return false;
        }
    };
    exports.getValidator = getValidator;
})();
