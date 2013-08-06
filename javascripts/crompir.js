if (typeof crompir == 'undefined') crompir = {};


crompir.init = function ($el) {
    var $this = this;
    this.handleFiles = function (event) {
        var fileObjs = event.target.files;
        var loader = Loader();
        loader.load(fileObjs);
    };

    return this;
};
