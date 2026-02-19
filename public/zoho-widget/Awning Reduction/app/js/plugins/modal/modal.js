
(function ($) {
    $.fn.extend({
        
        Modal: function (options) {
            console.log(options)
            var defaults = {

            };
            $('head').append('<link rel="stylesheet" type="text/css" href="./js/plugins/modal/modal.css">');
            options = $.extend(defaults, options);
            return this.each(() => {
                let tmpDiv
                tmpDiv = $(`<div class='backdrop'></div>
                <div class="modalContainer" >
                <div class="modal‌Box" id='modal‌Box'> 
                <div class='row'>
                <div class='modalCol'>
                </div>
                <div class='modalCol'>
                <div class='title'>${options.title}</div>
                </div>                       
                <div class="modalCol">
                ${options.closeButton ?  `<button class="closeButton" id="modalCloseButton">
                <img src='icons/Close.svg' />
                </button>` : ''}
                </div>
                </div>
                <div class='newCustomerModalContent'>${options.content}</div>
                </div>
                </div>`)
                return this.append(tmpDiv);
            });
        }
    });
})(jQuery);