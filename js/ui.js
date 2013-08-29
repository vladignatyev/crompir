$(document).ready(function() {
    createFishyField();
});

var config = {
    scrollbarWidth: 18,
}

var fishyImages = [
    'http://1280x800.org.ua/uploads/posts/2012-08/1344920474_8787873.jpg',
    'http://usiter.com/uploads/20120604/kotiki+22391105233.jpg',
    'http://maxismile.net/uploads/posts/2012-12/1355738182_makar_cat_by_midoricawa-d5obbn3.jpg',
    'http://maxismile.net/uploads/posts/2012-11/1353611539_cuteness_overload_by_mandated-d5lkfbg.jpg',
    'http://alloads.ru/b/kotiki.jpg',
    'http://urixblog.com/p/2013/2013.05.11_18-41-22.jpg',
    'http://wallpaper.zoda.ru/bd/2006/07/27/a7b1cb93daa48bdd8e9922a095f90ff8.jpg',
    'http://funkot.net/uploads/posts/2013-02/1361475322_rugui_kotik.jpg',
    'http://grandwallpapers.net/wallpapers/kotik-viskas/kotik-viskas_1920x1200.jpg',
    'http://www.uf9.ru/i083/1008/ca/42a8df8edb1a.jpg',
    'http://maxismile.net/uploads/posts/2012-12/1355380855_smile_by_eskimobear113-d5npn5s.jpg',
    'http://i.allday.ru/uploads/posts/2010-08/1281675611_0_2e69a_a9815830_orig.jpg',
    'http://www.ellf.ru/uploads/posts/2013-03/1364141215_4.jpg',
    'http://maxismile.net/uploads/posts/2012-12/1354621027_untitled_by_boborotenj-d5n42zw.jpg',
];

function createFishyField() {
    fishyImages = fishyImages.concat(fishyImages, fishyImages, fishyImages, fishyImages);
    $.each(fishyImages, function(index, value) {
        var html = '<div class="image_block"><img class="image" src="' + value + '" onclick="initPopup(this)"/></div>';
        $(html).appendTo($('.images'));
    });
    $('<div class="clear">').appendTo($('.images'));
}

function closePopup() {
    $('.popup_content,.popup_layout').remove();
}

function initPopup(image) {
    var html =
        '<div class="popup_layout" onclick="closePopup()"></div>' +
        '<div class="popup_content">' +
            '<img class="popup_image" src="' + $(image).prop('src') + '"/>' +
        '</div>';
    $(html).appendTo($('body'));

    $('.popup_content').css({
        'left':  ($(window).width() - $('.popup_content').width()) / 2,
        'top':  ($(window).height() - $('.popup_content').height()) / 2,
    });
}

function setScale(value) {
    $('.image_block').css({
        'height': value,
        'text-align': value,
        'width': value,
    });
}