var Loader = function () {
    var myFiles;
    var myImages = [];
    var fileLoadingCursor;

    function updateProgress(count, imgData) {
        postMessage({'type':'progress', 'imgData':imgData, 'count':count, 'total':myFiles.length});
    }

    function statusComplete() {
        postMessage({'type':'complete', 'imgDatas':myImages});
    }

    function recursivelyLoad() {
        if (fileLoadingCursor >= myFiles.length) {
            statusComplete();
        }

        var file = myFiles[fileLoadingCursor];
        var fr = new FileReader();

        function onload() {
            var image = new Image();
            image.onload = function (event) {
                var imgData = resizeImage(image, {'newHeight': 200});
                updateProgress(++fileLoadingCursor, imgData);
                recursivelyLoad();
            };
            image.src = fr.result;
        }

        fr.onload = onload;
        fr.readAsDataURL(file);

    }

    this.load = function (files) {
        myFiles = files;
        fileLoadingCursor = 0;
        recursivelyLoad();
    };

    return this;
};


function resizeImage(srcImg, params) {
    var srcImgWidth = srcImg.width;
    var srcImgHeight = srcImg.height;
    var newWidth = -1;
    var newHeight = -1;

    if (params['newWidth']) {
        newWidth = params['newWidth'];
        if (params['newHeight']) {
            newHeight = params['newHeight'];
        } else {
            newHeight = srcImgHeight / srcImgWidth * newWidth;
        }
    } else if (params['newHeight']) {
        newHeight = params['newHeight'];
        newWidth = srcImgWidth / srcImgHeight * newHeight;
    } else if (params['scale']) {
        newWidth = srcImgWidth * params['scale'];
        newHeight = srcImgHeight * params['scale'];
    } else {
        //fail with error
        throw "Improper call to crompir.resizeImage";
    }

    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.drawImage(srcImg, 0, 0, newWidth, newHeight);
    return ctx.getImageData(0, 0, newWidth, newHeight);
}

// process handler
onmessage = function (msg) {
//    if (msg.data.type == 'resizeImage') {
//        var srcImg = msg.data.srcImg;
//        var params = msg.data.params;
//        var imgData = resizeImage(srcImg, params);
//        postMessage({'canvas': imgData});
//    }
    if (msg.data.type == 'loadPreviews') {
        var fileObjs = msg.data.fileObjs;
        var loader = Loader();
        loader.load(fileObjs);
    }
};