var productImages = [];
var sourceImages = [];

function saveImages() {
    var zip = new JSZip();

    //processing
    $('#status').html('Processing...');
    for (var k = 0; k < sourceImages.length; k++) {
        productImages.push(crompir.processing.resizeImage(sourceImages[k].image, {'newWidth':400.0}));
    }
    $('#status').html('');

    console.log(productImages);
    //generating archive
    for (var i = 0; i < productImages.length; i++) {
        var savable = new Image();
        savable.src = productImages[i].toDataURL('image/jpeg');
        zip.file("img"+(i+1)+".jpg", savable.src.substr(savable.src.indexOf(',')+1), {base64:true});
    }

    location.href="data:application/zip;base64," + zip.generate();
}

$(document).ready(function () {
    $('input[name=file]').bind('change', function(event){
        var loader = new crompir.PreviewLoader();
        $(loader).bind('progress', function(event, data){
            createImage(data.preview);
        });
        $(loader).bind('complete', function(event, data){
            sourceImages = data.result;
            console.log('source Imags');
            console.log(sourceImages);
            $('#save').bind('click', function(){
                saveImages();
            });
            $('#save').removeClass('_disabled');
        });
        loader.load(event.target.files);
        console.log(event.target.files);
    });
});
$('#save').click();