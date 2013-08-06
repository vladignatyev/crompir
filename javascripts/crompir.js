if (typeof crompir == 'undefined') crompir = {};

crompir.imgs = [];
crompir.workers = [];
//
//crompir.resizeImage = function (srcImg, params) {
//    var w = new Worker('javascripts/crompir_image_thread.js');
//    var dispatcher = $(this);
//    w.onmessage = function(msg) {
//        $dispatcher.trigger('complete', {'canvas': msg.data.canvas});
//    };
//    var data = {'type':'resizeImage', 'srcImg':srcImg.getImageData(0,0,srcImg.width,srcImg.height), 'params':params};
//    w.postMessage(data);
//    return this;
//};



//
//
//
//crompir.LoaderThread = function(){
//    var $dispatcher = $(this);
//
//    var w = new Worker('/javascripts/thread_loader.js');
//    this.load = function (files) {
//        w.postMessage({'type':'load', 'files':files});
//    };
//    w.onmessage = function(msg) {
//        if (msg.data.type == 'progress') {
//            $dispatcher.trigger('progress', {'count': msg.data.count, 'total': msg.data.total});
//        } else if (msg.data.type == 'complete') {
//            $dispatcher.trigger('complete', {'images': msg.data.images});
//            w.terminate();
//        }
//    };
//    return this;
//};

crompir.init = function ($el) {
    var input = $el.find('input[name=file]');
    input.bind('change', function (event) {
        var files = event.target.files;
            var w = new Worker('javascripts/crompir_image_thread.js');
        w.onmessage = function(msg){
            if (msg.type == 'progress') {
                var canvas = document.createElement("canvas");
                var ctx = canvas.getContext("2d");
                canvas.width = 100;
                canvas.height = 100;
                ctx.putImageData(msg.imgData, 0,0 );
                $('body').append(canvas);
            }
        };
        w.postMessage({'type':'loadPreviews','fileObjs':files });
//        var loader = new crompir.Loader();
//        $(loader).bind('progress', function (e, data) {
//            console.log(data);
//        });
//        $(loader).bind('complete', function (e, data) {
//            console.log(data);
//            for (var i = 0; i < data.images.length; i++) {
//                var imgPromise = crompir.resizeImage(data.images[i], {'newHeight': 200});
//                $(imgPromise).bind('complete',function(e, data){
//                    $('body').append(data['canvas']);
//                });
//            }
//
//        });
//        loader.load(files);
    });
};
