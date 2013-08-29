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
    brightness: function (r, g, b) { return 0.2126 * r + 0.7152 * g + 0.0722 * b; },
    kernelFilter: function (imageData, width, height, kernel, kernelSize, kernelCenter) {
        /*
        * [1 2 1
        *  2 4 2
        *  1 2 1]
        * */

        var normalizeCoefficient = 0; var i=kernel.length; while(i--) normalizeCoefficient += kernel[i];
        normalizeCoefficient = 1 / normalizeCoefficient;

         var d = imageData.data;
        for (var r = 0; r < height; r++) {
            for (var p = 0; p < width; p++) {

                //filter totals
                var Rt = 0;
                var Gt = 0;
                var Bt = 0;

                for (var kr = 0; kr < kernelSize; kr++) {
                    for (var kp = 0; kp < kernelSize; kp++) {
                        var pp = p + kp - kernelCenter; // -1 to center kernel
                        var rr = r + kr - kernelCenter;
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

                var index2 = (r * width + p) << 2; //*4

                d[index2]  = Rt * normalizeCoefficient;
                d[index2+1] = Gt * normalizeCoefficient;
                d[index2+2] = Bt * normalizeCoefficient;
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

    var canvasCopy = document.createElement("canvas");
    var ctx = canvasCopy.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    canvasCopy.width = newWidth >> 0;
    canvasCopy.height = newHeight >> 0;
    ctx.drawImage(srcImg, 0, 0, newWidth >> 0, newHeight >> 0);

    // do antialiasing
//
    d = ctx.getImageData(0,0, newWidth, newHeight);

    var s = 1;

    crompir.processing.kernelFilter(d, newWidth, newHeight,
        [
            0.5, 0.5, 0.5,
            0.5, 8.4,  0.5,
            0.5, 0.5, 0.5
        ], 3, 1);


    ctx.putImageData(d, 0, 0);



    return [canvasCopy, ctx];
};