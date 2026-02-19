
jQuery(function ($) {
    const FabricSelection = [{ name: 'Fabric Selection', id: 'FabricSelection', api_name: 'Fabric_Selection' }]

    getData()
    async function getData() {
        let isCalculated = false
        let isUpdatedAfterCalculated = false;
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
        //  AwningReductionPsw_Get Org Variable Fabric Selection
        Shade_Reduction_Fields_Def = await apicall.getShadeReductionFields()

        let mainDiv = $('#mainContent')
        let formDiv = await FormGenerator.formGenerator(AwningReductionFormFields);
        mainDiv.prepend(formDiv)
        temp = `<div class="modalContent"><img src="./img/icons8-spinner.gif"/>
                <p>Loading Data From Zoho!</p>
                </div>
                `
        $('#Modal').Modal({ title: '', content: temp });
        $('#modal‌Box').css({ "width": '25%', 'height': 'auto' })
        await FormGenerator.CreateOptions()
        await FormGenerator.CreateMultiSelectOptions()
        MultiSelect.MultiSelectFill(order[0].Awning_Coversheet_Picklist, 'CoverSheetList')
        MultiSelect.MultiSelectHandler('CoverSheetList')
        // createShadeFabricWidthArray()

        //add reuiredClass to reqired fields
        AwningCalcRequiredFields.forEach(item => {
            $('#' + item).addClass('requuiredField')
        })

        $('#mainTitle').html(orderItems[0].Product_Category)

        let setFields = {
            'inputtrue': item => orderItemReductionFields && $('#' + item.id).val(orderItemReductionFields[item.zohoName]),
            'inputOrder': item => order[0] && $('#' + item.id).val(order[0][item.zohoName]),
            'inputfalse': item => $('#' + item.id).val(item.secondZohoId ? orderItems[0][item.zohoName][item.secondZohoId] : orderItems[0][item.zohoName]),
            'textareatrue': item => orderItemReductionFields && $('#' + item.id).val(orderItemReductionFields[item.zohoName]),
            'textareafalse': item => $('#' + item.id).val(orderItems[0][item.zohoName]),
            'dropdowntrue': item => orderItemReductionFields && $('#' + item.id + ' option[value="' + orderItemReductionFields[item.zohoName] + '"]').prop('selected', true),
            // 'dropdowntrue': item => orderItemReductionFields && $('#' + item.id + ' option:contains("' + orderItemReductionFields[item.zohoName] + '")').prop('selected', true),
            'dropdownfalse': item => $('#' + item.id + ' option[value="' + orderItems[0][item.zohoName] + '"]').prop('selected', true),
            // 'dropdownfalse': item => $('#' + item.id + ' option:contains("' + orderItems[0][item.zohoName] + '")').prop('selected', true),
            'decimalInputtrue': item => orderItemReductionFields && $('#' + item.id).val(orderItemReductionFields[item.zohoName]),
            'decimalInputfalse': item => $('#' + item.id).val(orderItems[0][item.zohoName]),
            'multiselecttrue': item => { },
            'multiselectfalse': item => { },
            'multiselectOrder': item => { },
            'textareaOrder': item => $('#' + item.id).val(order[0][item.zohoName]),
            'checkboxtrue': item => $('#' + item.id).prop('checked', orderItemReductionFields[item.zohoName]),
            'checkboxfalse': item => $('#' + item.id).prop('checked', orderItems[0][item.zohoName])
        }

        AwningFields.forEach(item => {
            //disable the read only fields 
            item.readOnly && $('#' + item.id).prop('disabled', true)
            item.orderLevel ? setFields[item.type + 'Order'](item) :
                setFields[item.type + item.reductionField](item)
        })

        //create location Number
        ReductionNumberCreator()

        //disabled fields
        $('#CalculatedInstallTime').prop('disabled', true)
        $('#CrossArm').prop('disabled', true)
        $('#ClothSize').val() === 'Actual' ? $('#ClothActualSize').prop('disabled', false) : $('#ClothActualSize').prop('disabled', true)
        $('#CrankSize').val() == 'Custom' ? $('#CustomCrankSize').prop("disabled", false) : $('#CustomCrankSize').prop("disabled", true);
        frontCuratianHandlerFunction()

        //check if calculate has been done at least once for this order item
        $('#MotorSize').val() && (isCalculated = true)

        //check fabric type to set fabric selection
        if ($('#FabricType').val() === 'Stock') {
            SetFabricSelection()
        }
        //

        //close the loading modal
        $('#Modal').empty()
        // //Events**************************************************************************************
        // front curtain related fields
        $('#FrontCurtain').on('change', async function () {
            // if ($('#FrontCurtain').val() == '-None-') {
            //     $('#FrontCurtainColor').prop('disabled', true)
            //     $('#FrontCurtainColor option[value="-None-"]').prop('selected', true);
            //     $('#FrontCurtainOpenness').prop('disabled', true)
            //     $('#FrontCurtainOpenness option[value="-None-"]').prop('selected', true);
            //     $('#FrontCurtainDropSize').prop("disabled", true);
            //     $('#FrontCurtainDropSize option[value="-None-"]').prop('selected', true);
            // }
            // if ($('#FrontCurtain').val() == 'Upgraded') {
            //     $('#FrontCurtainDropSize').prop("disabled", true);
            //     $('#FrontCurtainDropSize option[value="-None-"]').prop('selected', true);
            //     $('#FrontCurtainColor').prop('disabled', false)
            //     $('#FrontCurtainOpenness').prop('disabled', false)
            // }
            // if ($('#FrontCurtain').val() == 'Standard') {
            //     $('#FrontCurtainColor').prop('disabled', false)
            //     $('#FrontCurtainOpenness').prop('disabled', false)
            //     $('#FrontCurtainDropSize').prop('disabled', false)
            // }
            frontCuratianHandlerFunction()
        })
        //change Fabric Selection based on fabric type
        $('#FabricType').on('change', function () {
            if ($('#FabricType').val() === 'Stock') {
                SetFabricSelection()
            }
            else {
                $('#FabricSelection').replaceWith('<input id="FabricSelection" type="text" />')
            }
        })
        // on change crank size to custom active/deactive custom Input 
        $('#CrankSize').on('change', function () {
            if ($('#CrankSize').val() == 'Custom') {
                $('#CustomCrankSize').prop("disabled", false);
            } else {
                $('#CustomCrankSize').val('')
                $('#CustomCrankSize').prop("disabled", true);
            }
        });

        //calculate button
        $('#calculateButton').on('click', function () {
            if (checkReduceRequiredFields()) {
                calculateFunction()
            }
        })

        //cloth actual size should be enbaled if cloth size is 'Actual'
        $('#ClothSize').on('click', function () {
            if ($('#ClothSize').val() === 'Actual') {
                $('#ClothActualSize').prop('disabled', false)
            }
            else {
                $('#ClothActualSize').prop('disabled', true)
                $('#ClothActualSize').val('')
            }
        })

        //on change of required fields set iscalculate to false to recalculate
        $('.requuiredField').on('change', function () {
            if (isCalculated) {
                isUpdatedAfterCalculated = true;
            }
        })

        $('#submitLA').prop("disabled", false)

        $('#backToForm').on('click', function () {
            $('#AwningReduction').remove()
            $('#AwningMeasureSheet').remove()
            $('#backToForm').hide()
            $('#printBox').hide()
            $('#measureFields').css('display', 'block')
            $('#measureFields').prop("disabled", false);
            $('#submitLA').css('display', 'block')
            $('#submitLA').prop("disabled", false);
            $('#mainTitle').show()
            $('#LA').show()
        })

        $('#submitLA').on('click', async function () {
            if (checkReduceRequiredFields()) {
                $('#submitLA').prop("disabled", true);
                let reductionObj = {}
                if (isCalculated) {
                    if (isUpdatedAfterCalculated) {
                        $('#hiddenCalculationType').html('reduction')
                        $('#calculationErrorModal').css('display', 'block')
                    } else {
                        reductionObj = await RequestToCustomFunction('reduction')
                        if (!jQuery.isEmptyObject(reductionObj)) {
                            console.log(reductionObj, 'pp');
                            await setValuesToZoho(reductionObj, 'reduction') && createReductionSheet(reductionObj)
                        }
                    }
                }
                else {
                    $('#hiddenCalculationType').html('reduction')
                    $('#calculationErrorModal').css('display', 'block')
                }
                $('#submitLA').prop("disabled", false);
            }
        })

        $('#measureFields').on('click', async function () {
            if (checkReduceRequiredFields()) {
                $('#measureFields').prop("disabled", true);
                let obj = {}
                if (isCalculated) {
                    if (isUpdatedAfterCalculated) {
                        $('#hiddenCalculationType').html('measure')
                        $('#calculationErrorModal').css('display', 'block')
                    } else {
                        obj = await RequestToCustomFunction('measure')
                        if (!jQuery.isEmptyObject(obj)) {
                            // await ReductionNumberCreator();
                            obj['Number'] = $('#LocationNumber').val() + ' of ' + reductionNumber.total + ' ' + (obj.Location ? ' (' + obj.Location + ')' : '');
                            console.log(obj, "obj");
                            await setValuesToZoho(obj, 'measure') && createMeasureSheet(obj)

                        }
                    }
                }
                else {
                    $('#hiddenCalculationType').html('measure')
                    $('#calculationErrorModal').css('display', 'block')
                }
                $('#measureFields').prop("disabled", false);
            }
        })
        $('#proceedWithoutCalculation').on('click', async function () {
            if ($('#hiddenCalculationType').text() == 'reduction') {
                $('#calculationErrorModal').css('display', 'none')
                let reductionObj = await RequestToCustomFunction('reduction')
                if (reductionObj) {
                    await setValuesToZoho(reductionObj, 'reduction') && createReductionSheet(reductionObj)
                }
            }
            if ($('#hiddenCalculationType').text() == 'measure') {
                $('#calculationErrorModal').css('display', 'none')
                let obj = await RequestToCustomFunction('measure')
                if (obj) {
                    // await ReductionNumberCreator();
                    obj['Number'] = $('#LocationNumber').val() + ' of ' + reductionNumber.total + ' ' + (obj.Location ? '(' + obj.Location + ')' : '');
                    console.log(obj, "obj");
                    await setValuesToZoho(obj, 'measure') && createMeasureSheet(obj)

                }
            }
        })

        $('#cancelProcess').on('click', function () {
            $('#calculationErrorModal').css('display', 'none')
            calculateFunction()
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
        // //************************************************************************************
        //Functions***************************************************************************
        function frontCuratianHandlerFunction() {
            if ($('#FrontCurtain').val() == '-None-') {
                $('#FrontCurtainColor').prop('disabled', true)
                $('#FrontCurtainColor option[value="-None-"]').prop('selected', true);
                $('#FrontCurtainOpenness').prop('disabled', true)
                $('#FrontCurtainOpenness option[value="-None-"]').prop('selected', true);
                $('#FrontCurtainDropSize').prop("disabled", true);
                $('#FrontCurtainDropSize option[value="-None-"]').prop('selected', true);
            }
            if ($('#FrontCurtain').val() == 'Upgraded') {
                $('#FrontCurtainDropSize').prop("disabled", true);
                $('#FrontCurtainDropSize option[value="-None-"]').prop('selected', true);
                $('#FrontCurtainColor').prop('disabled', false)
                $('#FrontCurtainOpenness').prop('disabled', false)
            }
            if ($('#FrontCurtain').val() == 'Standard') {
                $('#FrontCurtainColor').prop('disabled', false)
                $('#FrontCurtainOpenness').prop('disabled', false)
                $('#FrontCurtainDropSize').prop('disabled', false)
            }
        }
        async function SetFabricSelection() {
            $('#FabricSelection').replaceWith('<select name="Fabric Selection" id="FabricSelection" ></select>')
            await FormGenerator.CreateOptionForDropdown(FabricSelection)
            setFields['dropdownfalse']({ name: 'Fabric Selection', id: 'FabricSelection', api_name: 'Fabric_Selection', reductionName: 'Fabric_Selection', zohoName: 'Fabric_Selection', type: 'input', reductionField: false, customFuncName: 'Fabric Selection' })
        }
        async function setValuesToZoho(resObj, resType) {
            let data = { Reduction_Fields: {} }
            AwningFields.forEach(item => {
                if (!item.orderLevel) {
                    if (item.zohoName === 'Strip_Offset') {
                        data.Reduction_Fields[item.zohoName] = createDecimalInt($('#' + item.id).val())
                    }
                    else {
                        item.reductionField ? (data.Reduction_Fields[item.zohoName] = $('#' + item.id).val()) :
                            item.type !== 'checkbox' ? (data[item.zohoName] = $('#' + item.id).val()) : (data[item.zohoName] = $('#' + item.id).is(":checked"))
                    }
                }
            })
            data.id = orderItems[0].id;
            data.Reduction_Fields.FabricYardage = resObj['TotalYardage']
            data.Fabric_Yardage = resObj['TotalYardage']
            data.Reduction_Fields = JSON.stringify(data.Reduction_Fields)
            console.log(data);
            // save result to Reduction_Result
            resObj['LocationNumber'] = $('#LocationNumber').val()
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
            let selectedCoversheet = await MultiSelect.SelectedList('CoverSheetList')
            let orderObj = {}
            orderObj.id = order[0].id;
            orderObj.Awning_Coversheet_Picklist = selectedCoversheet;
            orderObj.Reduction_Notes = $('#CoverSheetNote').val()
            let orderUpdateRes = await apicall.updateRecordOnZoho('Deals', orderObj, 'workflow')
            if (orderUpdateRes && orderUpdateRes.data && orderUpdateRes.data[0] && orderUpdateRes.data[0].status !== 'success') {
                $('#failedZohoSave').css('display', 'block')
                $('#saveFailedErrortext').text('Error Message: ' + orderUpdateRes.data[0].message)
                return false
            }
            return true
        }
        function createDecimalInt(number) {
            let finalResult = "";
            let tmpArray = number.split(" ");
            if (tmpArray.length > 1) {

                let fractionArray = tmpArray[1].split("/");
                finalResult = parseFloat(((Number(tmpArray[0]) * Number(fractionArray[1])) + Number(fractionArray[0])) / Number(fractionArray[1]))
            } else {
                if (number.includes(".")) {
                    finalResult = parseFloat(number)
                }
                if (number.includes("/")) {
                    let fractionArray = number.split("/");
                    finalResult = parseFloat((Number(fractionArray[0])) / Number(fractionArray[1]))
                }
                if (!isNaN(Number(number))) {
                    finalResult = parseFloat(number)
                }
            }
            return finalResult;
        }
        // function createReductionSheetDataRows(dataArray, printObject) {
        //     // console.log(printObject, printObject['Location'], 'location');
        //     let temp = ''
        //     dataArray.forEach(item => {
        //         if (item.singleLine) {
        //             temp = temp +
        //                 `<div class="patioRow rowSpacing">
        //                     <p class='labelStyle'>${printObject[item.name]} </p>
        //                  </div>`
        //         }
        //         else {
        //             temp = temp +
        //                 `<div class="patioRow rowSpacing">
        //                     <p class='labelStyle'>${item.showName}:  </p>
        //                     <p class='valueStyle'>${item.name !== 'Number' ? printObject[item.name] + (item.secondName ? " - " + printObject[item.secondName] : '') + (item.unit ? " " + item.unit : '')
        //                     : reductionNumber.index + ' of ' + reductionNumber.total + ' (' + printObject['Location'] + ')'}</p>
        //     </div>`
        //         }

        //     })
        //     return temp
        // }
        // Check Required Feilds before calculate
        function checkReduceRequiredFields() {
            let result = true
            AwningCalcRequiredFields.forEach(function (e) {
                let check = $('#' + e).val() !== '-None-' && $('#' + e).val() !== ''
                if (check) {
                    $('#' + e).css('border', '1px solid rgb(239 239 239)')
                }
                else {
                    result = false
                    $('#' + e).css('border', '1px solid red')
                    alert('Fill The Required Fields!')
                }
            });
            return result
        }

        // async function ReductionNumberCreator() {
        //     // get pageNumber
        //     reductionNumber = await checkNextNumber();
        //     if (orderItems[0].Loc_No) {
        //         reductionNumber.index = orderItems[0].Loc_No;
        //     }
        // }
        async function ReductionNumberCreator() {
            // get pageNumber
            reductionNumber = await checkNextNumber();
            if (orderItems[0].Loc_No) {
                reductionNumber.index = orderItems[0].Loc_No;
                $('#LocationNumber').val(orderItems[0].Loc_No)
            }
            else {
                $('#LocationNumber').val(reductionNumber.index)
            }
        }

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
            console.log(responseObject, 'numberrr');
            responseObject.index = nextNumber

            return responseObject;
        }

        async function createMeasureSheet(measureObject) {
            $('#measureFields').css('display', 'none')
            $('#submitLA').css('display', 'none')
            let measureCreator = new MeasuresheetCreator()
            let printDiv = $(`
            <div id='AwningMeasureSheet' >
                <div class="d-flex justify-content-center">
                ${measureObject.IsCrossed ? '<div id="iscrossedStyleMeasure">X ARM</div>' : ''}
                </div>
                <div class="mainInfoWrapper ">
                    <div class="infoCol_1">
                        ${measureCreator.mainMeasureTabel(AwningMeasureTabelInfo, measureObject, AwningMeasureExtraFields, 'BackBoard')}
                        </div>    
                        <div class="infoCol_2">
                        ${measureCreator.measuresheetMountingTabelPSW(measureObject)}
                        ${measureCreator.measuresheetOtherInfoTabel(AwningMeasureOtherInfoFields, measureObject)}
                        ${measureCreator.measuresheetCrank(measureObject)}
                        ${measureCreator.measuresheetInstallInfo(order[0])}
                        </div>
                        </div>         
                        ${measureCreator.measuresheetNoteSection(measureObject)}
                <div class='footerRow footerStyle foooterMarginTop ' >
                ${measure_reductionSheetFooter('measure')}
                </div>       
            </div>`);

            let tmpHeader = Header('measure ', orderItems[0], order[0], installContactInfo[0], contactInfo[0], propertyInfo[0])
            printDiv.prepend(tmpHeader)
            $('#LA').hide();
            $('#mainTitle').hide();
            $('#printBox').show()
            $('#backToForm').show()
            $('#mainContent').prepend(printDiv)
            window.scrollTo(0, 0)

        }
        // function reductionsheetTabel() {
        //     let temp = ''
        //     AwningoOtherInfo.forEach(item => {
        //         temp = temp + `<tr>
        //             <td>${item[0]}</td>
        //             <td>${item[1]}</td>
        //         </tr>`
        //     })
        //     return temp
        // }
        async function createReductionSheet(printObject) {
            // await ReductionNumberCreator()
            $('#submitLA').css('display', 'none')
            $('#measureFields').css('display', 'none')
            //     let printDiv = $(`
            //         <div id='AwningReduction' >
            //             <div class='dataWrapper'>
            //                     <div class='patioRow'>
            //                         <div class='col'>
            //                         <div class='colTitle'>Building Information</div>
            //                                 ${createReductionSheetDataRows(AwningFabricationInformationFields, printObject)}
            //                         </div>
            //                         <div class='col'>
            //                             <div class='colTitle'>Sewing Information</div>
            //                                 ${createReductionSheetDataRows(AwningSewingInformationFields, printObject)}
            //                             <div class="spacedBetweenRow rowSpacing">
            //                                 <div class="labelStyle">Cloth Width ______</div>
            //                                 <div class="labelStyle">Stripe Offset ______</div> 
            //                             </div>
            //                             <div class="reductionTabelRow">
            //                             <table >
            //                                  ${reductionsheetTabel()}
            //                             </table>
            //                             </div>
            //                             <div class='colTitle'>Installation Information</div>
            //                                  ${createReductionSheetDataRows(AwningInstallationInformationFields, printObject)}
            //                         </div>
            //                     </div>
            //                     <p class="awningReductionNoteStyle">${printObject.Note ? "**" + printObject.Note : ''}</p>
            //                     <div class='patioRow footerStyle' >
            //                         ${measure_reductionSheetFooter('reduction')}
            //                     </div>
            //             </div>
            //         </div>
            //         `);

            //     let tmpHeader = Header('reduction ', orderItems[0], order[0], installContactInfo[0], contactInfo[0], propertyInfo[0])
            //     printDiv.prepend(tmpHeader)
            //     $('#LA').hide();
            //     $('#mainTitle').hide();
            //     $('#printBox').show()
            //     $('#backToForm').show()
            //     $('#mainContent').prepend(printDiv)
            //     window.scrollTo(0, 0)
            printObject['Number'] = $('#LocationNumber').val() + ' of ' + reductionNumber.total + ' ' + (printObject.Location ? ' (' + printObject.Location + ')' : '');
            Reductionsheets['Awning'](printObject, orderItems[0], order[0], installContactInfo[0], contactInfo[0], propertyInfo[0], false)
            $('#LA').hide();
            $('#mainTitle').hide();
            $('#printBox').show()
            $('#backToForm').show()
            window.scrollTo(0, 0)
        }
        //Calculate Function
        async function calculateFunction() {
            //calc icon animation
            $('#refreshIcon').addClass('animationRefresh')
            setTimeout(function () {
                $('#refreshIcon').removeClass('animationRefresh')
            }, 2000);

            //send to server for calculation
            let res = await RequestToCustomFunction('refresh')
            console.log(res, 'calc res ');
            //update form fields after Calculation
            $('#CalculatedInstallTime').val(res.InstallTime)
            $('#NumberOfBrackets').val(res.QtyOfBrackets)
            $('#ValSize').val(res.Valance)
            $('#MotorSize option[value="' + res.Motor + '"]').prop('selected', true);
            $('#CrossArm').prop('checked', res.IsCrossArms)

            isCalculated = true;
            isUpdatedAfterCalculated = false;
        }

        async function RequestToCustomFunction(type) {
            console.log('here');
            let reductionObject = {
                functionType: type,
                Number: "",
                type: orderItems[0].Item_Type.name,
            }
            AwningFields.forEach(item => {
                reductionObject[item.customFuncName] = item.type !== 'checkbox' ? $('#' + item.id).val() : $('#' + item.id).is(':checked')
            })
            reductionObject["defaultClothWidth"] = $('#ClothSize').val() == 'Actual' ? null : $('#ClothSize').val();
            reductionObject["ActualClothWidth"] = $('#ClothSize').val() == 'Actual' ? $('#clothActualSize').val() : null;
            reductionObject["WindLegText"] = $('#WindLeg').val() == '' ? '0' : $('#WindLeg').val();
            reductionObject["OverrideInstallTime"] = $('#OverrideInstallTime').val() !== '' ? $('#OverrideInstallTime').val() : null,
                reductionObject['Awning_Coversheet_Picklist'] = await MultiSelect.SelectedList('CoverSheetList')
            let func_name = "mkztest";
            let req_data = {
                "arguments": JSON.stringify({
                    "AMPFactorDetail": reductionObject
                })
            };
            let res = await apicall.reductionFunction(func_name, req_data)
            let temp = JSON.parse(res.details.output)
            console.log(temp, "temp");
            return JSON.parse(temp.details.output)
        }
    }
});



