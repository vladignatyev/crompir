function createImage(image) {
    var div = $('<div class="image_block">');
    $('.images').append(div);
    $(div).append(image);
}

function closePopup() {
    $('.popup_content,.popup_layout').remove();
}

function setScale(value) {
    $('.image_block').css({
        'height': value,
        'line-height': value + 'px',
        'width': value,
    });
}