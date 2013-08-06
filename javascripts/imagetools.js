if (typeof crompir == 'undefined') crompir = {};
if (typeof crompir.images == 'undefined') crompir.images = {};

crompir.images.resizeImage = function (srcImg, params) {
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
    return [canvas, ctx.getImageData(0, 0, newWidth, newHeight)];
};

crompir.Loader = function (previewHeight) {
    var myFiles;
    var myImages = [];
    var fileLoadingCursor;
    var PREVIEW_HEIGHT = previewHeight || 200;

    var $this = this;

    function updateProgress(count, previewImgData, image) {
        $($this).trigger('progress',
            {'preview':previewImgData,
             'image':image,
             'count':count,
             'total':myFiles.length
            });
    }

    function statusComplete() {
        $($this).trigger('complete', {'imgDatas':myImages});
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
                var previewImgData = crompir.images.resizeImage(image, {'newHeight': PREVIEW_HEIGHT});
                myImages.push(image);
                updateProgress(++fileLoadingCursor, previewImgData, image);

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



//var fileObjs = msg.data.fileObjs;
//var loader = Loader();
//loader.load(fileObjs);
