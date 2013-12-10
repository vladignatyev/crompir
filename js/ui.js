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
    var image_block = $('<div class="image_block">');
    $(image_block).append(image);

    var image_menu = $('<div class="image_menu">');
    $(image_block).append(image_menu);
    image_menu.append($('<div class="image_menu_item" title="Save">').text('S'));
    image_menu.append($('<div class="image_menu_item" title="Export">').text('E'));
    image_menu.append($('<div class="image_menu_item" title="Delete">').text('D'));

    $('#images').append(image_block);
}

function setScale(value) {
    $('.image_block').css({
        'height': value,
        'line-height': value + 'px',
        'width': value,
    });
}