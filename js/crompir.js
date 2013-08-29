if (typeof crompir == 'undefined') crompir = {};

crompir.resizeImage = function (srcImg, params) {
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

    var canvasCopy = document.createElement("canvas");
    var ctx = canvasCopy.getContext("2d");
    canvasCopy.width = newWidth;
    canvasCopy.height = newHeight;
    ctx.drawImage(srcImg, 0, 0, newWidth, newHeight);
    return [canvasCopy, ctx];
};

crompir.processing = {
    brightness: function (r, g, b) {
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    },
    kernelFilter: function (imageData, resultData, width, height, kernel, kernelSize, kernelCenter) {
        /*
         * [1 2 1
         *  2 4 2
         *  1 2 1]
         * */

        var normalizeCoefficient = 0;
        var i = kernel.length;
        while (i--) normalizeCoefficient += kernel[i];
        normalizeCoefficient = 1 / normalizeCoefficient;

        var d = imageData.data;
        var newd = resultData.data;
        for (var r = 0; r < height; r++) {
            for (var p = 0; p < width; p++) {

                //filter totals
                var Rt = 0;
                var Gt = 0;
                var Bt = 0;

                var index2 = (r * width + p) << 2; //*4

                for (var kr = 0; kr < kernelSize; kr++) {
                    for (var kp = 0; kp < kernelSize; kp++) {
                        var pp = p + kp - kernelCenter - 1; // -1 to center kernel
                        var rr = r + kr - kernelCenter - 1;
                        if (rr >= height) rr = height - 1;
                        else if (rr < 0) rr = 0;
                        if (pp >= width) pp = width - 1;
                        else if (pp < 0) pp = 0;

                        var index = (rr * width + pp) << 2; // *4
                        var kindex = kr * kernelSize + kp;

                        Rt += d[index] * kernel[kindex];
                        Gt += d[index + 1] * kernel[kindex];
                        Bt += d[index + 2] * kernel[kindex];

                    }
                }

                newd[index2] = Rt * normalizeCoefficient;
                newd[index2 + 1] = Gt * normalizeCoefficient;
                newd[index2 + 2] = Bt * normalizeCoefficient;
                newd[index2 + 3] = 255;
            }
        }
    }
};

crompir.resizeImage2 = function (srcImg, params) {
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
        throw "Improper call to crompir.resizeImage2";
    }

    var tmpCanvas = document.createElement("canvas");
    var tctx = tmpCanvas.getContext("2d");
    tmpCanvas.width = srcImgWidth;
    tmpCanvas.height = srcImgHeight;
    tctx.drawImage(srcImg, 0, 0, srcImgWidth, srcImgHeight);

    var canvasCopy = document.createElement("canvas");
    var ctx = canvasCopy.getContext("2d");
    canvasCopy.width = newWidth;
    canvasCopy.height = newHeight;
//    ctx.drawImage(srcImg, 0.002, 0.002, newWidth, newHeight);

    // do antialiasing
//
    d0 = tctx.getImageData(0,0,srcImgWidth, srcImgHeight );

    var factor = srcImgWidth / newWidth;

    d = ctx.getImageData(0, 0, newWidth, newHeight);
    for (var i = 0; i < newWidth; i++) {
        for (var j = 0; j < newHeight; j++) {
            var index = (j * newWidth + i) << 2; //*4
            var r = 0.0;
            var g = 0.0;
            var b = 0.0;

            var i0 = (i * factor);
            var i1 = ((i+1)*factor) ;
            var j0 = (j * factor) ;
            var j1 = ((j+1)*factor) ;

            for (var ii = i0; ii < i1; ii+=1) {
             for (var ij = j0; ij < j1; ij+=1) {
               var index2 = ((Math.floor(ij)) * srcImgWidth + ii >> 0) << 2; //*4
                 r += d0.data[index2];
                 g += d0.data[index2+1];
                 b += d0.data[index2+2];
            }
            }
            d.data[index] = r / factor / factor;
            d.data[index+1] = g / factor / factor;
            d.data[index+2] = b / factor / factor;
            d.data[index+3] = 255;
        }
    }
//
//    var s = 1;

//    var resultData = ctx.createImageData(newWidth, newHeight);

//    crompir.processing.kernelFilter(d, resultData, newWidth, newHeight,
////        [
////            0.1,0.1,0.1,0.1,0.1,
////            0.1,1.3,1.3,1.3,0.1,
////            0.1,1.3,3.7,1.3,0.1,
////            0.1,1.3,1.3,1.3,0.1,
////            0.1,0.1,0.1,0.1,0.1
////
////        ]
//        [
//            1.3,1.3,1.3,
//            1.3,3.7,1.3,
//            1.3,1.3,1.3
//
//        ]
//        , 3, 1);


    ctx.putImageData(d, 0, 0);


    return [canvasCopy, ctx];
};