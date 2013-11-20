//todo: переписать модуль так, чтобы функции можно было выполнять в web worker'ах

if (typeof crompir == 'undefined') crompir = {};
crompir.processing = {/*forward*/};

/**
 * Crompir
 * */
crompir.init = function ($el) {
    var $this = this;
    /**
     * Handler to load files chosen in files input field
     * */
    this.handleFiles = function (event) {
        var fileObjs = event.target.files;
        var loader = crompir.PreviewLoader();
        loader.load(fileObjs);
    };

    return this;
};


crompir.PreviewLoader = function (previewSize) {
    var $this = this;

    var myFiles;
    var myImages = [];
    var fileLoadingCursor;
    var PREVIEW_SIZE = previewSize || 200;

    function updateProgress(count, previewCanvas, sourceImage) {
        myImages.push({'previewImgData':previewCanvas, 'image':sourceImage});
        $($this).trigger('progress',
            {'preview':previewCanvas,
             'image':sourceImage,
             'count':count,
             'total':myFiles.length
            });
    }

    function statusComplete() {
        $($this).trigger('complete', {'result':myImages});
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
                var previewCanvas = crompir.processing.resizeImage(image, {'previewSize': PREVIEW_SIZE});

                updateProgress(++fileLoadingCursor, previewCanvas, image);
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


crompir.processing = {
    /**
     * Function to return brightness of color defined by R, G, B values [0; 1]
     * */
    brightness: function (r, g, b) {
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    },

    /**
     * Kernel filter
     *
     * @see http://en.wikipedia.org/wiki/Kernel_(image_processing)
     *
     * @param imageData ImageData instance containing source image
     * @param resultData ImageData instance which would contain output
     * @param width Width of source image
     * @param height Height of source image
     * @param kernel Convolution matrix in form of linear array
     * @param kernelSize Size of kernel matrix
     * @param kernelCenter Center point of kernel, in common approximately kernelSize / 2
     *
     * @description
     *
     * Linear blur kernel @see http://en.wikipedia.org/wiki/Kernel_(image_processing)
     *
     * linearKernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];
     *
     *
     * Sample gaussian blur kernel (@see http://en.wikipedia.org/wiki/Gaussian_blur)
     *
     * gaussianKernel = [0.00000067, 0.00002292, 0.00019117,0.00038771,0.00019117,0.00002292,0.00000067,
     *   0.00002292,0.00078634,0.00655965,0.01330373,0.00655965,0.00078633,0.00002292,
     *   0.00019117,0.00655965,0.05472157,0.11098164,0.05472157,0.00655965,0.00019117,
     *   0.00038771,0.01330373,0.11098164,0.22508352,0.11098164,0.01330373,0.00038771,
     *   0.00019117,0.00655965,0.05472157,0.11098164,0.05472157,0.00655965,0.00019117,
     *   0.00002292,0.00078633,0.00655965,0.01330373,0.00655965,0.00078633,0.00002292,
     *   0.00000067,0.00002292,0.00019117,0.00038771,0.00019117,0.00002292,0.00000067];
     *
     * */
    kernelFilter: function (imageData, resultData, width, height, kernel, kernelSize, kernelCenter) {
        var normalizeCoefficient = 0;
        var i = kernel.length;
        while (i--) normalizeCoefficient += kernel[i];
        normalizeCoefficient = 1 / normalizeCoefficient;  // calculating running total normalizing coefficient

        var d = imageData.data;  // shorthand to imageData.data
        var newd = resultData.data;  //shorthand to resultData.data

        for (var r = 0; r < height; r++) {  // iterating over rows
            for (var p = 0; p < width; p++) {  // iterating over columns of source image

                //filter totals
                var Rt = 0;
                var Gt = 0;
                var Bt = 0;

                var index2 = (r * width + p) << 2; //*4  - index of current output pixel in plain ImageData.data structure

                for (var kr = 0; kr < kernelSize; kr++) { // iterating over kernel
                    for (var kp = 0; kp < kernelSize; kp++) {
                        var pp = p + kp - kernelCenter - 1; // -1 to center kernel
                        var rr = r + kr - kernelCenter - 1;

                        // boundary condition: boundaries continued,
                        // so we just set as (x,y) of source image pixel at boundaries

                        if (rr >= height) rr = height - 1;
                        else if (rr < 0) rr = 0;
                        if (pp >= width) pp = width - 1;
                        else if (pp < 0) pp = 0;

                        var index = (rr * width + pp) << 2; // *4  index of source image's pixel
                        var kindex = kr * kernelSize + kp; // index of kernel's pixel

                        // calculating sum of running total
                        Rt += d[index] * kernel[kindex];
                        Gt += d[index + 1] * kernel[kindex];
                        Bt += d[index + 2] * kernel[kindex];

                    }
                }

                // Storing result data into output structure and normalizing color components.
                newd[index2]     = Rt * normalizeCoefficient; // red
                newd[index2 + 1] = Gt * normalizeCoefficient; // green
                newd[index2 + 2] = Bt * normalizeCoefficient; // blue
                newd[index2 + 3] = 255;                       // alpha
            }
        }
    },

    resizeImage: function (srcImg, params) {
        var srcImgWidth = srcImg.width;
        var srcImgHeight = srcImg.height;
        var newWidth = -1;
        var newHeight = -1;

        var tmpCanvasContext;
        var tmpCanvas;
        var canvasCopy;
        var canvasContext;
        var srcImageData;
        var destImageData;

        //todo: Нахуя ты расширил АПИ?!
        if (params['previewSize']) {
            var previewScale;
            if (srcImgHeight > srcImgWidth) {
                previewScale = params['previewSize'] / srcImgHeight;
            } else {
                previewScale = params['previewSize'] / srcImgWidth;
            }
            newHeight = srcImgHeight * previewScale;
            newWidth = srcImgWidth * previewScale;
        } else
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
            throw "Improper call to crompir.processing.resizeImage";
        }

        newWidth = newWidth | 0;
        newHeight = newHeight | 0;

        createSourceImage();
        createPreviewImage();

        var factor = srcImgWidth / newWidth;
        var srcImageDataArray = srcImageData.data;
        var destImageDataArray = destImageData.data;

        if (factor > 1.0) {
            factorIsBig();
        } else if (factor < 1.0) {
            factorIsSmall();
        }

        canvasContext.putImageData(destImageData, 0, 0);

        return canvasCopy;

        function createPreviewImage() {
            canvasCopy = document.createElement("canvas");
            canvasContext = canvasCopy.getContext("2d");
            canvasCopy.width = newWidth;
            canvasCopy.height = newHeight;
            canvasCopy.className = 'image';
            srcImageData = tmpCanvasContext.getImageData(0, 0, srcImgWidth, srcImgHeight); // source image
            destImageData = canvasContext.getImageData(0, 0, newWidth, newHeight);
        }

        function createSourceImage() {
            tmpCanvas = document.createElement("canvas");
            tmpCanvasContext = tmpCanvas.getContext("2d");
            tmpCanvas.width = srcImgWidth;
            tmpCanvas.height = srcImgHeight;
            tmpCanvasContext.drawImage(srcImg, 0, 0, srcImgWidth, srcImgHeight);
        }

        // if factor is small we use normal linear resampling
        function factorIsBig() {
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
                            r += srcImageDataArray[index2];
                            g += srcImageDataArray[index2 + 1];
                            b += srcImageDataArray[index2 + 2];
                            c += 1.0;
                        }
                    }
                    var ic = 1.0 / c;
                    destImageDataArray[index] = r * ic;
                    destImageDataArray[index + 1] = g * ic;
                    destImageDataArray[index + 2] = b * ic;
                    destImageDataArray[index + 3] = 255;
                }
            }
        }

        // if factor is big enlargement will be done using Magic Kernel: http://johncostella.webs.com/magic/
        function factorIsSmall() {
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
                            r += srcImageDataArray[index2] * k;
                            g += srcImageDataArray[index2 + 1] * k;
                            b += srcImageDataArray[index2 + 2] * k;
                            c += k;
                        }
                    }
                    var ic = 1.0 / c;
                    destImageDataArray[index] = r * ic;
                    destImageDataArray[index + 1] = g * ic;
                    destImageDataArray[index + 2] = b * ic;
                    destImageDataArray[index + 3] = 255;
                }
            }
        }
    }
};