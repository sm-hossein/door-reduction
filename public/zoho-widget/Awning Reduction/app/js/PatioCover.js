

jQuery(function ($) {
    getData()
    $('#measureFields').css('display', 'none')
    async function getData() {
        let reductionNumber = {}

        let apicall = new apiCalls()
        let orderItems = await apicall.getFromZoho("Order_Items", pageData.EntityId[0])
        let orderItemReductionFields = JSON.parse(orderItems[0].Reduction_Fields)
        console.log(orderItems, 'orderItems');
        let order = await apicall.getFromZoho("Deals", orderItems[0].Order.id)
        console.log(order, 'order');
        let contactInfo = await apicall.getFromZoho("Contacts", order[0].Contact_Name.id)
        // console.log(contactInfo, 'contact Info');
        let propertyInfo = order[0].Property ? await apicall.getFromZoho("Properties", order[0].Property.id) : {}
        // console.log(propertyInfo, 'propertyInfo Info');
        let installContactInfo = order[0].Install_Contact ? await apicall.getFromZoho("Contacts", order[0].Install_Contact.id) : {}
        // console.log(installContactInfo, 'installContactInfo');



        let mainDiv = $('#mainContent')
        let formDiv = await CreateForm.createPatioCoverForm();
        mainDiv.prepend(formDiv)
        temp = `<div class="modalContent"><img src="./img/icons8-spinner.gif"/>
        <p>Loading Data From Zoho!</p>
        </div>
        `
        $('#Modal').Modal({ title: '', content: temp });
        $('#modal‌Box').css({ "width": '25%', 'height': 'auto' })

        await CreateForm.CreateOptions()
        orderItems[0].Fabric_Type !== 'Stock' && (fabricSelectionRenderer(true))
        await CreateForm.CreateMultiSelectOptions()
        MultiSelect.MultiSelectFill(order[0].Awning_Coversheet_Picklist, 'CoversheetPick')
        MultiSelect.MultiSelectHandler('CoversheetPick')
        // MultiSelectImplement(order[0])
        $('#mainTitle').html(orderItems[0].Product_Category)
        let setFields = {
            'inputOrder': item => order[0] && $('#' + item.id).val(order[0][item.zohoName]),
            'inputtrue': item => orderItemReductionFields && $('#' + item.id).val(orderItemReductionFields[item.zohoName]),
            'inputfalse': item => $('#' + item.id).val(orderItems[0][item.zohoName]),
            // 'dropdowntrue': item => orderItemReductionFields && $('#' + item.id + ' option:contains("' + orderItemReductionFields[item.zohoName] + '")').prop('selected', true),
            // 'dropdownfalse': item => $('#' + item.id + ' option:contains("' + orderItems[0][item.zohoName] + '")').prop('selected', true),
            'dropdowntrue': item => orderItemReductionFields && $('#' + item.id + ' option[value="' + orderItemReductionFields[item.zohoName] + '"]').prop('selected', true),
            // 'dropdowntrue': item => orderItemReductionFields && $('#' + item.id + ' option:contains("' + orderItemReductionFields[item.zohoName] + '")').prop('selected', true),
            'dropdownfalse': item => $('#' + item.id + ' option[value="' + orderItems[0][item.zohoName] + '"]').prop('selected', true),
            // 'dropdownfalse': item => $('#' + item.id + ' option:contains("' + orderItems[0][item.zohoName] + '")').prop('selected', true),

            'multiselecttrue': item => { },
            'multiselectfalse': item => { },
            'textareaOrder': item => $('#' + item.id).val(order[0][item.zohoName]),
            'multiselectOrder': item => { },
        }
        PatioFields.forEach(item => {
            item.orderLevel ? setFields[item.type + 'Order'](item) :
                setFields[item.type + item.reductionField](item)
        })

        //create location number 
        ReductionNumberCreator()

        //close the loading modal
        $('#Modal').empty()
        //Events********************************************************************
        //fabric selection rendering base on fabric type
        $('#FabricType').change(async function (e) {
            fabricSelectionRenderer()
        })
        //set coth actual size to disabled and only activate when `ClothSize` is set to `actual`
        $('#ClothSize').val() !== 'Actual' && $('#ClothActualSize').prop('disabled', true)

        $('#ClothSize').click(function () {
            if ($('#ClothSize').val() == 'Actual') {
                $('#ClothActualSize').prop('disabled', false)
            }
            else {
                $('#ClothActualSize').prop('disabled', true)
            }
        })

        $('#submitLA').prop("disabled", false)
        $('#backToForm').on('click', function () {
            $('#patioCoverReduction').remove()
            $('#backToForm').hide()
            $('#printBox').hide()

            $('#submitLA').css('display', 'block')
            $('#submitLA').prop("disabled", false);
            $('#mainTitle').show()
            $('#LA').show()
        })

        $('#submitLA').on('click', async function () {
            $('#submitLA').prop("disabled", true);
            let reductionObj = await requestToCustomFunction('reduction')
            if (!jQuery.isEmptyObject(reductionObj)) {
                await setValuesToZoho(reductionObj, 'reduction') && createReductionSheet(reductionObj)
            }
        })
        $('#saveFailedOk').on('click', function () {
            $('#failedZohoSave').css('display', 'none')
            $('#saveFailedErrortext').text()
        })
        $('#printBox').on('click', function () {
            $('#printBox').hide()
            $('#backToForm').hide()
            window.print();
            $('#printBox').show()
            $('#backToForm').show()
        })
        //functions****************************************************************************
        async function setValuesToZoho(resObj, resType) {
            let data = { Reduction_Fields: {} }
            PatioFields.forEach(item => {
                item.reductionField ? (data.Reduction_Fields[item.zohoName] = $('#' + item.id).val()) :
                    (data[item.zohoName] = $('#' + item.id).val())
            })
            data['Loc_No'] =  reductionNumber.index 
            data.id = orderItems[0].id;
            data.Reduction_Fields.FabricYardage = resObj['TotalYardage']
            data.Fabric_Yardage = resObj['TotalYardage']
            data.Reduction_Fields = JSON.stringify(data.Reduction_Fields)
            // save result to Reduction_Result
            resObj['LocationNumber'] =  reductionNumber.index 
            if (orderItems[0].Reduction_Result) {
                let reductionResult = JSON.parse(orderItems[0].Reduction_Result)
                reductionResult[resType] = resObj;
                data.Reduction_Result = JSON.stringify(reductionResult)
            } else {
                let reductionResult = { "reduction": {}, "measure": {} }
                reductionResult[resType] = resObj;
                data.Reduction_Result = JSON.stringify(reductionResult)
            }
            let itemsUpdateRes = await apicall.updateRecordOnZoho('Order_Items', data, 'workflow')
            if (itemsUpdateRes && itemsUpdateRes.data && itemsUpdateRes.data[0] && itemsUpdateRes.data[0].status !== 'success') {
                $('#failedZohoSave').css('display', 'block')
                $('#saveFailedErrortext').text('Error Message: ' + itemsUpdateRes.data[0].message)
                return false
            }

            let selectedCoversheet = await MultiSelect.SelectedList('CoversheetPick')
            let orderObj = {}
            orderObj.id = order[0].id;
            orderObj.Awning_Coversheet_Picklist = selectedCoversheet;
            orderObj.Reduction_Notes = $('#CoversheetNote').val()
            let orderUpdateRes = await apicall.updateRecordOnZoho('Deals', orderObj, 'workflow')
            if (orderUpdateRes && orderUpdateRes.data && orderUpdateRes.data[0] && orderUpdateRes.data[0].status !== 'success') {
                $('#failedZohoSave').css('display', 'block')
                $('#saveFailedErrortext').text('Error Message: ' + orderUpdateRes.data[0].message)
                return false
            }
            return true
        }

        async function fabricSelectionRenderer(init) {
            if ($('#FabricType').val() === 'Stock') {
                await $('#FabricSelection').replaceWith(`<select name='Fabric Selection' id='FabricSelection' ></select>`)
                await CreateForm.CreateSingleFieldOptions({ name: 'Fabric Selection', id: 'FabricSelection', api_name: 'Fabric_Selection' }, true)
            }
            else {
                $('#FabricSelection').replaceWith(`<input id='FabricSelection' type="text"/>`)
            }
            //if the fabric type is not stock it's not a drop down so the value needs to be set again
            init && orderItems[0].Fabric_Type !== 'Stock' ? $('#FabricSelection').val(orderItems[0].Fabric_Selection) : ''
        }
        // function createReductionSheetDataRows(dataArray, printObject) {
        //     let temp = ''
        //     dataArray.forEach(item => {
        //         temp = temp +
        //             `<div class="patioRow rowSpacing">
        //         <p class='labelStyle'>${item.showName}:  </p>
        //         <p class='valueStyle'>${item.name !== 'Number' ? printObject[item.name] + (item.secondName ? " - " + printObject[item.secondName] : '') + (item.unit ? " " + item.unit : '')
        //                 : reductionNumber.index + ' of ' + reductionNumber.total + '(' + printObject['Location'] + ')'}</p>
        //     </div>`
        //     })
        //     return temp
        // }
        // function listRenderer(dataArray) {
        //     let temp = ''
        //     dataArray.forEach(item => {
        //         temp = temp +
        //             `<p class='listItem'>${item}</p>`
        //     })
        //     return temp
        // }

        // async function ReductionNumberCreator() {
        //     // get pageNumber
        //     reductionNumber = await checkNextNumber();
        //     if (orderItems[0].Loc_No) {
        //         reductionNumber.index = orderItems[0].Loc_No;
        //     }
        // }

        async function checkNextNumber() {
            let responseObject = {
                total: 0,
                index: 0,
            }

            let orderItemsList = await apicall.getRelatedRecordsFromZoho("Deals", orderItems[0].Order.id, "Order_Items")

            let sortedList = orderItemsList.sort((a, b) => a.Name.localeCompare(b.Name));
            responseObject.total = sortedList.length;

            // determine next number:
            let numberedArray = orderItemsList.filter(element => element.Loc_No != null)
            let nextNumber = 1;
            let numbers = [];
            numbers = numberedArray.map(el => el.Loc_No)
            for (let i = 1; i <= numbers.length + 1; i++) {
                if (!numbers.includes(i)) {
                    nextNumber = i;
                    break;
                }
            }
            responseObject.index = nextNumber

            return responseObject;
        }

        async function ReductionNumberCreator() {
            // get pageNumber
            reductionNumber = await checkNextNumber();
            if (orderItems[0].Loc_No) {
                reductionNumber.index = orderItems[0].Loc_No;
                // $('#LocationNumber').val(orderItems[0].Loc_No)
            }
            else {
                // $('#LocationNumber').val(reductionNumber.index)
            }
        }

        async function requestToCustomFunction(type) {
            let reductionObject = {
                functionType: type,
                Number: "",
                type: orderItems[0].Item_Type.name,
            }
            PatioFields.forEach(async item => {
                if (item.type === 'multiselect') {
                    reductionObject[item.reductionName] = await MultiSelect.SelectedList(item.id)
                }
                else {
                    reductionObject[item.reductionName] = item.type !== 'checkbox' ? $('#' + item.id).val() : $('#' + item.id).is(':checked')
                }
            })
            let func_name = "PatioCoverReduction";
            let req_data = {
                "arguments": JSON.stringify({
                    "PatioCoverReductionInput": reductionObject
                })
            };
            console.log(reductionObject, 'data');
            let res = await apicall.reductionFunction(func_name, req_data)
            let temp = JSON.parse(res.details.output)
            console.log(temp, JSON.parse(temp.details.output));
            return JSON.parse(temp.details.output)
        }

        async function createReductionSheet(printObject) {
            // await ReductionNumberCreator()
            $('#submitLA').css('display', 'none')
            //let printDiv = $(`
            // <div id='patioCoverReduction' >
            //     <div class='dataWrapper'>
            //             <div class='patioRow'>
            //                 <div class='colSmall'>
            //                 <div class='colTitle'>Fabrication Information</div>
            //                     ${createReductionSheetDataRows(PatioFabricationInformationFields, printObject)}
            //                 </div>
            //                 <div class='colLarge'>
            //                 <div class='colTitle'>Sewing Information</div>
            //                      ${createReductionSheetDataRows(PatioSewingInformationFields, printObject)}
            //                 </div>
            //             </div>
            //             <div class='patioRow rowSpacingbig'>
            //                 <div class='fullWidthCol'>
            //                      ${createReductionSheetDataRows(PatioOtherInfo, printObject)}
            //                 </div>
            //             </div>

            //             <div class='patioRow rowSpacingbig'>
            //                 <div class='col'>
            //                     <div class='colFlexTitle'>Post Locations From Left</div>
            //                     <div class='flexColSmall'>
            //                         ${listRenderer(printObject.PostLocationsFromLeft)}
            //                     </div>
            //                 </div>
            //                 <div class='col'>
            //                     <div class='colFlexTitle'>Mounting Hole Locations From Left</div>
            //                     <div class='flexCol'>
            //                         ${listRenderer(printObject.MountingHoleLocationFromLeft)}

            //                     </div>
            //                 </div>
            //                 <div class='col'>
            //                     <div class='colFlexTitle'>Rafter Hole Locations From Left</div>
            //                     <div class='flexCol'>
            //                         ${listRenderer(printObject.RafterHoleLocationsFromLeft)}
            //                     </div>
            //                 </div>
            //             </div>
            //             <div class="NoteSpot"></div>
            //             </div>
            //             <div class='patioRow footerStyle' >
            //                 ${measure_reductionSheetFooter('reduction')}
            //             </div>
            // </div>
            // `);

            // let tmpHeader = Header('reduction ', orderItems[0], order[0], installContactInfo[0], contactInfo[0], propertyInfo[0])
            // printDiv.prepend(tmpHeader)
            printObject['Number'] = reductionNumber.index + ' of ' + reductionNumber.total + ' ' + (printObject.Location ? ' (' + printObject.Location + ')' : '');
            Reductionsheets['Patio Cover'](printObject, orderItems[0], order[0], installContactInfo[0], contactInfo[0], propertyInfo[0])
            $('#LA').hide();
            $('#mainTitle').hide();
            $('#printBox').show()
            $('#backToForm').show()
            // $('#mainContent').prepend(printDiv)
            window.scrollTo(0, 0)
        }


    }
});



