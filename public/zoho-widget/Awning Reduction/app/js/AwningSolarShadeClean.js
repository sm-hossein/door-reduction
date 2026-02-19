
jQuery(function ($) {
    getData()
    async function getData() {
        let isCalculated = false
        let isUpdatedAfterCalculated = false;
        let reductionNumber = {}

        let apicall = new apiCalls()
        let orderItems = await apicall.getFromZoho("Order_Items", pageData.EntityId[0])
        let orderItemReductionFields = JSON.parse(orderItems[0].Reduction_Fields)
        console.log('REDUCTION FIELDS', orderItemReductionFields);
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
        //form Title
        $('#mainTitle').html(orderItems[0].Product_Category)
        let formDiv = await FormGenerator.formGenerator(SolarShadeFormFields);
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

        //add reuiredClass to reqired fields
        CalcRequiredFields.forEach(item => {
            $('#' + item).addClass('requuiredField')
        })

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

        //set zoho values to form
        SolarShadeFields.forEach(item => {
            item.orderLevel ? setFields[item.type + 'Order'](item) :
                setFields[item.type + item.reductionField](item)
        })


        // if (!orderItems[0].Loc_No) {
        //     let number = await checkNextNumber();
        //     // set to number field
        //     $('#LocationNumber').val(number.index)
        // }
        // else {
        //     // get pageNumber
        //     reductionNumber = await checkNextNumber();
        //     reductionNumber.index = orderItems[0].Loc_No;
        //     $('#LocationNumber').val(orderItems[0].Loc_No)
        // }

        //create location number 
        ReductionNumberCreator()

        //disbled fileds
        $('#CalculatedInstallTime').prop('disabled', true)
        $('#QTY').prop('disabled', true)
        $('#QTY').val() > 1 ? $('#OperatorSideWidth').prop('disabled', false) : $('#OperatorSideWidth').prop('disabled', true)
        $('#CrankSize').val() == 'Custom' ? $('#CustomCrankSize').prop("disabled", false) : $('#CustomCrankSize').prop("disabled", true);

        //check if calculate has been done at least once for this order item
        $('#MotorSize').val() && (isCalculated = true)

        // creating Shade Fabric Width options based on shade openness values 
        function createShadeFabricWidthArray() {
            let shadeFAbricArray = JSON.parse(Shade_Reduction_Fields_Def)["Openness-Shade Fabric Width"]
            if ($('#ShadeOpenness').val() !== '-None-' && $('#ShadeOpenness').val() !== '') {
                shadeFAbricArray.unshift('-None-')
                let index = shadeFAbricArray.findIndex(item => Object.keys(item)[0] == $('#ShadeOpenness').val())
                let $fabricWidthDiv = $('#ShadeFabricWidth');
                $fabricWidthDiv.empty();
                $.each(shadeFAbricArray[index][$('#ShadeOpenness').val()], function (key, val) {
                    $fabricWidthDiv.append(
                        $("<option />").val(val).text(val)
                    );
                });
            }
            else {
                let $fabricWidthDiv = $('#ShadeFabricWidth');
                $fabricWidthDiv.empty();
                // $.each(shadeFAbricArray[0][$('#shadeOpenness').val()], function (key, val) {
                $fabricWidthDiv.append(
                    $("<option />").val('-None-').text('-None-')
                );
                // });
            }
        }
        createShadeFabricWidthArray()

        //set saved value on zoho to shade width after generating options because it depends on shade openness
        let fabricWidthInfo = { name: 'Shade Fabric Width', id: 'ShadeFabricWidth', reductionName: 'fabricWidth', zohoName: 'fabricWidth', api_name: 'fabricWidth', type: 'dropdown', reductionField: true };
        setFields[fabricWidthInfo.type + fabricWidthInfo.reductionField](fabricWidthInfo)

        //close the loading modal
        $('#Modal').empty()

        //Events**************************************************************************************
        //on change of required fields set iscalculate to false to recalculate
        $('.requuiredField').on('change', function () {
            if (isCalculated) {
                isUpdatedAfterCalculated = true;
            }
        })
        //on change shade openness create Shade Fabric Width optopn array
        $('#ShadeOpenness').on('change', function () {
            createShadeFabricWidthArray()
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
        $('#submitLA').prop("disabled", false)

        $('#calculateButton').on('click', function () {
            if (checkReduceRequiredFields()) {
                calculateFunction()
            }
        })

        //on press of Print button
        $('#printBox').on('click', function () {
            $('#printBox').hide()
            $('#backToForm').hide()
            window.print();
            $('#printBox').show()
            $('#backToForm').show()
        })

        $('#proceedWithoutCalculation').on('click', async function () {
            if ($('#hiddenCalculationType').text() == 'reduction') {
                $('#calculationErrorModal').css('display', 'none')
                let reductionObj = await requestToCustomFunction('reduction')
                if (reductionObj) {
                    await setValuesToZoho(reductionObj, 'reduction') && createReductionSheet(reductionObj)

                }
            }
            if ($('#hiddenCalculationType').text() == 'measure') {
                $('#calculationErrorModal').css('display', 'none')
                let obj = await requestToCustomFunction('measure')
                if (obj) {
                    // await ReductionNumberCreator();
                    obj['Number'] = $('#LocationNumber').val() + ' of ' + reductionNumber.total + ' ' + (obj.Location ? '  (' + obj.Location + ')' : '');
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

        $('#submitLA').on('click', async function () {
            if (checkReduceRequiredFields()) {
                let reductionObj = {}
                if (isCalculated) {
                    if (isUpdatedAfterCalculated) {
                        $('#hiddenCalculationType').html('reduction')
                        $('#calculationErrorModal').css('display', 'block')
                    } else {
                        $('#submitLA').prop("disabled", true);
                        reductionObj = await requestToCustomFunction('reduction')
                        if (!jQuery.isEmptyObject(reductionObj)) {
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
            let obj = {}
            if (checkReduceRequiredFields()) {
                if (isCalculated) {
                    if (isUpdatedAfterCalculated) {
                        $('#hiddenCalculationType').html('measure')
                        $('#calculationErrorModal').css('display', 'block')
                    } else {
                        $('#measureFields').prop("disabled", true);
                        obj = await requestToCustomFunction('measure')
                        if (!jQuery.isEmptyObject(obj)) {
                            // await ReductionNumberCreator();
                            obj['Number'] = $('#LocationNumber').val() + ' of ' + reductionNumber.total + (obj.Location ? '(' + obj.Location + ')' : '');
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

        $('#backToForm').on('click', function () {
            $('#SolarShadeReduction').remove()
            $('#SolarShadeMeasureSheet').remove()
            $('#backToForm').hide()
            $('#printBox').hide()
            $('#measureFields').css('display', 'block')
            $('#measureFields').prop("disabled", false);
            $('#submitLA').css('display', 'block')
            $('#submitLA').prop("disabled", false);
            $('#mainTitle').show()
            $('#LA').show()
        })
        //************************************************************************************
        //Functions***************************************************************************
        // Check Required Feilds before calculate
        function checkReduceRequiredFields() {
            let result = true
            CalcRequiredFields.forEach(function (e) {
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

        async function setValuesToZoho(resObj, resType) {
            let data = { Reduction_Fields: {} }
            SolarShadeFields.forEach(item => {
                if (!item.orderLevel) {
                    item.reductionField ? (data.Reduction_Fields[item.zohoName] = $('#' + item.id).val()) :
                        item.type !== 'checkbox' ? (data[item.zohoName] = $('#' + item.id).val()) : (data[item.zohoName] = $('#' + item.id).is(":checked"))
                }
            })
            data.id = orderItems[0].id;
            data.Reduction_Fields.FabricYardage = resObj['Total Yardage']
            data.Fabric_Yardage = resObj['Total Yardage']
            data.Reduction_Fields = JSON.stringify(data.Reduction_Fields)
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
                $('#saveFailedErrortext').html('Error Message: ' + itemsUpdateRes.data[0].message)
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

        // function createReductionSheetDataRows(dataArray, printObject) {
        //     let temp = ''
        //     dataArray.forEach(item => {
        //         temp = temp +
        //             `<div class="patioRow rowSpacing">
        //             <p class='labelStyle'>${item.showName}:  </p>
        //             <p class='valueStyle'>${item.name !== 'Number' ? printObject[item.name] + (item.secondName ? " - " + printObject[item.secondName] : '') + (item.unit ? " " + item.unit : '')
        //                 : reductionNumber.index + ' of ' + reductionNumber.total + ' (' + printObject['Location'] + ')'}</p>
        //         </div>`
        //     })
        //     return temp
        // }

        async function requestToCustomFunction(type) {
            let reductionObject = {
                functionType: type,
                Number: "",
                type: orderItems[0].Item_Type.name,
            }
            SolarShadeFields.forEach(async item => {
                if (item.type === 'multiselect') {
                    reductionObject[item.reductionName] = await MultiSelect.SelectedList(item.id)
                }
                else {
                    reductionObject[item.reductionName] = item.type !== 'checkbox' ? $('#' + item.id).val() : $('#' + item.id).is(':checked')
                }
            })
            let func_name = "solarShadeReduction";
            let req_data = {
                "arguments": JSON.stringify({
                    "AMPFactorDetail": reductionObject
                })
            };
            console.log(reductionObject, 'data');
            let res = await apicall.reductionFunction(func_name, req_data)
            let temp = JSON.parse(res.details.output)
            console.log(JSON.parse(temp.details.output));
            return JSON.parse(temp.details.output)
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
            <div id='SolarShadeMeasureSheet' >
            <div class="d-flex justify-content-center " style="width:40%; float:right; position: relative">
               ${measureObject.RollerTube.charAt(0) !== '1' ? '<div id="splitPanel">****SPLIT PANEL****</div>' : ''}
             </div>
                <div class="mainInfoWrapper">
                    <div class="infoCol_1">
                        ${measureCreator.mainMeasureTabel(SolarShadeMeasureTabelInfo, measureObject, SolarShadeMeasureExtraFields)}
                        ${measureCreator.measuresheetNoteSection(measureObject, 'pswMeasureNoteheight')}
                        ${measureCreator.measuresheetImage(measureObject)}
                    </div>    
                    <div class="infoCol_2">
                    ${measureCreator.measuresheetMountingTabelPSW(measureObject)}
                    ${measureCreator.measuresheetOtherInfoTabel(SolarShadeMeasureOtherInfoFields, measureObject)}
                    ${measureCreator.measuresheetCrank(measureObject)}
                    ${measureCreator.measuresheetInstallInfo(order[0])}
                    </div>
                </div>         
                <div class='footerRow footerStyle' >
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
        async function createReductionSheet(printObject) {
            // await ReductionNumberCreator()
            $('#submitLA').css('display', 'none')
            $('#measureFields').css('display', 'none')
            // let printDiv = $(`
            // <div id='SolarShadeReduction' >
            //     <div class='dataWrapper'>
            //             <div class='patioRow'>
            //             <div class='colLarge'>
            //             <div class='colTitle'>Building Information</div>
            //                     ${createReductionSheetDataRows(SolarShadeFabricationInformationFields, printObject)}
            //                 </div>
            //                 <div class="d-flex justify-content-end">
            //                 ${printObject.RollerTube.charAt(0) !== '1' ? '<div id="splitPanel">****SPLIT PANEL****</div>' : ''}
            //              </div>
            //                 <div class='colSmall'>
            //                 <div class='colTitle'>Sewing Information</div>
            //                      ${createReductionSheetDataRows(SolarShadeSewingInformationFields, printObject)}
            //                      <div class="patioRow rowSpacing">
            //                             <p class='labelStyle'>${printObject['TopBottom']}</p>
            //                      </div>
            //                 </div>
            //             </div>
            //             <p class="awningMeasureNotes">${printObject.Note ? "**" + printObject.Note : ''}</p>
            //             <div class="imageContainer">
            //                 <img class='measureImage' src=${"./img/" + printObject.txtProductImageID + ".png"} alt="pswImage" />
            //             </div>
            //             <div class="NoteSpot"></div>
            //             <div class='patioRow footerStyle' >
            //                 ${measure_reductionSheetFooter('reduction')}
            //             </div>
            //     </div>
            // </div>
            // `);

            // let tmpHeader = Header('reduction ', orderItems[0], order[0], installContactInfo[0], contactInfo[0], propertyInfo[0])
            // printDiv.prepend(tmpHeader)
            printObject['Number'] = $('#LocationNumber').val() + ' of ' + reductionNumber.total + ' ' + (printObject.Location ? ' (' + printObject.Location + ')' : '');
            Reductionsheets['Solar Shade'](printObject, orderItems[0], order[0], installContactInfo[0], contactInfo[0], propertyInfo[0])
            $('#LA').hide();
            $('#mainTitle').hide();
            $('#printBox').show()
            $('#backToForm').show()
            // $('#mainContent').prepend(printDiv)
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
            let res = await requestToCustomFunction('calculate')
            //update form fields after Calculation
            $('#QTY').val(res.Qty)
            $('#CalculatedInstallTime').val(res.InstallTime)
            $('#Grain').val(res.Grain)
            $('#MotorSize option[value="' + res.Motor + '"]').prop('selected', true);
            $('#NumberOfBrackets').val(res.Number_of_Brackets);
            res.Qty > 1 ? $('#OperatorSideWidth').prop('disabled', false) : $('#OperatorSideWidth').prop('disabled', true);
            console.log(res);
            isCalculated = true;
            isUpdatedAfterCalculated = false;
        }

    }
});



