(function () {
    function getValidator (pageName,callName) {
        return function (params) {
            if (params.page === pageName
                && this.sys.validStaff(params)) {
                
                return true;
            }
            return false;
        }
    };
    exports.getValidator = getValidator;
})();
