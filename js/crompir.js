if (typeof crompir == 'undefined') crompir = {};

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
    },

    resizeImage: function (srcImg, params) {
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
        d0 = tctx.getImageData(0, 0, srcImgWidth, srcImgHeight); // source image
        d = ctx.getImageData(0, 0, newWidth, newHeight);
        var factor = srcImgWidth / newWidth;
        var d0data = d0.data;
        var ddata = d.data;

        if (factor > 1.0) {
            var aperture = factor * 0.33; // average by 3x3 pixels

            for (var j = 0; j < newHeight; j++) {
                var j0 = (j * factor);
                var j1 = j0 + factor;
                var jw = j * newWidth;

                for (var i = 0; i < newWidth; i++) {

                    var index = (jw + i) << 2; //*4
                    var r = 0.0;
                    var g = 0.0;
                    var b = 0.0;

                    var i0 = i * factor;
                    var i1 = i0 + factor;


                    var c = 0.0;

                    for (var ij = j0; ij < j1; ij += aperture) {
                        var ijj = (ij | 0) * srcImgWidth;
                        for (var ii = i0; ii < i1; ii += aperture) {

                            var index2 = (ijj + ii | 0) << 2; //*4

                            r += d0data[index2];
                            g += d0data[index2 + 1];
                            b += d0data[index2 + 2];
                            c += 1.0;
                        }
                    }
                    var ic = 1.0 / c;
                    ddata[index] = r * ic;
                    ddata[index + 1] = g * ic;
                    ddata[index + 2] = b * ic;
                    ddata[index + 3] = 255;
                }
            }

        } else if (factor < 1.0) {
            for (var j = 0; j < newHeight; j++) {
                var jw = j * newWidth;
                var jfac = j * factor;
                var j0 = jfac - 1.0;
                var j1 = jfac + 1.0;
                var cj = j * factor;

                for (var i = 0; i < newWidth; i++) {

                    var index = (jw + i) << 2; //*4
                    var r = 0.0;
                    var g = 0.0;
                    var b = 0.0;

                    var ifac = i * factor;

                    var i0 = ifac - 1.0;
                    var i1 = ifac + 1.0;

                    var ci = i * factor;


                    var c = 0;
                    for (var ii = i0; ii < i1; ii += factor) {
                        for (var ij = j0; ij < j1; ij += factor) {
                            var index2 = ((Math.floor(ij)) * srcImgWidth + Math.floor(ii)) << 2; //*4

                            var a1 = ii - ci;
                            var a2 = ij - cj;
                            var x = (a1 * a1 + a2 * a2) >> 3; // x^2
                            var k = 0.0;
                            if (x <= 0.25) {
                                k = 1.0 - 2.0 * x;
                            } else if (x <= 1.0) {
                                k = 2.0 * (x - Math.sqrt(x)) + 1.0;
                            }

                            r += d0data[index2] * k;
                            g += d0data[index2 + 1] * k;
                            b += d0data[index2 + 2] * k;
                            c += k;
                        }
                    }
                    var ic = 1.0 / c;
                    ddata[index] = r * ic;
                    ddata[index + 1] = g * ic;
                    ddata[index + 2] = b * ic;
                    ddata[index + 3] = 255;
                }
            }

        }


//    upsampling implementation


        ctx.putImageData(d, 0, 0);


        return [canvasCopy, ctx];
    }
};