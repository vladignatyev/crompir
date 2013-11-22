$( document ).ready(function() {
    $('#images').on('mouseenter', '.image_block', function() {
        $(this).find('.image_save_button').removeClass('h');
    });
    $('#images').on('mouseleave', '.image_block', function() {
        $(this).find('.image_save_button').addClass('h');
    });
    $('#images').on('click', '.image_save_button', function() {
        alert('TODO сохранить данную картинку');
    });
});

function createImage(image) {
    var div = $('<div class="image_block">');
    $('.images').append(div);
    $(div).append(image);
    $(div).append($('<div class="image_save_button h">').text('S'));
}

function setScale(value) {
    $('.image_block').css({
        'height': value,
        'line-height': value + 'px',
        'width': value,
    });
}