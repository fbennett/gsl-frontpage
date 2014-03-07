function savePersonFields (node) {
    var fields = {};
    forField(node,function(field){
        // Save individual fields here
        var fieldName = field.id.split('-')[1];
        fields[fieldName] = field.value;
        cache[field.id] = field.value;
    });
    // API call
};
