
jQuery(function ($) {
  let firstTime = true;
  let mainOrder, contactInfo, propertyInfo, installContactInfo, ReductionFields,
    Shade_Reduction_Fields_Def, oldOrderItem, parentOrderItems, pageNumber;
  let isUpdatedAfterCalculated = false;
  let isCalculated = false;
  var options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  };

  getData()
  function getData() {
    ZOHO.embeddedApp.on("PageLoad", async function (data) {
      if (firstTime) {
        firstTime = false;        
        // AwningReductionaSolarShade_Get Org Variable Fabric Selection
        Shade_Reduction_Fields_Def = (await ZOHO.CRM.API.getOrgVariable("Shade_Reduction_Fields_Def")).Success.Content;
        // AwningReductionPSW _Get Order Items_ get and set data into fields
        await ZOHO.CRM.API.getRecord({
          Entity: "Order_Items",
          RecordID: data.EntityId[0],
        }).then(async function (orderItems) {
          console.log(orderItems);
          let orderItem = orderItems.data[0]
          oldOrderItem = orderItem;

             //get orders for coverSheet feilds
             await ZOHO.CRM.API.getRecord({
              Entity: "Deals",
              RecordID: orderItem.Order.id,
            }).then(async function (res) {
              order = res.data[0];
              console.log(order,'delas',orderItem.Order.id,"order");
            })
            

          let mainDiv = $('#mainContent')

          // Contact & Property
          if (orderItem.Product_Category.includes('Patio Sun and Wind')) {
            $('#mainTitle').html(orderItem.Product_Category)
            $('#submitLA').prop("disabled", false);

            //create Awning Reduction Form - for PSW type
            let formDiv = createAwningReductionForm('psw');
            mainDiv.prepend(formDiv)

            if (oldOrderItem.Loc_No) {
              // get pageNumber
              pageNumber = await checkNextNumber();
              pageNumber.index = oldOrderItem.Loc_No;
              // set to number field
              $('#NumberInput').val(oldOrderItem.Loc_No)
            } else {
              // determine number field
              pageNumber = await checkNextNumber();
              // set to number field
              $('#NumberInput').val(pageNumber.index)
            }
            //set Location
            if(orderItem.Location){
              $('#Location').val(orderItem.Location)
              }

            //AwningReductionPSW_Get Main Order
            await ZOHO.CRM.API.getRecord({
              Entity: "Deals",
              RecordID: oldOrderItem.Order.id
            }).then(async function (main) {
              mainOrder = main.data[0]
              //AwningReductionPSW_Get Contact Record
              await ZOHO.CRM.API.getRecord({
                Entity: "Contacts",
                RecordID: mainOrder.Contact_Name.id
              }).then(async function (contactData) {
                contactInfo = contactData.data[0];
                //AwningReductionPSW_Get Properties
                await ZOHO.CRM.API.getRecord({
                  Entity: "Properties",
                  RecordID: mainOrder.Property.id
                }).then(async function (propertyData) {
                  propertyInfo = propertyData.data[0];
                  //AwningReductionPSW_Get Install Contacts
                  if (mainOrder.Install_Contact) {
                    await ZOHO.CRM.API.getRecord({
                      Entity: "Contacts",
                      RecordID: mainOrder.Install_Contact.id
                    }).then(function (installData) {
                      installContactInfo = installData.data[0]
                    });
                  }
                });
              })
            });

            // on change required fields, calculate again!
            $('.requuiredField').on('change', function () {
              if (isCalculated) {
                isUpdatedAfterCalculated = true;
              }
            })

            //on change shade openness create Shade Fabric Width optopn array
            $('#shadeOpenness').on('change', function () {
              createShadeFabricWidthArray()
            })
            // on change crank size to custom active/deactive custom Input 
            $('#crankSize').on('change', function () {
              if ($('#crankSize').val() == 'Custom') {
                $('#customCrankSize').prop("disabled", false);
              } else {
                $('#customCrankSize').val('')
                $('#customCrankSize').prop("disabled", true);
              }
            });

             //create coversheet options
             ZOHO.CRM.META.getFields({ Entity: "Deals" }).then(async function (data) {
              let dataArray = [{ apiName: 'Awning_Coversheet_Picklist', id: 'CoversheetPick' }]
              await createSelectDropDowns(data.fields, dataArray)
              await MultiSelectHandler()
               $('#coversheetNote').val(order.Reduction_Notes)
              jQuery('.multiSelect').each(function(e) {
                var self = jQuery(this);
                var field = self.find('.multiSelect_field');
                var fieldOption = field.find('option');
                var dropdown = self.find('.multiSelect_dropdown');
                var list = self.find('.multiSelect_list');
                var option = self.find('.multiSelect_option');
                var optionText = self.find('.multiSelect_text');
                
                dropdown.attr('data-multiple', 'true');
                list.css('top', dropdown.height() + 5);
                order.Awning_Coversheet_Picklist.length>0 && order.Awning_Coversheet_Picklist.forEach(item=>{
                  self.addClass('-selected');
                  field.find('option:contains(' + item + ')').prop('selected', true);
                  list.find('.multiSelect_option:contains(' + item + ')').addClass('-selected');
                  list.css('top', dropdown.height() + 5).find('.multiSelect_noselections').remove();
                  if (dropdown.children(':visible').length === 0) {
                    dropdown.removeClass('-hasValue');
                  }
                  dropdown.append(function(e) {
                    return jQuery('<span class="multiSelect_choice">'+ item +'<img  id="tagCloseButton" src="./img/Close.svg"/></span>').click(function(e) {
                      var self = jQuery(this);
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
                  $('#multiSelectWrapper').css('height', (Math.ceil($('.multiSelect_dropdown').height())+100)+"px" )
                  list.css('top', dropdown.height() + 5);
                  if (!option.not('.-selected').length) {
                    list.append('<h5 class="multiSelect_noselections">No Selections</h5>');
                  }
                });
              })
            })
            // get and set options of dropdowns
            ZOHO.CRM.META.getFields({ Entity: "Order_Items" }).then(async function (data) {

              let dataArray = [
                { apiName: 'PSW_Frame_Color', id: 'frameColor' },
                { apiName: 'Shade_Curtain_Color', id: 'fabricColor' },
                { apiName: 'Shade_Curtain_Openness', id: 'shadeOpenness' },
                { apiName: 'Mounting_type', id: 'mountType' },
                { apiName: 'Mounting_Surface', id: 'mountSurface' },
                { apiName: 'Motor_Type', id: 'motorType' },
                { apiName: 'Motor_Size', id: 'motorSize' },
                { apiName: 'Motor_Crank_Side', id: 'motorCrankSide' },
                { apiName: 'Plug_Type', id: 'plugType' },
                { apiName: 'Crank_Size', id: 'crankSize' },
                { apiName: 'Track_Type', id: 'trackGuide' },

              ]

              createSelectDropDowns(data.fields, dataArray)

              // Switch-TX
              let switchTXArray = JSON.parse(Shade_Reduction_Fields_Def)["Switch-TX"]
              switchTXArray.unshift('-None-')
              let $switchTXDiv = $('#switchTX')
              $.each(switchTXArray, function (key, val) {
                $switchTXDiv.append(
                  $("<option />").val(val).text(val)
                );
              });

              //Grain
              let GrainOptionsArray = ['Vertical', 'Horizontal']
              let $GrainDiv = $('#Grain')
              $.each(GrainOptionsArray, function (key, val) {
                $GrainDiv.append(
                  $("<option />").val(val).text(val)
                );
              });

              //Shade Fabric Width
              // let shadeFAbricArray = JSON.parse(Shade_Reduction_Fields_Def)["Openness-Shade Fabric Width"]
              // console.log($('#shadeOpenness').val(), "ss");
              // if ($('#shadeOpenness').val() !== '-None-' && $('#shadeOpenness').val() !== '') {
              //   shadeFAbricArray.unshift('-None-')
              //   let object = shadeFAbricArray.find(item => { console.log(Object.keys(item), Object.keys(item)[0]); Object.keys(item)[0] === $('#shadeOpenness').val() })
              //   console.log(object[[$('#shadeOpenness').val()]], extractedArray);
              //   let $fabricWidthDiv = $('#ShadeFabricWidth')
              //   $.each(shadeFAbricArray[$('#shadeOpenness').val()], function (key, val) {
              //     console.log(key, val, "shadeFabric width option create");
              //     $fabricWidthDiv.append(
              //       $("<option />").val(val).text(val)
              //     );
              //   });
              // }
              // else {
              //   console.log('was none');
              //   let $fabricWidthDiv = $('#ShadeFabricWidth');
              //   $fabricWidthDiv.append(
              //     $("<option />").val('-None-').text('-None-') // createShadeFabricWidthArray()
              //   );
              // }


              //set default values of form
              if (orderItem.Reduction_Fields) {
                ReductionFields = orderItem.Reduction_Fields ? orderItem.Reduction_Fields : "";
                let jsonObject = JSON.parse(ReductionFields);
                let tmpArray = [
                  { Reduction_Field: 'switch-TX', id: 'switchTX', type: 'dropdown' },
                  { Reduction_Field: 'Note', id: 'reductionNote', type: 'input' },
                  { Reduction_Field: 'Override_Install_Time', id: 'OverrideInstallTime', type: 'input' },
                  { Reduction_Field: 'Location', id: 'Location', type: 'input' },
                  { Reduction_Field: 'Grain', id: 'Grain', type: 'dropdown' },
                  { Reduction_Field: 'ShadeFabricWidth', id: 'ShadeFabricWidth', type: 'dropdown' },
                  { Reduction_Field: 'OperatorSideUnitWidth', id: 'OperatorSideWidth', type: 'input' },
                  { Reduction_Field: 'QTY', id: 'QTY', type: 'input' },
                  { Reduction_Field: 'customCrankSize', id: 'customCrankSize', type: 'input' },
                ]

                setReductionFields(jsonObject, tmpArray)
              } else {
                ReductionFields = '{}';
              }
              $('#widthIn').val(orderItem.Shade_Width ? orderItem.Shade_Width : '')
              $('#dropIn').val(orderItem.Shade_Drop ? orderItem.Shade_Drop : '')
              $('#mountHeight').val(orderItem.Mounting_Height ? orderItem.Mounting_Height : '')
              $('#motionSensor').prop('checked', orderItem.Motion_Sensor)
              $('#customBracket').prop('checked', orderItem.Custom_bracket_for_LHP_to_manufacture)
              $('#mountHeight').val(orderItem.Mounting_Height)
              $('#Hood').prop('checked', orderItem.PSW_Hood)
              $('#customCrankSize').prop("disabled", true);
              $('#calculatedInstallTime').val(orderItem.Install_Time ? orderItem.Install_Time : '')
              $('#trackGuide').val(orderItem.Track_Type ? orderItem.Track_Type : null)
              $('#QTY').val() > 1 ? $('#OperatorSideWidth').prop('disabled', false) : $('#OperatorSideWidth').prop('disabled', true)
              if (orderItem.PSW_Frame_Color) {
                $('#frameColor option[value="' + orderItem.PSW_Frame_Color + '"]').prop('selected', true);
              }
              if (orderItem.Mounting_type) {
                $('#mountType option[value="' + orderItem.Mounting_type + '"]').prop('selected', true);
              }
              if (orderItem.Mounting_Surface) {
                $('#mountSurface option[value="' + orderItem.Mounting_Surface + '"]').prop('selected', true);
              }
              if (orderItem.Motor_Type) {
                $('#motorType option[value="' + orderItem.Motor_Type + '"]').prop('selected', true);
              }
              if (orderItem.Motor_Size) {
                $('#motorSize option[value="' + orderItem.Motor_Size + '"]').prop('selected', true);
                isCalculated = true;
              }
              if (orderItem.Motor_Crank_Side) {
                $('#motorCrankSide option[value="' + orderItem.Motor_Crank_Side + '"]').prop('selected', true);
              }
              if (orderItem.Plug_Type) {
                $('#plugType option[value="' + orderItem.Plug_Type + '"]').prop('selected', true);
              }

              if (orderItem.Crank_Size) {
                $('#crankSize option[value="' + orderItem.Crank_Size + '"]').prop('selected', true);
                if ($('#crankSize').val() == 'Custom') {
                  $('#customCrankSize').prop("disabled", false);
                }
              }
              if (orderItem.Shade_Width) {
                $('#ShadeFabricWidth option[value="' + orderItem.Shade_Width + '"]').prop('selected', true);
              }

              if (orderItem.Shade_Curtain_Openness) {
                $('#shadeOpenness option[value="' + orderItem.Shade_Curtain_Openness + '"]').prop('selected', true);
                createShadeFabricWidthArray()
                // if (orderItem.ReductionFields) {
                //   setReductionFields(JSON.parse(orderItem.ReductionFields), [{ Reduction_Field: 'customCrankSize', id: 'customCrankSize', type: 'input' }])
                // }
              }

              if (orderItem.Shade_Curtain_Color) {
                $('#fabricColor option[value="' + orderItem.Shade_Curtain_Color + '"]').prop('selected', true);
              }
            });

            //multiselect
            function MultiSelectHandler(){ 
              jQuery('.multiSelect').each(function(e) {
              var self = jQuery(this);
              var field = self.find('.multiSelect_field');
              var fieldOption = field.find('option');
              console.log(fieldOption,'option');
          
              field.hide().after(`<div class="multiSelect_dropdown"></div>
                                  <ul class="multiSelect_list"></ul>
                                  <span class="multiSelect_arrow"></span>`);
                                  
                                  console.log('before fie');
                fieldOption.each(function(e) {
                console.log($,'content');
                $('.multiSelect_list').append(`<li class="multiSelect_option" data-value="`+jQuery(this).val()+`">
                                                      <a class="multiSelect_text">`+jQuery(this).text()+`</a>
                                                    </li>`);
              });
              
              var dropdown = self.find('.multiSelect_dropdown');
              var list = self.find('.multiSelect_list');
              var option = self.find('.multiSelect_option');
              var optionText = self.find('.multiSelect_text');
              
              dropdown.attr('data-multiple', 'true');
              list.css('top', dropdown.height() + 5);
              
              option.click(function(e) {
                console.log($('.multiSelect_dropdown').height(),'heighttt');
                var self = jQuery(this);
                e.stopPropagation();
                self.addClass('-selected');
                field.find('option:contains(' + self.children().text() + ')').prop('selected', true);
                $('#multiSelectWrapper').css('height', (Math.ceil($('.multiSelect_dropdown').height()+100))+"px" )
                dropdown.append(function(e) {
                  return jQuery('<span class="multiSelect_choice">'+ self.children().text() +'<img  id="tagCloseButton" src="./img/Close.svg"/></span>').click(function(e) {
                    var self = jQuery(this);
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
              
              dropdown.click(function(e) {
                e.stopPropagation();
                e.preventDefault();
                dropdown.toggleClass('-open');
                list.toggleClass('-open').scrollTop(0).css('top', dropdown.height() + 5);
              });
              
              jQuery(document).on('click touch', function(e) {
                  if (dropdown.hasClass('-open')) {
                      dropdown.toggleClass('-open');
                      list.removeClass('-open');
                  }
              });
            });
          }
            // End of Getting & Setting Zoho Fields
          }
        })

        // creating Shade Fabric Width options based on shade openness values 
        function createShadeFabricWidthArray() {
          let shadeFAbricArray = JSON.parse(Shade_Reduction_Fields_Def)["Openness-Shade Fabric Width"]
          if ($('#shadeOpenness').val() !== '-None-' && $('#shadeOpenness').val() !== '') {
            shadeFAbricArray.unshift('-None-')
            let index = shadeFAbricArray.findIndex(item => Object.keys(item)[0] == $('#shadeOpenness').val())
            let $fabricWidthDiv = $('#ShadeFabricWidth');
            $fabricWidthDiv.empty();
            $.each(shadeFAbricArray[index][$('#shadeOpenness').val()], function (key, val) {
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

        //create dropdowns with received options
        function createSelectDropDowns(fields, dataArray) {
          let i;
          for (i = 0; i < dataArray.length; i++) {
            let selectArray = fields.filter(function (value, index, arr) {
              if (value.api_name == dataArray[i].apiName) {
                return value.pick_list_values;
              }
            });
            var $selectDiv = $("#" + dataArray[i].id);
            if (selectArray.length > 0) {
              $.each(selectArray[0].pick_list_values, function (key, val) {
                $selectDiv.append(
                  $("<option />").val(val.display_value).text(val.display_value)
                );
              });
            }
          }
        }

        function setReductionFields(jsonObject, dataArray) {
          let i;
          for (i = 0; i < dataArray.length; i++) {
            if (dataArray[i].type == 'input') {
              $('#' + dataArray[i].id).val(jsonObject[dataArray[i].Reduction_Field])
            }
            if (dataArray[i].type == 'dropdown') {
              // console.log(dataArray[i].id + ' option[value="' + jsonObject[dataArray[i].Reduction_Field] + '"]', "shade");
              $('#' + dataArray[i].id + ' option[value="' + jsonObject[dataArray[i].Reduction_Field] + '"]').prop('selected', true);
            }
          }
        }

        // Check Required Feilds before calculate
        function checkReduceRequiredFields() {
          let response = false;
          if ($('#widthIn').val() !== '' &&
            $("#motorType").val() !== '-None-' &&
            // $('#motorCrankSide').val() !== '-None-' &&
            $('#shadeOpenness').val() !== '-None-'
            && $('#ShadeFabricWidth').val() !== '-None-') {
            response = true;
          }
          return response;
        }

        //applies css of required feilds error
        function addErrorClass() {
          // $('#motorCrankSide').css('border', '1px solid red');
          $("#motorType").css('border', '1px solid red');
          $("#ShadeFabricWidth").css('border', '1px solid red');
          $("#shadeOpenness").css('border', '1px solid red');
          $("#widthIn").css('border', '1px solid red');
          alert('Fill The Required Fields!')
        }

        //removes css of required feilds error
        function removeErrorClass() {
          // $('#motorCrankSide').css('border', '1px solid rgb(239, 239, 239)');
          $("#motorType").css('border', '1px solid rgb(239, 239, 239)');
          $("#ShadeFabricWidth").css('border', '1px solid rgb(239, 239, 239)');
          $("#widthIn").css('border', '1px solid rgb(239, 239, 239)');
          $("#shadeOpenness").css('border', '1px solid rgb(239, 239, 239)');
        }

        // ON CLICK Reduce BUTTON
        $('#submitLA').on('click', async function () {
          if (checkReduceRequiredFields()) {
            removeErrorClass();
            // is it calculated?
            if (isCalculated || $('#motorSize').val() != '-None-') {
              // did it change after calculation?
              if (isUpdatedAfterCalculated) {
                $('#hiddenCalculationType').html('reduction')
                $('#calculationErrorModal').css('display', 'block')
              } else {
                reduceFunction();
                
              }
            } else {
              // await calculateFunction()
              // await reduceFunction()
              $('#hiddenCalculationType').html('reduction')
              $('#calculationErrorModal').css('display', 'block')
            }
          }
          else {
            addErrorClass();
          }
        
        });

        // ON CLICK Measure BUTTON
        $('#measureFields').on('click', async function () {
          if (checkReduceRequiredFields()) {
            removeErrorClass();
            if (isCalculated || $('#motorSize').val() != '-None-') {
              if (isUpdatedAfterCalculated) {
                $('#hiddenCalculationType').html('measure')
                $('#calculationErrorModal').css('display', 'block')
              } else {
                measureFunction();
               
              }
            } else {
              // await calculateFunction()
              // await measureFunction()
              $('#hiddenCalculationType').html('measure')
              $('#calculationErrorModal').css('display', 'block')
            }
          }
          else {
            addErrorClass();
          }
        })

        // click on sub-measure button
        $('#refreshMeasure').on('click', async function () {
          if (checkReduceRequiredFields()) {
            removeErrorClass();
            calculateFunction();
          }
          else {
            addErrorClass();
          }
        })

        // reduce Function
        async function reduceFunction() {
          // $('#submitLA').prop("disabled", true);
          $('#submitLA').prop("value", "Reducing...");
          $('#submitLA').prop("disabled", true);

          if (oldOrderItem.Product_Category.includes('Patio Sun and Wind')) {
            //AwningReductionPSW_request to MKZ to process data for reduction
            let reqObject = await requestToMKZ('reduction')

            //creating Reuction Sheet 
            await createReductionSheet(reqObject)

            //set installtime in psw modal
            $('#calculatedInstallTime').val(reqObject.InstallTime)
            $('.submitLAWrapper').hide();
            // Reduction Field
            let jsonObject = JSON.parse(ReductionFields);
            jsonObject['switch-TX'] = $('#switchTX').val();
            jsonObject.Note = $('#reductionNote').val();
            jsonObject.Grain = $('#Grain').val();
            jsonObject.Override_Install_Time = $('#OverrideInstallTime').val()
            jsonObject.Location = $('#Location').val()
            jsonObject.OperatorSideUnitWidth = $('#OperatorSideWidth').val()
            jsonObject.customCrankSize = $('#customCrankSize').val()
            jsonObject.ShadeFabricWidth = $('#ShadeFabricWidth').val()
            jsonObject.QTY = $('#QTY').val()
            jsonObject.FabricYardage = reqObject['Total Yardage']
            jsonObject = JSON.stringify(jsonObject);

            let newObject = {
              Shade_Width: $('#widthIn').val(),
              Shade_Drop: $('#dropIn').val(),
              Reduction_Fields: jsonObject,
              PSW_Frame_Color: $('#frameColor').val() == "-None-" ? null : $('#frameColor').val(),
              Shade_Curtain_Color: $('#fabricColor').val() == "-None-" ? null : $('#fabricColor').val(),
              Shade_Curtain_Openness: $('#shadeOpenness').val() == "-None-" ? null : $('#shadeOpenness').val(),
              Mounting_Height: $('#mountHeight').val(),
              Mounting_type: $('#mountType').val() == "-None-" ? null : $('#mountType').val(),
              Mounting_Surface: $('#mountSurface').val() == "-None-" ? null : $('#mountSurface').val(),
              Custom_bracket_for_LHP_to_manufacture: $('#customBracket').is(":checked"),
              Motor_Type: $('#motorType').val(),
              Motor_Size: $('#motorSize').val(),
              Motor_Crank_Side: $('#motorCrankSide').val(),
              Plug_Type: $('#plugType').val(),
              Crank_Size: $('#crankSize').val(),
              PSW_Hood: $('#Hood').is(":checked"),
              Motion_Sensor: $('#motionSensor').is(":checked"),
              Track_Type: $('#trackGuide').val() == "-None-" ? null : $('#trackGuide').val(),
              Install_Time: $('#calculatedInstallTime').val(),
              Loc_No: $('#NumberInput').val()
            }

            let mergedObject = { ...oldOrderItem, ...newObject };

            //save total yardage in zoho after reduce
            mergedObject.Fabric_Yardage = reqObject['Total Yardage']

            // save result to Reduction_Result
            if (mergedObject.Reduction_Result) {
              let reductionResult = JSON.parse(mergedObject.Reduction_Result)
              reductionResult["reduction"] = reqObject;
              mergedObject.Reduction_Result = JSON.stringify(reductionResult)
            } else {
              let reductionResult = { "reduction": {}, "measure": {} }
              reductionResult["reduction"] = reqObject;
              mergedObject.Reduction_Result = JSON.stringify(reductionResult)
            }

            //AwningReductionPsw_Request to orderItem to update
            await ZOHO.CRM.API.updateRecord({
              Entity: "Order_Items",
              APIData: mergedObject,
              Trigger: ["workflow"]
            }).then(el => {
              console.log(el);
              let url = "https://crm.zoho.com/crm/org705881529/tab/CustomModule3/" + el.data[0].details.id;
              $('.submitLAWrapper').hide()
              // $('.submitLAWrapper').html("<a href=' " + url + "' target='_blank'>Open Order Item</a>")
            })

             //update coversheet fields in order
             let orderObject = {};
             let selectedArray = []
             jQuery('.multiSelect').each(function(e) {
               var self = jQuery(this);
               var field = self.find('.multiSelect_choice');
               let i 
               for(i=0; i < field.length;i++){
                 selectedArray.push( field[i].innerText)
               }
             })
             orderObject.id= order.id;
             orderObject.Awning_Coversheet_Picklist = selectedArray;
             orderObject.Reduction_Notes= $('#coversheetNote').val()
             console.log(orderObject,"order object");
             await ZOHO.CRM.API.updateRecord({
               Entity: "Deals",
               APIData: orderObject ,
               Trigger: ["workflow"]
             }).then(el => {
               console.log('order is updated');
             })

            
          }
        }

        //Calculate Function
        async function calculateFunction() {

          $('#refreshIcon').addClass('animationRefresh')
          setTimeout(function () {
            $('#refreshIcon').removeClass('animationRefresh')
          }, 2000);

          // let reqObject = await requestToMKZ('refresh')
          //AwningReductionPsw_request to MKZ to calculate
          let reqObject = await requestToMKZ('calculate')
          console.log(reqObject, 'calculated');

          //update UI after Calculation
          $('#calculatedInstallTime').val(reqObject.InstallTime)
          $('#QTY').val(reqObject.Qty)
          $('#Grain').val(reqObject.Grain)
          reqObject.Qty > 1 ? $('#OperatorSideWidth').prop('disabled', false) : $('#OperatorSideWidth').prop('disabled', true);
          $('#motorSize option[value="' + reqObject.Motor + '"]').prop('selected', true);
          isCalculated = true;
          isUpdatedAfterCalculated = false;
        }

        //Measure Function
        async function measureFunction() {
          $('#measureFields').prop("value", "Measuring...");
          $('#measureFields').prop("disabled",true);
          if (oldOrderItem.Product_Category.includes('Patio Sun and Wind')) {

            //AwningReductionPSW_request to MKZ to process data for measure
            let measureObject = await requestToMKZ('measure');

            //create measureSheet
            createMeasureSheet(measureObject);

            //set install time to psw modal
            $('#calculatedInstallTime').val(measureObject.InstallTime)
            $('.submitLAWrapper').hide();
            // Reduction Field
            let jsonObject = JSON.parse(ReductionFields);
            jsonObject['switch-TX'] = $('#switchTX').val();
            jsonObject.Note = $('#reductionNote').val();
            jsonObject.Override_Install_Time = $('#OverrideInstallTime').val()
            jsonObject.Location = $('#Location').val()
            jsonObject.Grain = $('#Grain').val();
            jsonObject.OperatorSideUnitWidth = $('#OperatorSideWidth').val()
            jsonObject.customCrankSize = $('#customCrankSize').val()
            jsonObject.ShadeFabricWidth = $('#ShadeFabricWidth').val()
            jsonObject.QTY = $('#QTY').val()
            jsonObject.FabricYardage = measureObject['Total Yardage']
            jsonObject = JSON.stringify(jsonObject);

            let newObject = {
              Shade_Width: $('#widthIn').val(),
              Shade_Drop: $('#dropIn').val(),
              Reduction_Fields: jsonObject,
              PSW_Frame_Color: $('#frameColor').val() == "-None-" ? null : $('#frameColor').val(),
              Shade_Curtain_Color: $('#fabricColor').val() == "-None-" ? null : $('#fabricColor').val(),
              Shade_Curtain_Openness: $('#shadeOpenness').val() == "-None-" ? null : $('#shadeOpenness').val(),
              Mounting_Height: $('#mountHeight').val(),
              Mounting_type: $('#mountType').val() == "-None-" ? null : $('#mountType').val(),
              Mounting_Surface: $('#mountSurface').val() == "-None-" ? null : $('#mountSurface').val(),
              Custom_bracket_for_LHP_to_manufacture: $('#customBracket').is(":checked"),
              Motor_Type: $('#motorType').val(),
              Motor_Size: $('#motorSize').val(),
              Motor_Crank_Side: $('#motorCrankSide').val(),
              Plug_Type: $('#plugType').val(),
              Crank_Size: $('#crankSize').val(),
              PSW_Hood: $('#Hood').is(":checked"),
              Motion_Sensor: $('#motionSensor').is(":checked"),
              Track_Type: $('#trackGuide').val() == "-None-" ? null : $('#trackGuide').val(),
              Install_Time: $('#calculatedInstallTime').val(),
              Loc_No: $('#NumberInput').val()
            }
            let mergedObject = { ...oldOrderItem, ...newObject };

            console.log(mergedObject, " merged");

            //save total yardage in zoho after measure
            mergedObject.Fabric_Yardage = measureObject['Total Yardage']

            // save result to Reduction_Result
            if (mergedObject.Reduction_Result) {
              let reductionResult = JSON.parse(mergedObject.Reduction_Result)
              reductionResult["measure"] = measureObject;
              mergedObject.Reduction_Result = JSON.stringify(reductionResult)
            } else {
              let reductionResult = { "reduction": {}, "measure": {} }
              reductionResult["measure"] = measureObject;
              mergedObject.Reduction_Result = JSON.stringify(reductionResult)
            }

            //AwningReductionPSW_Request to orderItem to update
            await ZOHO.CRM.API.updateRecord({
              Entity: "Order_Items",
              APIData: mergedObject,
              Trigger: ["workflow"]
            }).then(el => {
              console.log(el);
              let url = "https://crm.zoho.com/crm/org705881529/tab/CustomModule3/" + el.data[0].details.id;
              $('.submitLAWrapper').hide()
              // $('.submitLAWrapper').html("<a href=' " + url + "' target='_blank'>Open Order Item</a>")
            })

                    //update coversheet fields in order
                    let orderObject = order;
                    let selectedArray = []
                    jQuery('.multiSelect').each(function(e) {
                      var self = jQuery(this);
                      var field = self.find('.multiSelect_choice');
                      let i 
                      for(i=0; i < field.length;i++){
                        selectedArray.push( field[i].innerText)
                      }
                    })
                    orderObject.Awning_Coversheet_Picklist = selectedArray;
                    orderObject.Reduction_Notes= $('#coversheetNote').val()
                    console.log(orderObject,"order object");
                    await ZOHO.CRM.API.updateRecord({
                      Entity: "Deals",
                      APIData: orderObject ,
                      Trigger: ["workflow"]
                    }).then(el => {
                      console.log('order is updated');
                    })
                    
          }
        }

        //UI changes on events
        $('#backToForm').on('click', function () {
          $('#LAPrint').remove()
          $('#LAMeasureSheet').remove()
          $('#backToForm').hide()
          $('#printBox').hide()
          $('#measureFields').prop("disabled", false);
          $('#submitLA').prop("disabled", false);
          $('#mainTitle').show()
          $('.submitLAWrapper').show()
          $('#LA').show()
        })

        $('#proceedWithoutCalculation').on('click', function () {
          if ($('#hiddenCalculationType').text() == 'reduction') {
            $('#calculationErrorModal').css('display', 'none')
            reduceFunction()
          }
          if ($('#hiddenCalculationType').text() == 'measure') {
            $('#calculationErrorModal').css('display', 'none')
            measureFunction()
          }
        })

        $('#cancelProcess').on('click', function () {
          $('#calculationErrorModal').css('display', 'none')
          calculateFunction()
        })

        //request to MKZ Function for calculation
        async function requestToMKZ(type) {
          let finalResponse;
          let selectedArray=[];
          jQuery('.multiSelect').each(function(e) {
            var self = jQuery(this);
            var field = self.find('.multiSelect_choice');
            let i 
            for(i=0; i < field.length;i++){
              selectedArray.push( field[i].innerText)
            }
          })
          let reqObject = {
            // "CalcInstallTime": 1,
            "functionType": type,
            "OverrideInstallTime": $('#OverrideInstallTime').val() !== '' ? $('#OverrideInstallTime').val() : null,
            "Location" : $('#Location').val(),
            "type": oldOrderItem.Item_Type.name,
            "Width": $('#widthIn').val(),
            "MountHeight": $('#mountHeight').val(),
            "OperatorTypeId": $("#motorType").val(),
            "Side": $('#motorCrankSide').val(),
            "FrameColorText": $('#frameColor').val(),
            "MotorText": $('#motorSize').val(),
            "QTY": $('#QTY').val(),
            "Switch_TX": $('#switchTX').val(),
            "PlugOptionText": $('#plugType').val(),
            "CrankText": $('#crankSize').val(),
            "customcrank": $('#customCrankSize').val() == '' ? null : $('#customCrankSize').val(),
            "Hood": $('#Hood').is(":checked"),
            "CustomBrackets": $('#customBracket').is(":checked"),
            "SurfaceText": $('#mountSurface').val(),
            "TypeText": $('#mountType').val(),
            "Notes": $('#reductionNote').val(),
            "MotionSensor": $('#motionSensor').is(":checked"),
            "Drop": $('#dropIn').val(),
            "ShadeFabricColor": $('#fabricColor').val(),
            "FabricWidth": $('#ShadeFabricWidth').val(),
            "ShadeOpenness": $('#shadeOpenness').val(),
            "TrackType": $('#trackGuide').val(),
            'OperatorSideUnitWidth': $('#OperatorSideWidth').val(),
            'Grain': $('#Grain').val(),
            "Awning_Coversheet_Picklist": selectedArray

          }

          console.log(reqObject, 'Request To MKZ');

          // Request to MKZ
          var func_name = "pswreduction";
          var req_data = {
            "arguments": JSON.stringify({
              "AMPFactorDetail": reqObject
            })
          };
          //AwningReductionPSW_MKZPSWReduction
          await ZOHO.CRM.FUNCTIONS.execute(func_name, req_data)
            .then(function (data) {
              let response = JSON.parse(data.details.output);
              let printObject = JSON.parse(response.details.output);
              finalResponse = printObject;
              $('#QTY').val(finalResponse.QTY ? finalResponse.QTY : 1)
              $('#Grain').val(finalResponse.Grain ? finalResponse.Grain : 'Vertical')
              console.log(finalResponse, 'finalResponse');

            }).catch(function (error) {
              console.log(error, 'error');
            })
          return finalResponse;
        }

        //reduction sheet
        async function createReductionSheet(printObject) {
          console.log(printObject, 'printObject');
          let printDiv = $(`
          <div class="container" id="LAPrint">
          <div class="headerInfo" id="awningHeader"></div>
      
          <div class="headerInfo" id="awningHeader">
          </div>
          <div class="d-flex justify-content-center">
              ${printObject.RollerTube.charAt(0) !== '1' ? '<div id="splitPanel">****SPLIT PANEL****</div>' : ''}
          </div>
          <div class="mainInfoWrapper">
              <div class="infoCol">
                  <p class="infoColTitle">Building Information</p>
                  <div class="fabricInfoCol">
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Number: </div>
                          <div class="fabricInfoColItemLarge">${$('#NumberInput').val() != '' ? $('#NumberInput').val() : pageNumber.index} of ${pageNumber.total} ${printObject.Location && '(' + printObject.Location + ')'}</div>
                      </div>
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Type: </div>
                          <div class="fabricInfoColItemLarge">${printObject.Type}</div>
                      </div>
      
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Width: </div>
                          <div class="fabricInfoColItemLarge">${printObject.Width}</div>
                      </div>
      
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Drop: </div>
                          <div class="fabricInfoColItemLarge"> ${printObject.Drop}</div>
                      </div>
      
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Frame Color: </div>
                          <div class="fabricInfoColItemLarge">${printObject.FrameColor}</div>
                      </div>
      
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Roller Tube: </div>
                          <div class="fabricInfoColItemLarge">${printObject.RollerTube.split(',')[0] + ' In. '}</div>
                      </div>
      
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Bottom Pipe: </div>
                          <div class="fabricInfoColItemLarge"> ${printObject['Bottom Pipe']}</div>
                      </div>
      
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Track Type: </div>
                          <div class="fabricInfoColItemLarge">${printObject.TrackType}</div>
                      </div>
      
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Operator: </div>
                          <div class="fabricInfoColItemLarge">${printObject.Operator}</div>
                      </div>
      
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Controls: </div>
                          <div class="fabricInfoColItemLarge">${printObject.ControlDescription ? printObject.ControlDescription : ''}</div>
                      </div>
      
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Mount: </div>
                          <div class="fabricInfoColItemLarge">${printObject.MountingType ? printObject.MountingType : ''}${printObject.MountingMaterial && printObject.MountingMaterial !== '-None-' ? ' - ' + printObject.MountingMaterial : ''}</div>
                      </div>
      
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Hood: </div>
                          <div class="fabricInfoColItemLarge">${printObject.Hood}</div>
                      </div>
      
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Crank: </div>
                          <div class="fabricInfoColItemLarge">${printObject.Crank}</div>
                      </div>
      
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Motor: </div>
                          <div class="fabricInfoColItemLarge">${printObject.Motor}</div>
                      </div>
      
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Switch/TX: </div>
                          <div class="fabricInfoColItemLarge">${printObject.Switch_TX}</div>
                      </div>
      
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Cord/Plug: </div>
                          <div class="fabricInfoColItemLarge">${printObject.PlugOptionText}</div>
                      </div>
      
                  </div>
      
              </div>
              <div class="infoCol">
                  <p class="infoColTitle">Sewing Information</p>
                  <div class="fabricInfoCol">
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Total Yardage: </div>
                          <div class="fabricInfoColItemLarge">${printObject['Total Yardage']} Yards</div>
                      </div>
      
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Material: </div>
                          <div class="fabricInfoColItemLarge">${printObject.Material}</div>
                      </div>
      
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Panels cut length: </div>
                          <div class="fabricInfoColItemLarge">${printObject['Panel Cut Length']}</div>
                      </div>
      
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Final Fabric Width: </div>
                          <div class="fabricInfoColItemLarge">${printObject['Final Fabric Width']} </div>
                      </div>
      
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Downsize Length: </div>
                          <div class="fabricInfoColItemLarge">${printObject['Downsize Length']} </div>
                      </div>
      
                      <div class="fabricInfoItemWrapper">
                          <div class="fabricInfoColItemSmall">Final Fabric Length: </div>
                          <div class="fabricInfoColItemLarge">${printObject['Final Fabric Length']}</div>
                      </div>
                      <div class="fabricInfoColItem" style="max-width: 100%; flex: 1 0 100%;">${printObject['TopBottom']}</div>
      
                  </div>
              </div>
          </div>
      
          <p class="awningMeasureNotes">${printObject.Notes ? "**" + printObject.Notes : ''}</p>
          <div class="imageContainer">
              <img class='measureImage' src=${"./img/" + printObject.txtProductImageID + ".png"} alt="pswImage" />
          </div>
          <div class="mainFooterWrapper">
              <div class="footerInfo">
                  <div class="col">Sewn By:___________________ Date:____________________</div>
                  <div class="col">Assembled By:___________________ Date:____________________</div>
                  <div class="col">Form Revised ${new Date().getMonth() + 1}/${new Date().getFullYear()} Printed ${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}</div>
                  <div class="col">Final Prep By:___________________ Date:____________________</div>
              </div>
      
          </div>
      </div>
                `);

          //Hedaer function
          let tmpHeader = Header('reduction', oldOrderItem, mainOrder, installContactInfo, contactInfo, propertyInfo)
          // let tmpHeader = await createHeader('reduction');

          //UI changes
          printDiv.prepend(tmpHeader)
          $('#LA').hide();
          $('#mainTitle').hide();
          $('#printBox').show()
          $('#backToForm').show()
          $('#mainContent').prepend(printDiv)
           $('#pdfTest').show()
          window.scrollTo(0, 0)
        }

        //UI changes on event
        $('#printBox').on('click', function () {
          $('#printBox').hide()
          $('#backToForm').hide()
          window.print();
          $('#printBox').show()
          $('#backToForm').show()
        })
        
        //measure sheet
        async function createMeasureSheet(measureObject) {
          let utcTime = new Date(order.Scheduled_Date)
          let measureDiv = $(`
          <div class="container" id="LAMeasureSheet">
          <div class="mainInfoWrapper">
              <div class="infoCol_1">
                  <div class="tableHeader">
                      <p></p>
                      <p>Per Salesperson</p>
                      <p>Actual Measure</p>
                  </div>
      
                  <div class="table">
                      <div class="rowStyle">
                          <div class="innerTableCol_s">Number:</div>
                          <div class="innerTableCol_xl"> ${pageNumber.index} of ${pageNumber.total}  ${measureObject.Location && '(' + measureObject.Location + ')'}</div>
                      </div>
                      <div class="rowStyle">
                          <div class="innerTableCol_s">Type:</div>
                          <div class="innerTableCol_xl">${measureObject.Type}</div>
                      </div>
                      <div class="rowStyle">
                          <div class="innerTableCol_s">Total Width:</div>
                          <div class="innerTableCol_m">${measureObject.Width}</div>
                          <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                          <div class="innerTableCol_s">Fabric Width:</div>
                          <div class="innerTableCol_m">${measureObject['Final Fabric Width']}</div>
                          <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                          <div class="innerTableCol_s">Drop:</div>
                          <div class="innerTableCol_m"> ${measureObject.Drop}</div>
                          <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                          <div class="innerTableCol_s">Mount Height:</div>
                          <div class="innerTableCol_m">${measureObject.MountHeight}</div>
                          <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                          <div class="innerTableCol_s">Material:</div>
                          <div class="innerTableCol_m">${measureObject.Material}</div>
                          <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                          <div class="innerTableCol_s">Frame Color:</div>
                          <div class="innerTableCol_m">${measureObject.FrameColor}</div>
                          <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                          <div class="innerTableCol_s">Operator:</div>
                          <div class="innerTableCol_m">${measureObject.Operator}</div>
                          <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                          <div class="innerTableCol_s">Controls:</div>
                          <div class="innerTableCol_m">${measureObject.ControlDescription}</div>
                          <div class="innerTableCol_l"></div>
                      </div>
      
                      <div class="rowStyle">
                          <div class="innerTableCol_s">Track Type:</div>
                          <div class="innerTableCol_m">${measureObject.TrackType ? measureObject.TrackType : ''}</div>
                          <div class="innerTableCol_l"></div>
                      </div>
      
                      <div class="rowStyle">
                          <div class="innerTableCol_s">Extras:</div>
                          <div class="innerTableCol_xl" style="font-size: 12pt;" id="PSWinnerTableCol_xl">
                              <label for="Hood">
                                  <input type="checkbox" id="Hood" ${measureObject.Hood && measureObject.Hood !== "No Hood" ? 'checked' : ''} />
                                  Hood
                              </label>
                              <label for="CustBrackets">
                                  <input type="checkbox" id="CustBrackets" ${measureObject.CustomBrackets ? 'checked' : ''} />
                                  Cust.Brackets
                              </label>
                              <label for="plug">
                                  <input type="checkbox" id="plug" ${measureObject.PlugOptionText && measureObject.PlugOptionText !== "-None-" ? 'checked' : ''} />
                                  Plug
                              </label>
                              <label for="CordLength" id="CordLength" >
                                  Cord Length:
                                  <input type="text" value=${measureObject.PlugOptionText && measureObject.PlugOptionText !== "-None-" ? measureObject.PlugOptionText : ' '} />
                              </label>
                          </div>
                      </div>
                  </div>
                  <div class="awningMeasureNotes">Notes:
                      ${measureObject.Notes ? "** " + measureObject.Notes : ''}
                  </div>
              </div>
      
              <div class="infoCol_2">
                  ${measureObject.RollerTube.charAt(0) !== '1' ? '<div style="margin-top: -35px; width: 367px;" id="splitPanel">****SPLIT PANEL****</div>' : ''}
                  <div class="tables" style="min-height:80px" id='Mounting'>
                      <div class="tableTitle">Mounting Type/Material</div>
                      <div class="tableRow">
                          <div class="tableCol">
                              ${measureObject.MountingType == '-None-' || measureObject.MountingType == null ? `<p></p>` : `<p>${measureObject.MountingType}</p>`}
                          </div>
                          <div class="tableCol">
                              ${measureObject.MountingMaterial == '-None-' || measureObject.MountingMaterial == null ? `<p></p>` : `<p>${measureObject.MountingMaterial}</p>`}
                          </div>
                      </div>
      
                  </div>
                  <div class="tables">
                      <div class="tableTitle">
                          <p class="text-center mb-0">Other Information</p>
                      </div>
      
                      <div class="tablesRows">
                          <div class="tablesCols" style="border-right: 2px solid black;">Install Time</div>
                          <div class="tablesCols" style="border-right: 2px solid black;">${measureObject['InstallTime']}</div>
                          <div class="tablesCols"></div>
                      </div>
                      <div class="tablesRows">
                          <div class="tablesCols" style="border-right: 2px solid black;">Yardage:</div>
                          <div class="tablesCols" style="border-right: 2px solid black;">${measureObject['Total Yardage']}</div>
                          <div class="tablesCols"></div>
                      </div>
                      <div class="tablesRows">
                          <div class="tablesCols" style="flex-grow: 3;">Measured By:</div>
                          <div class="tablesCols"></div>
                          <div class="tablesCols"></div>
                      </div>
                      <div class="tablesRows">
                          <div class="tablesCols" style="flex-grow: 3;">Pulled By:</div>
                          <div class="tablesCols"></div>
                          <div class="tablesCols"></div>
                      </div>
                  </div>
      
                  <div class="tables">
                      <div class="cranckTitle">
                          <p>Hand Crank Size</p>
                      </div>
      
                      <div id="CreatedCrankSize">
                          ${createCrankSize()[0].outerHTML}
                      </div>
                      <label for="customCrankSize" id="customCrankSize" >
                          Custom Crank Size:
                          <input type="text" value=${measureObject.Crank && measureObject.Crank.split(' ')[2] == "Custom" && measureObject.Crank.split(' ')[0] != '-None-' ? measureObject.Crank.split(' ')[0] : ' '} />
                      </label>
                  </div>
      
                  <div class="tables">
                      <div class="cranckTitle">
                          <p>Install Information</p>
                      </div>
                      <label class="containerStyle">
                          <input id="install_check" type="checkbox" disabled />
                          <span class="checkmark"></span>
                      </label>
                      <div>
                          <label class="installInfoLabel"><b>Install Date:</b><span id="scheduled_date">${order.Scheduled_Date ? (('0' + (utcTime.getUTCMonth() + 1)).slice(-2) + '/' + ('0' + utcTime.getUTCDate()).slice('-2') + '/' + utcTime.getUTCFullYear()) : ""}</span></label>
                      </div>
                      <div>
                          <label class="installInfoLabel"><b>Time:</b><span id="i_a_w">${order.Install_Arrival_Window || ""}</span></label>
                      </div>
                      <div>
                          <label class="installInfoLabel">
                              <p style="margin: 0;" id="dispatched-to"><b>Installer:</b><span>${order.Installer || ""}</span></p>
                          </label>
                      </div>
                      <div>
                          <label class="installInfoLabel" id="number_of_Installers">
                              <p style="padding-top: 0px; margin-bottom: 0px; height: 30px; white-space: break-spaces !important;"><b>${(order.Number_of_Installers ? order.Number_of_Installers : "") || "    "} Ins/${(order.Install_Duration ? order.Install_Duration : "") || "    "} hours</b></p>
                          </label>
                      </div>
                  </div>
              </div>
          </div>
      
      
      
          <div id="PSWMeasure">
              <img class='measureImage' src=${"./img/" + measureObject.txtProductImageID + ".png"} alt="pswImage" />
          </div>
      
          <div class="mainFooterWrapper">
              <div class="footerInfo">
                  <div class='row mt-3 w-100'>
                      <div class="col">Customer Signature:_______________________________________</div>
                      <div class="col">Date:____________________</div>
                  </div>
                  <div class="row mt-3">
                      <div class="col">Signature indicates acceptance of Liberty Home Products measuring policies and final approval of all measurements.</div>
                  </div>
                  <div style="font-size: 22px; margin-top:15px">
                      ${new Date().getMonth() + 1}/${new Date().getDate()}/${new Date().getFullYear()}   ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}
      
                  </div>
              </div>
          </div>
      </div>
              `)
          //header Function 
          let sheetHeader = Header('measure', oldOrderItem, mainOrder, installContactInfo, contactInfo, propertyInfo)
          measureDiv.prepend(sheetHeader)
          // let sheetHeader = await createHeader('measure')
          
          //UI C
          $('#LA').hide();
          $('#mainTitle').hide();
          $('#printBox').show()
          $('#backToForm').show()
          $('#mainContent').prepend(measureDiv)
          window.scrollTo(0, 0)
        }
      }

      //create crank size function
      function createCrankSize() {
        let $crankDiv = $(`
          <div class="labelWrapper"></div>
        `)
        $('#crankSize').children('option').each(function () {
          let $innerCrankDiv = $(`
          <label for="${this.value}">
          <input type="checkbox" id="${this.value}" ${this.value == $('#crankSize').val() ? "checked" : ""} />
          ${this.value}
          </label>
        `)
          $crankDiv.append($innerCrankDiv)
        });
        // console.log($crankDiv, 'crankDiv');
        return $crankDiv;
      }

      //checkNextNumber Function
      async function checkNextNumber() {
        let responseObject = {
          total: 0,
          index: 0,
        }

        //AwningReductionPSW_get Order
        await ZOHO.CRM.API.getRelatedRecords({
          Entity: "Deals",
          RecordID: oldOrderItem.Order.id,
          RelatedList: "Order_Items"
        }).then(function (orderItems) {
          parentOrderItems = orderItems.data
          let sortedList = parentOrderItems.sort((a, b) => a.Name.localeCompare(b.Name));
          responseObject.total = sortedList.length;

          // responseObject.index = sortedList.findIndex(x => x.id == oldOrderItem.id) + 1;

          // determine next number:
          let numberedArray = parentOrderItems.filter(element => element.Loc_No != null)
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
        })
        console.log(responseObject, 'index Number!!!');
        return responseObject;
      }
    })
    ZOHO.embeddedApp.init();
  }
});




   // async function createHeader(type) {
      //   let Fabric_Ordered = oldOrderItem.Fabric_Ordered ? oldOrderItem.Fabric_Ordered : '';
      //   let $formHeader = $(`
      //  <div id="RetractableAwningId" style="font-size: 14pt; font-family: 'Roboto', sans-serif;"> 
      //   <div class='RetractableAwningTitleWrapper'>
      //   <img style="margin-top: 10px;" src="img/logo.jpeg" alt="logo">
      //   <p class="RetractableAwningTitle">${oldOrderItem.Product_Category} ${type == 'reduction' ? 'Production' : 'Measure'} Sheet</p>
      //   <p style="font-size: 20pt;font-weight: bold; margin-top: 10px;">${mainOrder.Deal_Name}</p>
      //   </div>
      //   <p style="text-align: center; font-size: 14pt; min-height: 14px;"></p>

      //   <div class="headerInfo">
      //   <div class="headerInfoItem_1">
      //   <div class="innerInfoLeft"><b>Job Address: </b></div>
      //    <div id="install-info">${installContactInfo && installContactInfo.Full_Name ? installContactInfo.Full_Name + '|' : ''} ${installContactInfo && installContactInfo.Phone ? "<span class='us-phone'>" + installContactInfo.Phone + "</span>" + " | " : ""} ${installContactInfo && installContactInfo.Mobile ? "<span class='us-phone'>" + installContactInfo.Mobile + "</span>" : ""}</div>
      //    <div id="contact-info">${contactInfo && contactInfo.Full_Name ? contactInfo.Full_Name + " | " : ""}
      //    ${contactInfo && contactInfo.Phone ? ("<span class='us-phone'>" + contactInfo.Phone + "</span>" + " | ") : ""}
      //    ${contactInfo && contactInfo.Mobile ? "" : "<br />"}
      //    ${contactInfo && contactInfo.Mobile ? "<span class='us-phone'>" + contactInfo.Mobile + "</span>" + "  <br>" : ""}
      //    ${propertyInfo && propertyInfo.Address_Line_1 ? (propertyInfo.Address_Line_1 + " <br>") : ""}
      //    ${propertyInfo && propertyInfo.Address_Line_2 ? (propertyInfo.Address_Line_2 + "<br>") : ""}
      //    ${propertyInfo && propertyInfo.City ? (propertyInfo.City + " ") : ""}
      //    ${propertyInfo && propertyInfo.State ? (propertyInfo.State + " ") : ""}
      //    ${propertyInfo && propertyInfo.Zip_Code ? (propertyInfo.Zip_Code + " ") : ""}</div>
      //   </div>

      //   <div class="headerInfoItem_2">
      //     <div class="innerInfoLeft"><b>Salesperson: </b><span class="innerInfoLeft">${mainOrder.Owner.name}</span></div>
      //     <div class="innerInfoLeft"><b>Order Date: </b><span class="innerInfoLeft">${mainOrder.Closing_Date ? new Date(mainOrder.Closing_Date).toLocaleString("en-US", options) : ''}</span></div>
      //     <div class="innerInfoLeft"><b>Measure Date: </b><span class="innerInfoLeft">${mainOrder.Scheduled_Measure_Date ? new Date(mainOrder.Scheduled_Measure_Date).toLocaleString("en-US", options) : ''}</span></div>
      //     ${type == 'reduction' ? '<div class="innerInfoLeft"><b>Fabric Ordered: </b><span class="innerInfoLeft">' + Fabric_Ordered + '</span></div>' : ''}
      //   </div>
      //   </div>
      //  </div> 
      //   `)
      //   $('.us-phone').mask('(000) 000-0000');

      //   return $formHeader;
      // }

        //function createAwningReductionForm() {
        //   let tmpDiv = $(`
        //         <div id="LA">
        //         <button class="accordion">Size</button>
        //         <div class="panel">
        //         <div class="wrapper">
        //         <div class="flexItemsInputs">
        //         <label for="widthIn">Width in Inches</label>
        //         <input id="widthIn" type="text" class='requuiredField' />
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="dropIn">Drop in Inches</label>
        //         <input id="dropIn" type="text"  />
        //         </div>

        //         </div>
        //         </div>

        //         <button class="accordion">Fabric/Styles</button>
        //         <div class="panel">
        //         <div class="wrapper">
        //         <div class="flexItemsInputs">
        //         <label for="frameColor">Frame Color</label>
        //         <select name="frameColor" id="frameColor"></select>
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="fabricColor">Fabric Color</label>
        //         <select name="fabricColor" id="fabricColor"></select>
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="shadeOpenness">Shade Openness</label>
        //         <select name="shadeOpenness" id="shadeOpenness"></select>
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="ShadeFabricWidth">Shade Fabric Width</label>
        //         <select name="ShadeFabricWidth" id="ShadeFabricWidth"></select>
        //         </div>

        //         </div>
        //         </div>

        //         <button class="accordion">Installation</button>
        //         <div class="panel">
        //         <div class="wrapper">
        //         <div class="flexItemsInputs">
        //         <label for="mountHeight">Mount Height</label>
        //         <input id="mountHeight" type="number" />
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label for="mountType">Mount Type</label>
        //         <select id="mountType" name="mountType"></select>
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label for="mountSurface">Mount Surface</label>
        //         <select id="mountSurface" name="mountSurface"></select>
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label class="customBracketCheckBox" for="customBracket">
        //          <input type="checkbox" id="customBracket" />
        //          Custom Bracket
        //         </label>
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="OverrideInstallTime">Override Install Time</label>
        //         <input id="OverrideInstallTime" type="number" />
        //         </div>
          

        //         </div>
        //         </div>

        //         <button class="accordion">Motor/Controler</button>
        //         <div class="panel">
        //         <div class="wrapper">
        //         <div class="flexItemsInputs">
        //         <label for="motorType">Operator Type</label>
        //         <select id="motorType" name="motorType" class='requuiredField'></select>
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="motorCrankSide">Motor/Crank Side</label>
        //         <select id="motorCrankSide" name="motorCrankSide" class='requuiredField'></select>
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label for="crankSize">Crank Size</label>
        //         <select id="crankSize" name="crankSize"></select>
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label for="customCrankSize">Custom Crank Size</label>
        //         <input id="customCrankSize" name="customCrankSize" />
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label for="plugType">Plug Type</label>
        //         <select id="plugType" name="plugType"></select>
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label for="switchTX">Switch / TX
        //         <select id="switchTX" name="switchTX"></select>
        //         </label>
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label for="trackGuide">Track Guide
        //         <select id="trackGuide" name="trackGuide"></select>
        //         </label>
        //         </div>

             

        //         </div>
        //         </div>

        //         <button class="accordion">Addons</button>
        //         <div class="panel">
        //         <div class="wrapper">

        //         <div class="flexItemsInputs">
        //         <label class="customBracketCheckBox" for="Hood">
        //         <input type="checkbox" id="Hood"  />
        //         Hood
        //         </label>
        //         </div>

        //         </div>
        //         </div>

        //         <button class="accordion">Note</button>
        //         <div class="panel">
        //         <div class="wrapper">
        //         <textarea id="reductionNote" type="text"></textarea>
        //         </div>
        //         </div>

        //         <button class="accordion">Calculation</button>
        //         <div class="panel">
        //         <div class="wrapper" style="position: relative;">

        //         <div class="flexItemsInputs">
        //         <label for="NumberInput">Location Number</label>
        //         <input id="NumberInput" type="number" />
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="motorSize">Motor Size</label>
        //         <select id="motorSize" name="motorSize" class='requuiredField' ></select>
        //         </div>
                
        //         <div class="flexItemsInputs">
        //         <label for="numberOfBrackets">Calculated Install Time</label>
        //         <input id="calculatedInstallTime" type="number" disabled />
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="QTY">QTY</label>
        //         <input id="QTY" type="number" class='requuiredField' value='1' disabled />
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="OperatorSideWidth">Operator Side Width</label>
        //         <input id="OperatorSideWidth" type="number" />
        //         </div>
             
        //         <div class="flexItemsInputs">
        //         <label for="Grain">Grain</label>
        //         <select name="Grain" id="Grain"></select>
        //         </div>

        //         <div class="flexItemsInputs" style="position: absolute; right: 0px; top: 160px;">
        //         <button class="refreshMeasureBtn" id="refreshMeasure">
        //         <img id="refreshIcon" src="./img/refresh.png" />
        //              Calculate
        //         </button>
        //         </div>

        //         </div>
        //         </div>

        //         </div>
        //         `)

        //   return tmpDiv;
        // }
        //function createAwningReductionForm() {
        //   let tmpDiv = $(`
        //         <div id="LA">
        //         <button class="accordion">Size</button>
        //         <div class="panel">
        //         <div class="wrapper">
        //         <div class="flexItemsInputs">
        //         <label for="widthIn">Width in Inches</label>
        //         <input id="widthIn" type="text" class='requuiredField' />
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="dropIn">Drop in Inches</label>
        //         <input id="dropIn" type="text"  />
        //         </div>

        //         </div>
        //         </div>

        //         <button class="accordion">Fabric/Styles</button>
        //         <div class="panel">
        //         <div class="wrapper">
        //         <div class="flexItemsInputs">
        //         <label for="frameColor">Frame Color</label>
        //         <select name="frameColor" id="frameColor"></select>
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="fabricColor">Fabric Color</label>
        //         <select name="fabricColor" id="fabricColor"></select>
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="shadeOpenness">Shade Openness</label>
        //         <select name="shadeOpenness" id="shadeOpenness"></select>
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="ShadeFabricWidth">Shade Fabric Width</label>
        //         <select name="ShadeFabricWidth" id="ShadeFabricWidth"></select>
        //         </div>

        //         </div>
        //         </div>

        //         <button class="accordion">Installation</button>
        //         <div class="panel">
        //         <div class="wrapper">
        //         <div class="flexItemsInputs">
        //         <label for="mountHeight">Mount Height</label>
        //         <input id="mountHeight" type="number" />
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label for="mountType">Mount Type</label>
        //         <select id="mountType" name="mountType"></select>
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label for="mountSurface">Mount Surface</label>
        //         <select id="mountSurface" name="mountSurface"></select>
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label class="customBracketCheckBox" for="customBracket">
        //          <input type="checkbox" id="customBracket" />
        //          Custom Bracket
        //         </label>
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="OverrideInstallTime">Override Install Time</label>
        //         <input id="OverrideInstallTime" type="number" />
        //         </div>
          

        //         </div>
        //         </div>

        //         <button class="accordion">Motor/Controler</button>
        //         <div class="panel">
        //         <div class="wrapper">
        //         <div class="flexItemsInputs">
        //         <label for="motorType">Operator Type</label>
        //         <select id="motorType" name="motorType" class='requuiredField'></select>
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="motorCrankSide">Motor/Crank Side</label>
        //         <select id="motorCrankSide" name="motorCrankSide" class='requuiredField'></select>
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label for="crankSize">Crank Size</label>
        //         <select id="crankSize" name="crankSize"></select>
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label for="customCrankSize">Custom Crank Size</label>
        //         <input id="customCrankSize" name="customCrankSize" />
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label for="plugType">Plug Type</label>
        //         <select id="plugType" name="plugType"></select>
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label for="switchTX">Switch / TX
        //         <select id="switchTX" name="switchTX"></select>
        //         </label>
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label for="trackGuide">Track Guide
        //         <select id="trackGuide" name="trackGuide"></select>
        //         </label>
        //         </div>

             

        //         </div>
        //         </div>

        //         <button class="accordion">Addons</button>
        //         <div class="panel">
        //         <div class="wrapper">

        //         <div class="flexItemsInputs">
        //         <label class="customBracketCheckBox" for="Hood">
        //         <input type="checkbox" id="Hood"  />
        //         Hood
        //         </label>
        //         </div>

        //         </div>
        //         </div>

        //         <button class="accordion">Note</button>
        //         <div class="panel">
        //         <div class="wrapper">
        //         <textarea id="reductionNote" type="text"></textarea>
        //         </div>
        //         </div>

        //         <button class="accordion">Calculation</button>
        //         <div class="panel">
        //         <div class="wrapper" style="position: relative;">

        //         <div class="flexItemsInputs">
        //         <label for="NumberInput">Location Number</label>
        //         <input id="NumberInput" type="number" />
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="motorSize">Motor Size</label>
        //         <select id="motorSize" name="motorSize" class='requuiredField' ></select>
        //         </div>
                
        //         <div class="flexItemsInputs">
        //         <label for="numberOfBrackets">Calculated Install Time</label>
        //         <input id="calculatedInstallTime" type="number" disabled />
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="QTY">QTY</label>
        //         <input id="QTY" type="number" class='requuiredField' value='1' disabled />
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="OperatorSideWidth">Operator Side Width</label>
        //         <input id="OperatorSideWidth" type="number" />
        //         </div>
             
        //         <div class="flexItemsInputs">
        //         <label for="Grain">Grain</label>
        //         <select name="Grain" id="Grain"></select>
        //         </div>

        //         <div class="flexItemsInputs" style="position: absolute; right: 0px; top: 160px;">
        //         <button class="refreshMeasureBtn" id="refreshMeasure">
        //         <img id="refreshIcon" src="./img/refresh.png" />
        //              Calculate
        //         </button>
        //         </div>

        //         </div>
        //         </div>

        //         </div>
        //         `)

        //   return tmpDiv;
        // }