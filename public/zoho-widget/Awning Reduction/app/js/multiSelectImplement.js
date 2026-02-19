// let MultiSelect = {
//     MultiSelectFill: function MultiSelectImplement(order) {
//         console.log(order, 'order');
//         jQuery('.multiSelect').each(function (e) {
//             let self = jQuery(this);
//             let field = self.find('.multiSelect_field');
//             // let fieldOption = field.find('option');
//             let dropdown = self.find('.multiSelect_dropdown');
//             let list = self.find('.multiSelect_list');
//             let option = self.find('.multiSelect_option');
//             // let optionText = self.find('.multiSelect_text');

//             dropdown.attr('data-multiple', 'true');
//             list.css('top', dropdown.height() + 5);
//             order.Awning_Coversheet_Picklist.length > 0 && order.Awning_Coversheet_Picklist.forEach(item => {
//                 self.addClass('-selected');
//                 field.find('option:contains(' + item + ')').prop('selected', true);
//                 list.find('.multiSelect_option:contains(' + item + ')').addClass('-selected');
//                 list.css('top', dropdown.height() + 5).find('.multiSelect_noselections').remove();
//                 if (dropdown.children(':visible').length === 0) {
//                     dropdown.removeClass('-hasValue');
//                 }
//                 dropdown.append(function (e) {
//                     return jQuery('<span class="multiSelect_choice">' + item + '<img id="tagCloseButton" src="./img/Close.svg"/></span>').click(function (e) {
//                         let self = jQuery(this);
//                         e.stopPropagation();
//                         self.remove();
//                         list.find('.multiSelect_option:contains(' + item + ')').removeClass('-selected');
//                         list.css('top', dropdown.height() + 5).find('.multiSelect_noselections').remove();
//                         field.find('option:contains(' + item + ')').prop('selected', false);
//                         if (dropdown.children(':visible').length === 0) {
//                             dropdown.removeClass('-hasValue');
//                         }
//                     });

//                 }).addClass('-hasValue');
//                 $('#multiSelectWrapper').css('height', (Math.ceil($('.multiSelect_dropdown').height()) + 100) + "px")
//                 list.css('top', dropdown.height() + 5);
//                 if (!option.not('.-selected').length) {
//                     list.append('<h5 class="multiSelect_noselections">No Selections</h5>');
//                 }
//             });
//         })
//     },
//     MultiSelectHandler:      //multiselect
//         function MultiSelectHandler() {
//             jQuery('.multiSelect').each(function (e) {
//                 let self = jQuery(this);
//                 let field = self.find('.multiSelect_field');
//                 let fieldOption = field.find('option');
//                 console.log(fieldOption, 'option');

//                 field.hide().after(`<div class="multiSelect_dropdown"></div>
//                     <ul class="multiSelect_list"></ul>
//                     <span class="multiSelect_arrow"></span>`);

//                 fieldOption.each(function (e) {
//                     $('.multiSelect_list').append(`<li class="multiSelect_option" data-value="` + jQuery(this).val() + `">
//                                         <a class="multiSelect_text">`+ jQuery(this).text() + `</a>
//                                       </li>`);
//                 });

//                 var dropdown = self.find('.multiSelect_dropdown');
//                 var list = self.find('.multiSelect_list');
//                 var option = self.find('.multiSelect_option');
//                 var optionText = self.find('.multiSelect_text');

//                 dropdown.attr('data-multiple', 'true');
//                 list.css('top', dropdown.height() + 5);

//                 option.click(function (e) {
//                     console.log($('.multiSelect_dropdown').height(), 'heighttt');
//                     var self = jQuery(this);
//                     e.stopPropagation();
//                     self.addClass('-selected');
//                     field.find('option:contains(' + self.children().text() + ')').prop('selected', true);
//                     $('#multiSelectWrapper').css('height', (Math.ceil($('.multiSelect_dropdown').height() + 100)) + "px")
//                     dropdown.append(function (e) {
//                         return jQuery('<span class="multiSelect_choice">' + self.children().text() + '<img  id="tagCloseButton" src="./img/Close.svg"/></span>').click(function (e) {
//                             var self = jQuery(this);
//                             e.stopPropagation();
//                             self.remove();
//                             list.find('.multiSelect_option:contains(' + self.text() + ')').removeClass('-selected');
//                             list.css('top', dropdown.height() + 5).find('.multiSelect_noselections').remove();
//                             field.find('option:contains(' + self.text() + ')').prop('selected', false);
//                             if (dropdown.children(':visible').length === 0) {
//                                 dropdown.removeClass('-hasValue');
//                             }
//                             // $('#multiSelectWrapper').css('height', (Math.ceil($('.multiSelect_dropdown').height()))+"px" )
//                         });
//                     }).addClass('-hasValue');
//                     list.css('top', dropdown.height() + 5);
//                     if (!option.not('.-selected').length) {
//                         list.append('<h5 class="multiSelect_noselections">No Selections</h5>');
//                     }
//                 });

//                 dropdown.click(function (e) {
//                     e.stopPropagation();
//                     e.preventDefault();
//                     dropdown.toggleClass('-open');
//                     list.toggleClass('-open').scrollTop(0).css('top', dropdown.height() + 5);
//                 });

//                 jQuery(document).on('click touch', function (e) {
//                     if (dropdown.hasClass('-open')) {
//                         dropdown.toggleClass('-open');
//                         list.removeClass('-open');
//                     }
//                 });
//             });
//         },

//     SelectedList: function SelectedList() {
//         let selectedArray = []
//         jQuery('.multiSelect').each(function (e) {
//             var self = jQuery(this);
//             var field = self.find('.multiSelect_choice');
//             let i
//             for (i = 0; i < field.length; i++) {
//                 selectedArray.push(field[i].innerText)
//             }
//         })
//         return selectedArray
//     }

// }

let MultiSelect = {
    MultiSelectFill: function MultiSelectImplement(picklist, id) {
        $('#' + id).each(function (e) {
            let self = jQuery(this);
            let field = self.find(`#${id}MultiSelectx`);
            let fieldOption = field.find('option');
            field.hide().after(`<div class="multiSelect_dropdown"></div>
            <ul class="multiSelect_list" id='${id}MultiSelectList'></ul>
            <span class="multiSelect_arrow"></span>`);
            fieldOption.each(function (e) {
                $('#' + id + 'MultiSelectList').append(`<li class="multiSelect_option" data-value="` + jQuery(this).val() + `">
                <a class="multiSelect_text">`+ jQuery(this).text() + `</a>
            </li>`);
            });
            let dropdown = self.find('.multiSelect_dropdown');
            let list = self.find(`#${id}MultiSelectList`);
            let option = list.find('.multiSelect_option');
            dropdown.attr('data-multiple', 'true');
            list.css('top', dropdown.height() + 5);
            self.addClass('-selected');
            picklist.length > 0 && picklist.forEach(item => {
                field.find('option:contains(' + item + ')').prop('selected', true);
                list.find('.multiSelect_option:contains(' + item + ')').addClass('-selected');
                list.css('top', dropdown.height() + 5).find('.multiSelect_noselections').remove();
                if (dropdown.children(':visible').length === 0) {
                    dropdown.removeClass('-hasValue');
                }
                dropdown.append(function (e) {
                    return jQuery('<span class="multiSelect_choice">' + item + '<img id="tagCloseButton" src="./img/Close.svg"/></span>').click(function (e) {
                        let self = jQuery(this);
                        e.stopPropagation();
                        self.remove();
                        list.find('.multiSelect_option:contains(' + item + ')').removeClass('-selected');
                        list.css('top', dropdown.height() + 5).find('.multiSelect_noselections').remove();
                        field.find('option:contains(' + item + ')').prop('selected', false);
                        if (dropdown.children(':visible').length === 0) {
                            dropdown.removeClass('-hasValue');
                        }
                    });

                }).addClass('-hasValue');
                $('#multiSelectWrapper').css('height', (Math.ceil($('.multiSelect_dropdown').height()) + 100) + "px")
                list.css('top', dropdown.height() + 5);
                if (!option.not('.-selected').length) {
                    list.append('<h5 class="multiSelect_noselections">No Selections</h5>');
                }
            });
        })
    },
    MultiSelectHandler:      //multiselect
        function MultiSelectHandler(id) {
            $('#' + id).each(async function (e) {
                let self = jQuery(this);
                let field = self.find(`#${id}MultiSelectx`);
                let fieldOption = field.find('option');

                // await field.hide().after(`<div class="multiSelect_dropdown"></div>
                //     <ul class="multiSelect_list" id='${id}MultiSelectList'></ul>
                //     <span class="multiSelect_arrow"></span>`);
                // fieldOption.each(function (e) {
                //     $('#' + id + 'MultiSelectList').append(`<li class="multiSelect_option" data-value="` + jQuery(this).val() + `">
                //         <a class="multiSelect_text">`+ jQuery(this).text() + `</a>
                //     </li>`);
                // });

                let dropdown = self.find('.multiSelect_dropdown');
                let list = self.find(`#${id}MultiSelectList`);
                let option = self.find('.multiSelect_option');
                let optionText = self.find('.multiSelect_text');

                dropdown.attr('data-multiple', 'true');
                list.css('top', dropdown.height() + 5);

                option.click(function (e) {
                    let self = jQuery(this);
                    e.stopPropagation();
                    self.addClass('-selected');
                    field.find('option:contains(' + self.children().text() + ')').prop('selected', true);
                    $('#multiSelectWrapper').css('height', (Math.ceil($('.multiSelect_dropdown').height() + 100)) + "px")
                    dropdown.append(function (e) {
                        return jQuery('<span class="multiSelect_choice">' + self.children().text() + '<img  id="tagCloseButton" src="./img/Close.svg"/></span>').click(function (e) {
                            let self = jQuery(this);
                            e.stopPropagation();
                            self.remove();
                            list.find('.multiSelect_option:contains(' + self.text() + ')').removeClass('-selected');
                            list.css('top', dropdown.height() + 5).find('.multiSelect_noselections').remove();
                            field.find('option:contains(' + self.text() + ')').prop('selected', false);
                            if (dropdown.children(':visible').length === 0) {
                                dropdown.removeClass('-hasValue');
                            }
                            // $('#multiSelectWrapper').css('height', (Math.ceil($('.multiSelect_dropdown').height()))+"px" )
                        });
                    }).addClass('-hasValue');
                    list.css('top', dropdown.height() + 5);
                    if (!option.not('.-selected').length) {
                        list.append('<h5 class="multiSelect_noselections">No Selections</h5>');
                    }
                });

                dropdown.click(function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    dropdown.toggleClass('-open');
                    list.toggleClass('-open').scrollTop(0).css('top', dropdown.height() + 5);
                });

                jQuery(document).on('click touch', function (e) {
                    if (dropdown.hasClass('-open')) {
                        dropdown.toggleClass('-open');
                        list.removeClass('-open');
                    }
                });
            });
        },

    SelectedList: function SelectedList(id) {
        let selectedArray = []
        $('#' + id).each(function (e) {
            let self = jQuery(this);
            let field = self.find('.multiSelect_choice');
            let i
            for (i = 0; i < field.length; i++) {
                selectedArray.push(field[i].innerText)
            }
        })
        return selectedArray
    }

}

