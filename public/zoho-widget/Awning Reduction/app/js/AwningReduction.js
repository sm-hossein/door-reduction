// import Header from "./reportSheetHeader.js";
jQuery(function ($) {
  let firstTime = true;
  let mainOrder, contactInfo, propertyInfo, installContactInfo, ReductionFields,
    Shade_Reduction_Fields_Def, oldOrderItem, parentOrderItems, pageNumber;
  let isUpdatedAfterCalculated = false;
  let isCalculated = false;
  var order;
  var options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  };

  getData()
  function getData() {
    ZOHO.embeddedApp.on("PageLoad", async function (data) {
      console.log('page load func');
      if (firstTime) {
        firstTime = false;
        // Get Org Variable Fabric Selection
        Shade_Reduction_Fields_Def = (await ZOHO.CRM.API.getOrgVariable("Shade_Reduction_Fields_Def")).Success.Content;
       
        // get and set data into fields
        await ZOHO.CRM.API.getRecord({
          Entity: "Order_Items",
          RecordID: data.EntityId[0],
        }).then(async function (orderItems) {
          // console.log(orderItems);
          let orderItem = orderItems.data[0]
          oldOrderItem = orderItem;

           //get orders for coverSheet fields
            await ZOHO.CRM.API.getRecord({
              Entity: "Deals",
              RecordID: orderItem.Order.id,
            }).then(async function (res) {
              order = res.data[0];
             
              console.log(order,'delas',orderItem.Order.id,"order");
            })
        
          let mainDiv = $('#mainContent')

          // Contact & Property
          if (orderItem.Product_Category.includes('Awning')) {
            $('#mainTitle').html(orderItem.Product_Category)
            $('#submitLA').prop("disabled", false);
            let formDiv = await createAwningReductionForm('awning');
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

            if(orderItem.Location){
              $('#Location').val(orderItem.Location)
              }

            await ZOHO.CRM.API.getRecord({
              Entity: "Deals",
              RecordID: oldOrderItem.Order.id
            }).then(async function (main) {
              mainOrder = main.data[0]
              await ZOHO.CRM.API.getRecord({
                Entity: "Contacts",
                RecordID: mainOrder.Contact_Name.id
              }).then(async function (contactData) {
                contactInfo = contactData.data[0];
                // get Properties
                await ZOHO.CRM.API.getRecord({
                  Entity: "Properties",
                  RecordID: mainOrder.Property.id
                }).then(async function (propertyData) {
                  propertyInfo = propertyData.data[0];
                  // get install Contacts
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
            

            //************************** */
            // ON CHANGE FABRIC TYPE
            $('#fabricType').on('change', async function () {
              $('.fabricSelectionWrapper').empty();
              // Switch Case
              switch ($('#fabricType').val()) {
                case 'Custom Ordered':
                  let upgradedDiv = $('<input type="text" id="fabricSelection" />')
                  $('.fabricSelectionWrapper').append(upgradedDiv);
                  break;
                case 'Stock':
                  let $standardDiv = $('<select name="fabricSelection" id="fabricSelection"></select>')
                  // set Fabric Selection
                  let fabricSelectionArray = JSON.parse(Shade_Reduction_Fields_Def).Fabric_Selection
                  if (fabricSelectionArray.length > 0) {
                    $.each(fabricSelectionArray, function (key, val) {
                      $standardDiv.append(
                        $("<option />").val(val).text(val)
                      );
                    });
                  }
                  $('.fabricSelectionWrapper').append($standardDiv);
                  break;
                default:
                // Show Error
              }
              // End of Switch Case
            })
            // on change curtian to None
            $('#frontCurtain').on('change', async function () {
              if ($('#frontCurtain').val() == '-None-') {
                $('#frontCurtainColor').prop('disabled', true)
                $('#frontCurtainColor option[value="-None-"]').prop('selected', true);
                $('#frontCurtainOpenness').prop('disabled', true)
                $('#frontCurtainOpenness option[value="-None-"]').prop('selected', true);
                $('#frontCurtainDropSize').prop("disabled", true);
                $('#frontCurtainDropSize option[value="-None-"]').prop('selected', true);
              }
              if ($('#frontCurtain').val() == 'Upgraded') {
                $('#frontCurtainDropSize').prop("disabled", true);
                $('#frontCurtainDropSize option[value="-None-"]').prop('selected', true);
                $('#frontCurtainColor').prop('disabled', false)
                $('#frontCurtainOpenness').prop('disabled', false)
              }
              if ($('#frontCurtain').val() == 'Standard') {
                $('#frontCurtainColor').prop('disabled', false)
                $('#frontCurtainOpenness').prop('disabled', false)
                $('#frontCurtainDropSize').prop('disabled', false)
              }
            })
            // ON CHANGE CLOTH SIZE
            $('.clothChange').on('change', async function () {
              if ($(this).attr('id') == 'ClothSize') {
                if ($('#ClothSize').val() == 'Actual') {
                  $('#clothActualSize').prop('disabled', false)
                } else {
                  $('#clothActualSize').val('');
                  $('#clothActualSize').prop('disabled', true)
                }
              }
            });

            // on change required fields, calculate again!
            $('.requuiredField').on('change', function () {
              if (isCalculated) {
                isUpdatedAfterCalculated = true;
              }
            })

            // on change crank size to custom
            $('#crankSize').on('change', function () {
              if ($('#crankSize').val() == 'Custom') {
                $('#customCrankSize').prop("disabled", false);
              } else {
                $('#customCrankSize').val('')
                $('#customCrankSize').prop("disabled", true);
              }
            });

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
                    return jQuery('<span class="multiSelect_choice">'+ item +'<img id="tagCloseButton" src="./img/Close.svg"/></span>').click(function(e) {
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
            // get and set options
            ZOHO.CRM.META.getFields({ Entity: "Order_Items" }).then(async function (data) {
            
              let dataArray = [
                { apiName: 'Projection', id: 'projection' },
                { apiName: 'Fabric_Type', id: 'fabricType' },
                { apiName: 'Binding_Color', id: 'bindingColor' },
                { apiName: 'Valance_Style', id: 'valanceStyle' },
                { apiName: 'Frame_Color', id: 'frameColor' },
                { apiName: 'Mounting_type', id: 'mountType' },
                { apiName: 'Mounting_Surface', id: 'mountSurface' },
                { apiName: 'Motor_Type', id: 'motorType' },
                { apiName: 'Motor_Size', id: 'motorSize' },
                { apiName: 'Motor_Crank_Side', id: 'motorCrankSide' },
                { apiName: 'Plug_Type', id: 'plugType' },
                { apiName: 'Front_Curtain', id: 'frontCurtain' },
                { apiName: 'Front_Curtain_Color', id: 'frontCurtainColor' },
                { apiName: 'Front_Curtain_Drop_Size', id: 'frontCurtainDropSize' },
                { apiName: 'Front_Curtain_Openness', id: 'frontCurtainOpenness' },
                { apiName: 'Crank_Size', id: 'crankSize' },
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

              // Cloth_Size
              let ClothSizeArray = JSON.parse(Shade_Reduction_Fields_Def)["Cloth Size"]
              ClothSizeArray.unshift('-None-')
              let $ClothSizeDiv = $('#ClothSize')
              $.each(ClothSizeArray, function (key, val) {
                $ClothSizeDiv.append(
                  $("<option />").val(val).text(val)
                );
              });

              if (orderItem.Reduction_Fields) {
                ReductionFields = orderItem.Reduction_Fields ? orderItem.Reduction_Fields : "";
                let jsonObject = JSON.parse(ReductionFields);
                let tmpArray = [
                  { Reduction_Field: 'Val_Size', id: 'ValSize', type: 'input' },
                  { Reduction_Field: 'switch-TX', id: 'switchTX', type: 'dropdown' },
                  { Reduction_Field: 'Note', id: 'reductionNote', type: 'input' },
                  { Reduction_Field: 'Bottom_of_val', id: 'BottomOfVal', type: 'input' },
                  { Reduction_Field: 'Override_Install_Time', id: 'OverrideInstallTime', type: 'input' },
                  { Reduction_Field: 'Location', id: 'Location', type: 'input' },
                  { Reduction_Field: 'Wind_Leg', id: 'WindLeg', type: 'input' },
                  { Reduction_Field: 'Strip_Offset', id: 'StripOffset', type: 'input' },
                  { Reduction_Field: 'customCrankSize', id: 'customCrankSize', type: 'input' },
                ]
                setReductionFields(jsonObject, tmpArray)

                // get clothActualSize from Reduction_Fields
                if (jsonObject.cloth_Actual_Size) {
                  $('#clothActualSize').val(jsonObject.cloth_Actual_Size)
                  $('#ClothSize option:contains("Actual")').prop('selected', true);
                  $('#clothActualSize').prop("disabled", false);
                } else {
                  if (jsonObject.cloth_Size && jsonObject.cloth_Size != "") {
                    $('#ClothSize option[value="' + jsonObject.cloth_Size + '"]').prop('selected', true);
                    $('#clothActualSize').prop("disabled", true);
                  }
                }
              } else {
                ReductionFields = '{}';
              }

              $('#widthIn').val(orderItem.Awning_Width ? orderItem.Awning_Width : '')
              $('#mountHeight').val(orderItem.Mounting_Height ? orderItem.Mounting_Height : '')
              $('#numberOfBrackets').val(orderItem.Number_of_Brackets ? orderItem.Number_of_Brackets : '')
              $('#customBracket').prop('checked', orderItem.Custom_bracket_for_LHP_to_manufacture)
              $('#mountHeight').val(orderItem.Mounting_Height)
              $('#Hood').prop('checked', orderItem.Hood)
              $('#backBoard').prop('checked', orderItem.Back_Board)
              $('#winterCover').prop('checked', orderItem.Winter_Cover)
              $('#crossArm').prop('checked', orderItem.Cross_Arm)
              $('#motionSensor').prop('checked', orderItem.Motion_Sensor)
              $('#ClothSize option[value="46"]').prop('selected', true);
              $('#clothActualSize').prop("disabled", true);
              $('#customCrankSize').prop("disabled", true);
              $('#calculatedInstallTime').val(orderItem.Install_Time ? orderItem.Install_Time : '')

              if (orderItem.Projection) {
                $('#projection option:contains("' + orderItem.Projection + '")').prop('selected', true);
              }
              if (orderItem.Binding_Color) {
                $('#bindingColor option[value="' + orderItem.Binding_Color + '"]').prop('selected', true);
              }
              if (orderItem.Valance_Style) {
                $("#valanceStyle > option").each(function () {
                  if (this.text == orderItem.Valance_Style) {
                    $('#valanceStyle option[value="' + this.value + '"]').prop('selected', true);
                  }
                });
              }
              if (orderItem.Frame_Color) {
                $('#frameColor option[value="' + orderItem.Frame_Color + '"]').prop('selected', true);
              }
              if (orderItem.Mounting_type) {
                $('#mountType option[value="' + orderItem.Mounting_type + '"]').prop('selected', true);
              }
              if (orderItem.Mounting_Surface) {
                $('#mountSurface option[value="' + orderItem.Mounting_Surface + '"]').prop('selected', true);
              }
              if (orderItem.Fabric_Type) {
                $('#fabricType option[value="' + orderItem.Fabric_Type + '"]').prop('selected', true);

                if (orderItem.Fabric_Type == 'Stock') {
                  let $standardDiv = $('<select name="fabricSelection" id="fabricSelection"></select>')
                  // set Fabric Selection
                  let fabricSelectionArray = JSON.parse(Shade_Reduction_Fields_Def).Fabric_Selection

                  if (fabricSelectionArray.length > 0) {
                    $.each(fabricSelectionArray, function (key, val) {
                      $standardDiv.append(
                        $("<option />").val(val).text(val)
                      );
                    });
                  }
                  $('.fabricSelectionWrapper').append($standardDiv);
                  if (orderItem.Fabric_Selection) {
                    $('#fabricSelection option[value="' + orderItem.Fabric_Selection + '"]').prop('selected', true);
                  }
                } else {
                  let upgradedDiv = $('<input type="text" id="fabricSelection" />')
                  $('.fabricSelectionWrapper').append(upgradedDiv);
                  if (orderItem.Fabric_Selection) {
                    $('#fabricSelection').val(orderItem.Fabric_Selection)
                  }
                }
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
              if (orderItem.Front_Curtain) {
                $('#frontCurtain option[value="' + orderItem.Front_Curtain + '"]').prop('selected', true);
                if ($('#frontCurtain').val() == 'Upgraded') {
                  $('#frontCurtainDropSize').prop("disabled", true);
                }
              } else {
                $('#frontCurtainColor').prop("disabled", true);
                $('#frontCurtainDropSize').prop("disabled", true);
                $('#frontCurtainOpenness').prop("disabled", true);
              }
              if (orderItem.Front_Curtain_Color) {
                $('#frontCurtainColor option[value="' + orderItem.Front_Curtain_Color + '"]').prop('selected', true);
              }
              if (orderItem.Front_Curtain_Drop_Size) {
                $('#frontCurtainDropSize option[value="' + orderItem.Front_Curtain_Drop_Size + '"]').prop('selected', true);
              }
              if (orderItem.Front_Curtain_Openness) {
                $('#frontCurtainOpenness option[value="' + orderItem.Front_Curtain_Openness + '"]').prop('selected', true);
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
                                  
                fieldOption.each(function(e) {
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

        function  createSelectDropDowns(fields, dataArray) {
          console.log('here at create select ');
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
              $('#' + dataArray[i].id + ' option[value="' + jsonObject[dataArray[i].Reduction_Field] + '"]').prop('selected', true);
            }
          }
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

        function checkRequiredFields(type) {
          let response = false;
          if (type == 'refresh') {
            if ($('#widthIn').val() !== '' && $("#motorType").val() !== '' && $('#projection').find(":selected").text() !== '-None-') {
              response = true;
            }
          }
          return response;
        }

        // ON CLICK Reduce BUTTON
        $('#submitLA').on('click', async function () {
          if (isCalculated || $('#motorSize').val() != '-None-') {
            if (isUpdatedAfterCalculated) {
              $('#hiddenCalculationType').html('reduction')
              $('#calculationErrorModal').css('display', 'block')
            } else {
              reduceFunction()
            }
          } else {
            // await calculateFunction()
            // await reduceFunction()
            $('#hiddenCalculationType').html('reduction')
            $('#calculationErrorModal').css('display', 'block')
          }
        });

        // ON CLICK Measure BUTTON
        $('#measureFields').on('click', async function () {
          if (isCalculated || $('#motorSize').val() != '-None-') {
            if (isUpdatedAfterCalculated) {
              $('#hiddenCalculationType').html('measure')
              $('#calculationErrorModal').css('display', 'block')
            } else {
              measureFunction()
            }
          } else {
            // await calculateFunction()
            // await measureFunction()
            $('#hiddenCalculationType').html('measure')
            $('#calculationErrorModal').css('display', 'block')
          }
        })

        // click on sub-measure button
        $('#refreshMeasure').on('click', async function () {
          calculateFunction();
        })
  
  
        async function reduceFunction() {
          $('#submitLA').prop("disabled", true);
          $('#submitLA').prop("value", "Reducing...");

          //request to MKZ to process data for reduction
          let reqObject = await requestToMKZ('reduction')
          
          if (oldOrderItem.Product_Category.includes('Awning')) {
            // Reduction Field
            let jsonObject = JSON.parse(ReductionFields);
            // set val_Size into ReductionFields
            jsonObject.Val_Size = $('#ValSize').val();
            // set switch-TX into ReductionFields
            jsonObject['switch-TX'] = $('#switchTX').val();
            // set cloth_Actual_Size into ReductionFields
            jsonObject.cloth_Actual_Size = $('#clothActualSize').val();
            // set cloth_Size into ReductionFields
            jsonObject.cloth_Size = $('#ClothSize').val();
            // set Note into ReductionFields
            jsonObject.Note = $('#reductionNote').val();
            // set Bottom_of_val into Reduction_Fields
            jsonObject.Bottom_of_val = $('#BottomOfVal').val()
            // set Override_Install_Time into Reduction_Fields
            jsonObject.Override_Install_Time = $('#OverrideInstallTime').val()
            // set Location into Reduction_Fields
            jsonObject.Location = $('#Location').val()
            // set Wind_Leg into Reduction_Fields
            jsonObject.Wind_Leg = $('#WindLeg').val()
            // set Strip_Offset into Reduction_Fields
            jsonObject.Strip_Offset = createDecimalInt($('#StripOffset').val())
            // set customeCrankSize into Reduction_Fields
            jsonObject.customCrankSize = $('#customCrankSize').val()
            // set Yardage into Reduction_Fields
            jsonObject.FabricYardage = reqObject['TotalYardage']
            jsonObject = JSON.stringify(jsonObject);

            let newObject = {
              Awning_Width: $('#widthIn').val(),
              Projection: $("#projection option:selected").text() == "-None-" ? null : $("#projection option:selected").text(),
              Reduction_Fields: jsonObject,
              Fabric_Type: $('#fabricType').val() == "-None-" ? null : $('#fabricType').val(),
              Fabric_Selection: $('#fabricType').val() == 'Stock' || $('#fabricType').val() == 'Custom Ordered' ? $('#fabricSelection').val() : "Select Later",
              Binding_Color: $('#bindingColor').val() == "-None-" ? null : $('#bindingColor').val(),
              Valance_Style: $('#valanceStyle').val() == "-None-" ? null : $('#valanceStyle').val(),
              Frame_Color: $('#frameColor').val() == "-None-" ? null : $('#frameColor').val(),
              Mounting_Height: $('#mountHeight').val(),
              Mounting_type: $('#mountType').val() == "-None-" ? null : $('#mountType').val(),
              Mounting_Surface: $('#mountSurface').val() == "-None-" ? null : $('#mountSurface').val(),
              Number_of_Brackets: $('#numberOfBrackets').val(),
              Custom_bracket_for_LHP_to_manufacture: $('#customBracket').is(":checked"),
              Motor_Type: $('#motorType').val(),
              Motor_Size: $('#motorSize').val(),
              Motor_Crank_Side: $('#motorCrankSide').val(),
              Plug_Type: $('#plugType').val(),
              Crank_Size: $('#crankSize').val(),
              Hood: $('#Hood').is(":checked"),
              Front_Curtain: $('#frontCurtain').val(),
              Front_Curtain_Color: $('#frontCurtainColor').val(),
              Front_Curtain_Drop_Size: $('#frontCurtainDropSize').val() == "-None-" ? null : $('#frontCurtainDropSize').val(),
              Front_Curtain_Openness: $('#frontCurtainOpenness').val(),
              Back_Board: $('#backBoard').is(":checked"),
              Winter_Cover: $('#winterCover').is(":checked"),
              Cross_Arm: $('#crossArm').is(":checked"),
              Motion_Sensor: $('#motionSensor').is(":checked"),
              Install_Time: $('#calculatedInstallTime').val(),
              Loc_No: $('#NumberInput').val()
            }

            let mergedObject = { ...oldOrderItem, ...newObject };
            //save total yardage in zoho after reduce
            mergedObject.Fabric_Yardage = reqObject['TotalYardage']

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
            // mergedObject.Reduction_Result = 
            // Request to orderItem
            await ZOHO.CRM.API.updateRecord({
              Entity: "Order_Items",
              APIData: mergedObject,
              Trigger: ["workflow"]
            }).then(el => {
              console.log(el);
              let url = "https://crm.zoho.com/crm/org705881529/tab/CustomModule3/" + el.data[0].details.id;
              $('.submitLAWrapper').hide();
              // $('.submitLAWrapper').html("<a href=' " + url + "' target='_blank'>Open Order Item</a>")
            })

            //update coversheet fields in order
            // let orderObject = order;
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
              $('.submitLAWrapper').hide();
            })
            await createReductionSheet(reqObject)
          }
          
        }

        async function calculateFunction() {
          $('#widthIn').css('border', '1px solid rgb(239, 239, 239)')
          $("#motorType").css('border', '1px solid rgb(239, 239, 239)')
          $('#projection').css('border', '1px solid rgb(239, 239, 239)')
          $('#WindLeg').css('border', '1px solid rgb(239, 239, 239)')
          $('#refreshIcon').addClass('animationRefresh')
          setTimeout(function () {
            $('#refreshIcon').removeClass('animationRefresh')
          }, 2000);
          if (checkRequiredFields('refresh')) {
            let reqObject = await requestToMKZ('refresh')

            console.log(reqObject, 'calculated');


            $('#calculatedInstallTime').val(reqObject.InstallTime)
            $('#numberOfBrackets').val(reqObject.QtyOfBrackets)
            $('#ValSize').val(reqObject.Valance)
            $('#motorSize option[value="' + reqObject.Motor + '"]').prop('selected', true);
            $('#crossArm').prop('checked', reqObject.IsCrossArms)
            isCalculated = true;
            isUpdatedAfterCalculated = false;
          } else {
            $('#widthIn').css('border', '1px solid red')
            $("#motorType").css('border', '1px solid red')
            $('#projection').css('border', '1px solid red')
            $('#WindLeg').css('border', '1px solid red')

            alert('Fill The Required Fields!')
          }
        }

        async function measureFunction() {
          $('#measureFields').prop("disabled", true);
          $('#measureFields').prop("value", "Measuring...");

          if (oldOrderItem.Product_Category.includes('Awning')) {
            //request to MKZ to process data for measure
            let measureObject = await requestToMKZ('measure');
            createMeasureSheet(measureObject);
            $('.submitLAWrapper').hide();
            // Reduction Field
            let jsonObject = JSON.parse(ReductionFields);
            // set val_Size into ReductionFields
            jsonObject.Val_Size = $('#ValSize').val();
            // set switch-TX into ReductionFields
            jsonObject['switch-TX'] = $('#switchTX').val();
            // set cloth_Actual_Size into ReductionFields
            jsonObject.cloth_Actual_Size = $('#clothActualSize').val();
            // set cloth_Size into ReductionFields
            jsonObject.cloth_Size = $('#ClothSize').val();
            // set Note into ReductionFields
            jsonObject.Note = $('#reductionNote').val();
            // set Bottom_of_val into Reduction_Fields
            jsonObject.Bottom_of_val = $('#BottomOfVal').val()
            // set Override_Install_Time into Reduction_Fields
            jsonObject.Override_Install_Time = $('#OverrideInstallTime').val()
            // set Location into Reduction_Fields
            jsonObject.Location = $('#Location').val()
            // set Wind_Leg into Reduction_Fields
            jsonObject.Wind_Leg = $('#WindLeg').val()
            // set Strip_Offset into Reduction_Fields
            jsonObject.Strip_Offset = createDecimalInt($('#StripOffset').val())
            //set customCrankSize into Reduction_Fields
            jsonObject.customCrankSize = $('#customCrankSize').val()
            //set Yardage into Reduction_Fields
            jsonObject.FabricYardage = measureObject['TotalYardage']
            jsonObject = JSON.stringify(jsonObject);

            let newObject = {
              Awning_Width: $('#widthIn').val(),
              Projection: $("#projection option:selected").text() == "-None-" ? null : $("#projection option:selected").text(),
              Reduction_Fields: jsonObject,
              Fabric_Type: $('#fabricType').val() == "-None-" ? null : $('#fabricType').val(),
              Fabric_Selection: $('#fabricType').val() == 'Stock' || $('#fabricType').val() == 'Custom Ordered' ? $('#fabricSelection').val() : "Select Later",
              Binding_Color: $('#bindingColor').val() == "-None-" ? null : $('#bindingColor').val(),
              Valance_Style: $('#valanceStyle').val() == "-None-" ? null : $('#valanceStyle').val(),
              Frame_Color: $('#frameColor').val() == "-None-" ? null : $('#frameColor').val(),
              Mounting_Height: $('#mountHeight').val(),
              Mounting_type: $('#mountType').val() == "-None-" ? null : $('#mountType').val(),
              Mounting_Surface: $('#mountSurface').val() == "-None-" ? null : $('#mountSurface').val(),
              Number_of_Brackets: $('#numberOfBrackets').val(),
              Custom_bracket_for_LHP_to_manufacture: $('#customBracket').is(":checked"),
              Motor_Type: $('#motorType').val(),
              Motor_Size: $('#motorSize').val(),
              Motor_Crank_Side: $('#motorCrankSide').val(),
              Plug_Type: $('#plugType').val(),
              Crank_Size: $('#crankSize').val(),
              Hood: $('#Hood').is(":checked"),
              Front_Curtain: $('#frontCurtain').val(),
              Front_Curtain_Color: $('#frontCurtainColor').val(),
              Front_Curtain_Drop_Size: $('#frontCurtainDropSize').val() == "-None-" ? null : $('#frontCurtainDropSize').val(),
              Front_Curtain_Openness: $('#frontCurtainOpenness').val(),
              Back_Board: $('#backBoard').is(":checked"),
              Winter_Cover: $('#winterCover').is(":checked"),
              Cross_Arm: $('#crossArm').is(":checked"),
              Motion_Sensor: $('#motionSensor').is(":checked"),
              Install_Time: $('#calculatedInstallTime').val(),
              Loc_No: $('#NumberInput').val()
            }

            let mergedObject = { ...oldOrderItem, ...newObject };
            //save total yardage in zoho after measure
            mergedObject.Fabric_Yardage = measureObject['TotalYardage']


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
            // Request to orderItem
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

        async function requestToMKZ(type) {
          let selectedArray=[];
          let finalResponse;
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
            "ProjectionText": $('#projection').find(":selected").text(), //should set .val() instead of .text()
            "MountHeight": $('#mountHeight').val(),
            "BottomOfVal": $('#BottomOfVal').val(),
            "ValSize": $('#ValSize').val(),
            "OperatorTypeId": $("#motorType").val(),
            "Side": $('#motorCrankSide').val(),
            "Binding": $('#bindingColor').val(),
            "Fabric Selection": $('#fabricSelection').val(),
            "NsFabric": $('#fabricSelection').val(),
            "Fabric Type": $('#fabricType').val(),
            "FrameColorText": $('#frameColor').val(),
            "Valance": $('#valanceStyle').find(":selected").text(),
            "MotorText": $('#motorSize').val(),
            "Switch_TX": $('#switchTX').val(),
            "PlugOptionText": $('#plugType').val(),
            "CrankText": $('#crankSize').val(),
            "customcrank": $('#customCrankSize').val() == '' ? null : $('#customCrankSize').val(),
            "Hood": $('#Hood').is(":checked"),
            "CustomBrackets": $('#customBracket').is(":checked"),
            "Backboard": $('#backBoard').is(":checked"),
            "Xla": $('#crossArm').is(":checked"),
            "FrontCurtainType": $('#frontCurtain').val(),
            "FrontCurtainColor": $('#frontCurtain').val() == '-None-' || $('#frontCurtainColor').val() == '-None-' ? null : $('#frontCurtainColor').val(),
            "FrontCurtainOpenness": $('#frontCurtain').val() == '-None-' || $('#frontCurtainOpenness').val() == '-None-' ? null : $('#frontCurtainOpenness').val(),
            "FrontCurtainDropSize": $('#frontCurtain').val() == '-None-' || $('#frontCurtainDropSize').val() == '-None-' ? null : $('#frontCurtainDropSize').val(),
            "WinterCover": $('#winterCover').is(":checked"),
            "StripOffset": $('#StripOffset').val(),
            "WindLegText": $('#WindLeg').val() == '' ? '0' : $('#WindLeg').val(),
            "QtyOfBrackets": $('#numberOfBrackets').val(),
            "SurfaceText": $('#mountSurface').val(),
            "TypeText": $('#mountType').val(),
            "Notes": $('#reductionNote').val(),
            "ActualClothWidth": $('#ClothSize').val() == 'Actual' ? $('#clothActualSize').val() : null,
            "defaultClothWidth": $('#ClothSize').val() == 'Actual' ? null : $('#ClothSize').val(),
            "MotionSensor": $('#motionSensor').is(":checked"),
            "Awning_Coversheet_Picklist": selectedArray
          }

          console.log(reqObject, 'Request To MKZ');

          // Request to MKZ
          var func_name = "mkztest";
          var req_data = {
            "arguments": JSON.stringify({
              "AMPFactorDetail": reqObject
            })
          };
          await ZOHO.CRM.FUNCTIONS.execute(func_name, req_data)
            .then(function (data) {
              let response = JSON.parse(data.details.output);
              let printObject = JSON.parse(response.details.output);
              finalResponse = printObject;
              console.log(finalResponse, 'finalResponse');
            }).catch(function (error) {
              console.log(error, 'error');
              alert('Somthing Went Wrong!')
              $('#submitLA').prop("disabled", false);
            })
          return finalResponse;
        }

     
        async function createReductionSheet(printObject) {
          let printDiv = $(`
                <div class="container" id="LAPrint">
                <div class="headerInfo" id="awningHeader"></div>
                <div class="mainInfoWrapper">
                  <div class="infoCol">
                    <p class="infoColTitle">Building Information</p>
            
                    <div class="fabricInfoCol">
                    <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Number: </div>
                      <div class="fabricInfoColItemLarge">${$('#NumberInput').val() != '' ? $('#NumberInput').val() : pageNumber.index} of ${pageNumber.total} ${printObject.Location && '('+printObject.Location+')'}</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Type: </div>
                      <div class="fabricInfoColItemLarge">${printObject.Type}</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Width: </div>
                      <div class="fabricInfoColItemLarge">${printObject.Width[0]} (${printObject.Width[1]} Ft. ${printObject.Width[2]} In)</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Projection: </div>
                      <div class="fabricInfoColItemLarge">${printObject.Projection[0]} - (${printObject.Projection[1]} Arms)</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Frame: </div>
                      <div class="fabricInfoColItemLarge">${printObject.FrameColor}</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Operator: </div>
                      <div class="fabricInfoColItemLarge">${printObject.Operator[0]} (${printObject.Operator[1]})</div>
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
                      <div class="fabricInfoColItemSmall">Controls: </div>
                      <div class="fabricInfoColItemLarge">${printObject.Controls ? printObject.Controls : ''}</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Cord/Plug: </div>
                      <div class="fabricInfoColItemLarge">${printObject.Cord_Plug}</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Back Bar: </div>
                      <div class="fabricInfoColItemLarge">${printObject.BackBar} In.</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Front Bar: </div>
                      <div class="fabricInfoColItemLarge">${printObject.FrontBar[0]} In. ${printObject.FrontBar[1] != '' ? "-" + printObject.FrontBar[1] : ""}</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Roller Tube: </div>
                      <div class="fabricInfoColItemLarge">${printObject.RollerTube}</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Housing: </div>
                      <div class="fabricInfoColItemLarge">${printObject.Housing}</div>
                      </div>

                      <div class="fabricInfoColItem" style="max-width: 100%; flex: 1 0 100%;">Attach knuckles ${printObject.Attach} In. from ends of back bar.</div>
                      <div class="fabricInfoColItem" style="max-width: 0%; flex: 1 0 0%;"></div>
                      <div class="fabricInfoColItem" style="max-width: 100%; flex: 1 0 100%;"></div>
                      <div class="fabricInfoColItem" style="max-width: 0%; flex: 1 0 0%;"></div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Center Support: </div>
                      <div class="fabricInfoColItemLarge">${printObject.CenterSupport}</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Hood: </div>
                      <div class="fabricInfoColItemLarge">${printObject.Hood}</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Wind Legs: </div>
                      <div class="fabricInfoColItemLarge">${printObject.WindLegs}</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Curtain: </div>
                      <div class="fabricInfoColItemLarge">${printObject.FrontCurtainType ? printObject.FrontCurtainType : ''} ${printObject.FrontCurtainColor ? '- ' + printObject.FrontCurtainColor : ''} ${printObject.FrontCurtainOpenness ? '- ' + printObject.FrontCurtainOpenness : ''} ${printObject.FrontCurtainDropSize ? '- ' + printObject.FrontCurtainDropSize + 'In.' : ''} </div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Crank: </div>
                      <div class="fabricInfoColItemLarge">${printObject.Crank}</div>
                      </div>

                      <div class="fabricInfoColItem" style="max-width: 100%; flex: 1 0 100%;"><b>${printObject.CustomBrackets}</b></div>
                      <div class="fabricInfoColItem" style="max-width: 0%; flex: 1 0 0%;"></div>

                      <div class="fabricInfoColItem" style="max-width: 100%; flex: 1 0 100%; min-height: 24px;"></div>
                      <div class="fabricInfoColItem" style="max-width: 0%; flex: 1 0 0%;"></div>

                      <div class="fabricInfoColItem" style="max-width: 100%; flex: 1 0 100%;"><b>${printObject.Other ? printObject.Other.filter(n => n != '').join(', ').replaceAll(' ,',',') : ''}</b></div>
                      <div class="fabricInfoColItem" style="max-width: 0%; flex: 1 0 0%;"></div>
            
                    </div>
            
                  </div>
                  <div class="infoCol">
                    <p class="infoColTitle">Sewing Information</p>
                    <div class="fabricInfoCol">
                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Yards: </div>
                      <div class="fabricInfoColItemLarge">${printObject.TotalYardage} Yards</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Fabric: </div>
                      <div class="fabricInfoColItemLarge">${printObject.Material}</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Valance: </div>
                      <div class="fabricInfoColItemLarge">${printObject.Valance[0]} - ${printObject.Valance[1]} In.</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Binding </div>
                      <div class="fabricInfoColItemLarge">${printObject.Binding}</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Panels cut length: </div>
                      <div class="fabricInfoColItemLarge">${printObject.PanelsCutLength[0]} Panels at ${printObject.PanelsCutLength[1]}</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Finished Width: </div>
                      <div class="fabricInfoColItemLarge">${printObject.FinishedWidth} In.</div>
                      </div>


                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Cloth Width: </div>
                      <div class="fabricInfoColItemLarge">${printObject.ActualClothWidth}</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Stripe Offset: </div>
                      <div class="fabricInfoColItemLarge">${printObject.StripOffset}</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Hot Knife: </div>
                      <div class="fabricInfoColItemLarge">${printObject.HotKnife}</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItemSmall">Curtain: </div>
                      <div class="fabricInfoColItemLarge">${printObject.FrontCurtainType ? printObject.FrontCurtainType : ''} ${printObject.FrontCurtainColor ? '- ' + printObject.FrontCurtainColor : ''} ${printObject.FrontCurtainOpenness ? '- ' + printObject.FrontCurtainOpenness : ''} ${printObject.FrontCurtainDropSize ? '- ' + printObject.FrontCurtainDropSize + 'In.' : ''} </div>
                      </div>


                      <div style="margin-top: 20px;" class="fabricInfoColItem">Cloth Width ______</div>
                      <div style="margin-top: 20px;" class="fabricInfoColItem">Stripe Offset ______</div>
                    </div>
            
                    <div class="fabricStaticCol">
                      <div class="fabricStaticInside">
                        <div class="colStyle">
                          <div class="colStyleInside">1/16- .062</div>
                          <div class="colStyleInside">9/16- .562</div>
                        </div>
                        <div class="colStyle">
                          <div class="colStyleInside">1/8- .125</div>
                          <div class="colStyleInside">5/8- .625</div>
                        </div>
                        <div class="colStyle">
                          <div class="colStyleInside">3/16- .187</div>
                          <div class="colStyleInside">11/16- .687</div>
                        </div>
                        <div class="colStyle">
                          <div class="colStyleInside">1/4- .250</div>
                          <div class="colStyleInside">3/4- .750</div>
                        </div>
                        <div class="colStyle">
                          <div class="colStyleInside">5/16- .312</div>
                          <div class="colStyleInside">13/16- .812</div>
                        </div>
                        <div class="colStyle">
                          <div class="colStyleInside">3/8- .375</div>
                          <div class="colStyleInside">7/8/16- .875</div>
                        </div>
                        <div class="colStyle">
                          <div class="colStyleInside">7/16- .437</div>
                          <div class="colStyleInside">15/16- .937</div>
                        </div>
                        <div class="colStyle">
                          <div class="colStyleInside">1/2- .500</div>
                          <div class="colStyleInside"> </div>
                        </div>
                      </div>
                    </div>
            
                    <p class="infoColTitle">Installation Information</p>
            
                    <div class="fabricInfoCol">
                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItem">Install Time: </div>
                      <div class="fabricInfoColItem">${printObject.InstallTime} Hrs</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItem"># Brackets: </div>
                      <div class="fabricInfoColItem">${printObject.QtyOfBrackets}</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItem">Mount Height: </div>
                      <div class="fabricInfoColItem">${printObject.MountHeight}</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItem">Valance Height: </div>
                      <div class="fabricInfoColItem">${printObject.ValanceHeight}</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItem">Mount Surface: </div>
                      <div class="fabricInfoColItem">${printObject.MountSurface}</div>
                      </div>

                      <div class="fabricInfoItemWrapper">
                      <div class="fabricInfoColItem">Mount Location: </div>
                      <div class="fabricInfoColItem">${printObject.MountLocation}</div>
                      </div>
                    </div>
            
                  </div>
                </div>
            
                <div class="mainFooterWrapper">
                  <p class="title">${printObject.Notes}</p>
                  <div class="footerInfo">
                    <div class="col">Sewn By:___________________ Date:____________________</div>
                    <div class="col">Assembled By:___________________ Date:____________________</div>
                    <div class="col">Form Revised ${new Date().getMonth() + 1}/${new Date().getFullYear()} Printed ${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}</div>
                    <div class="col">Final Prep By:___________________ Date:____________________</div>
                  </div>
                </div>
              </div>
                `);

          // let tmpHeader = await createHeader('reduction');
          let tmpHeader =  Header('reduction',oldOrderItem,mainOrder, installContactInfo, contactInfo, propertyInfo)
          printDiv.prepend(tmpHeader)
          $('#LA').hide();
          $('#mainTitle').hide();
          $('#printBox').show()
          $('#pdfTest').show()
          $('#backToForm').show()
          $('#mainContent').prepend(printDiv)
          window.scrollTo(0, 0)
        }

        $('#printBox').on('click', function () {
          $('#printBox').hide()
          $('#backToForm').hide()
          window.print();
          $('#printBox').show()
          $('#backToForm').show()
        })

        async function createMeasureSheet(measureObject) {
          console.log(measureObject, 'measureObject');
          let utcTime;
          order.Scheduled_Date && (utcTime = new Date(order.Scheduled_Date))
          let measureDiv = $(`
                <div class="container" id="LAMeasureSheet">            
                <div class="mainInfoWrapper">
                  <div class="infoCol_1">
                    <div class="tableHeader">
                      <p>BackBoard</p>
                      <p>Per Salesperson</p>
                      <p>Actual Measure</p>
                    </div>
                    <div class="table">
                      <div class="rowStyle">
                      <div class="innerTableCol_s">Number:</div>
                      <div class="innerTableCol_xl"> ${pageNumber.index} of ${pageNumber.total} ${measureObject.Location && '('+measureObject.Location+')'}</div>
                      </div>
                      <div class="rowStyle">
                        <div class="innerTableCol_s">Type:</div>
                        <div class="innerTableCol_m">${measureObject.Type}</div>
                        <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                        <div class="innerTableCol_s">Total Width:</div>
                        <div class="innerTableCol_m">${measureObject.Width[0]} (${measureObject.Width[1]} Ft. ${measureObject.Width[2]} In.)</div>
                        <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                        <div class="innerTableCol_s">Fabric Width:</div>
                        <div class="innerTableCol_m">${measureObject.FabricWidth} In.</div>
                        <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                        <div class="innerTableCol_s">Projection:</div>
                        <div class="innerTableCol_m">${measureObject.Projection}</div>
                        <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                        <div class="innerTableCol_s">Mount Height:</div>
                        <div class="innerTableCol_m">${measureObject.MountHeight}</div>
                        <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                        <div class="innerTableCol_s">Val. Bottom:</div>
                        <div class="innerTableCol_m">${measureObject.ValBottom}</div>
                        <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                        <div class="innerTableCol_s">Valance:</div>
                        <div class="innerTableCol_m">${measureObject.Valance}</div>
                        <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                        <div class="innerTableCol_s">Operator:</div>
                        <div class="innerTableCol_m">${measureObject.Operator[0]}-${measureObject.Operator[1]}</div>
                        <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                        <div class="innerTableCol_s">Binding:</div>
                        <div class="innerTableCol_m">${measureObject.Binding}</div>
                        <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                        <div class="innerTableCol_s">Material:</div>
                        <div class="innerTableCol_m">${measureObject['Fabric Type']} - ${measureObject['Fabric Selection']}</div>
                        <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                        <div class="innerTableCol_s">Frame:</div>
                        <div class="innerTableCol_m">${measureObject.Frame}</div>
                        <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                        <div class="innerTableCol_s">Motor:</div>
                        <div class="innerTableCol_m">${measureObject.Motor}</div>
                        <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                        <div class="innerTableCol_s">Switch/TX:</div>
                        <div class="innerTableCol_m">${measureObject.Switch_TX}</div>
                        <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                        <div class="innerTableCol_s">Plug:</div>
                        <div class="innerTableCol_m">${measureObject.Plug}</div>
                        <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                        <div class="innerTableCol_s">Wind Legs:</div>
                        <div class="innerTableCol_m">${measureObject.WindLegs}</div>
                        <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                        <div class="innerTableCol_s">Curtain:</div>
                        <div class="innerTableCol_m">${measureObject.FrontCurtainType ? measureObject.FrontCurtainType : ''}${measureObject.FrontCurtainColor ? ' - ' + measureObject.FrontCurtainColor : ''}${measureObject.FrontCurtainOpenness ? ' - ' + measureObject.FrontCurtainOpenness : ''}${measureObject.FrontCurtainDropSize ? ' - ' + measureObject.FrontCurtainDropSize + 'In.' : ''}</div>
                        <div class="innerTableCol_l"></div>
                      </div>
                      <div class="rowStyle">
                        <div class="innerTableCol_s">Extras:</div>
                        <div class="innerTableCol_m" style="font-size: 12pt;">
                          <label for="Hood">
                            <input type="checkbox" id="Hood" ${measureObject.Hood ? 'checked' : ''}/>
                            Hood
                          </label>
                          <label for="XLA">
                            <input type="checkbox" id="XLA" ${measureObject.IsCrossArms ? 'checked' : ''} />
                            XLA
                          </label>
                          <label for="BackBoard">
                            <input type="checkbox" id="BackBoard" ${measureObject.Backboard ? 'checked' : ''} />
                            BackBoard
                          </label>
                          <label for="WinterCover">
                            <input type="checkbox" id="WinterCover" ${measureObject.WinterCover ? 'checked' : ''} />
                            Winter Cover
                          </label>
                          <label for="CustBrackets">
                            <input type="checkbox" id="CustBrackets" ${measureObject.CustomBrackets ? 'checked' : ''} />
                            Cust.Brackets
                          </label>
                      
                        </div>
                        <div class="innerTableCol_l"></div>
                      </div>
                    </div>
            
                  </div>
            
                  <div class="infoCol_2">
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
                        <div class="tablesRows">
                          <div class="tablesCols"># Brackets:</div>
                          <div class="tablesCols">${measureObject.QtyOfBrackets}</div>
                          <div class="tablesCols"> </div>
                        </div>
                      </div>
            
                      <div class="tablesRows">
                        <div class="tablesCols" style="border-right: 2px solid black;">Install Time</div>
                        <div class="tablesCols" style="border-right: 2px solid black;">${measureObject.InstallTime} Hrs</div>
                        <div class="tablesCols"></div>
                      </div>
                      <div class="tablesRows">
                        <div class="tablesCols" style="border-right: 2px solid black;">Yardage:</div>
                        <div class="tablesCols" style="border-right: 2px solid black;">${measureObject.TotalYardage}</div>
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
                      <input type="text" value=${measureObject.Crank && measureObject.Crank.split(' ')[2] == "Custom" && measureObject.Crank.split(' ')[0] != '-None-' ? measureObject.Crank.split(' ')[0] : ' '}>
                      </label>
            
                    </div>

                    <div class="tables mb-0">
                      <div class="cranckTitle">
                        <p>Install Information</p>
                      </div>
                      <label class="containerStyle">
                        <input id="install_check" type="checkbox" disabled>
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
                        <p style="padding-top: 0px; margin-bottom: 0px; height: 30px; white-space: break-spaces !important;"><b>${(order.Number_of_Installers ? order.Number_of_Installers : "") || "    "} Ins/${(order.Install_Duration ? order.Install_Duration : "") || "    "} hours</b><p>
                      </label>
                    </div>
                    
                    </div>

                  </div>
                </div>
            
                <div class='awningMeasureNotes' >Notes: 
                ${measureObject.Notes ? "** " + measureObject.Notes : ''}
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
                `)
          // let sheetHeader = await createHeader('measure')
          let sheetHeader =  Header('measure',oldOrderItem,mainOrder, installContactInfo, contactInfo, propertyInfo)
          measureDiv.prepend(sheetHeader)
          $('#LA').hide();
          $('#mainTitle').hide();
          $('#printBox').show()
          $('#pdfTest').show()
          $('#backToForm').show()
          $('#mainContent').prepend(measureDiv)
          window.scrollTo(0, 0)
        }
      }

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
        return $crankDiv;
      }

   
      async function checkNextNumber() {
        let responseObject = {
          total: 0,
          index: 0,
        }
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

          console.log(numberedArray, 'numberedArray');
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
        return responseObject;
      }
    })
    ZOHO.embeddedApp.init();
  }
});





   // function createAwningReductionForm() {
        //   let tmpDiv = $(`
        //         <div id="LA">
        //         <button class="accordion">Size</button>
        //         <div class="panel">
        //         <div class="wrapper">
        //         <div class="flexItemsInputs">
        //         <label for="widthIn">Width In</label>
        //         <input id="widthIn" type="text" class='requuiredField' />
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label for="projection">Projection</label>
        //         <select name="projection" id="projection" class='requuiredField'></select>
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="ClothSize">Cloth Size</label>
        //         <select class="clothChange" name="ClothSize" id="ClothSize"></select>
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="clothActualSize">Cloth Actual Size</label>
        //         <input class="clothChange" id="clothActualSize" />
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="WindLeg">Wind Leg</label>
        //         <input id="WindLeg" type="number" min="0" value="0" class='requuiredField' />
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label for="StripOffset">Strip Offset</label>
        //         <input id="StripOffset" type="text" />
        //         </div>

        //         </div>
        //         </div>

        //         <button class="accordion">Fabric/Styles</button>
        //         <div class="panel">
        //         <div class="wrapper">
        //         <div class="flexItemsInputs">
        //         <label for="fabricType">Fabric Type</label>
        //         <select name="fabricType" id="fabricType"></select>
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label for="fabricSelection">Fabric Selection</label>
        //         <div class="fabricSelectionWrapper"></div>
                
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label for="bindingColor">Binding Color</label>
        //         <select name="bindingColor" id="bindingColor"></select>
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label for="valanceStyle">Valance Style</label>
        //         <select name="valanceStyle" id="valanceStyle"></select>
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label for="frameColor">Frame Color</label>
        //         <select name="frameColor" id="frameColor"></select>
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
        //         <label for="BottomOfVal">Bottom of Val</label>
        //         <input id="BottomOfVal" type="number" />
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label for="OverrideInstallTime">Override Install Time</label>
        //         <input id="OverrideInstallTime" type="number" />
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label class="customBracketCheckBox" for="customBracket">
        //          <input type="checkbox" id="customBracket" />
        //          Custom Bracket
        //         </label>
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
        //         <select id="motorCrankSide" name="motorCrankSide"></select>
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
        //         <label class="customBracketCheckBox" for="motionSensor">
        //          <input type="checkbox" id="motionSensor" />
        //          Motion Sensor
        //         </label>
        //         </div>

        //         </div>
        //         </div>

        //         <button class="accordion">Addons</button>
        //         <div class="panel">
        //         <div class="wrapper">

        //         <div class="flexItemsInputs">
        //         <label class="customBracketCheckBox" for="frontCurtain">Front Curtain</label>
        //             <select name="frontCurtain" id="frontCurtain"></select>
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label class="customBracketCheckBox" for="frontCurtainColor">Front Curtain Color</label>
        //             <select name="frontCurtain" id="frontCurtainColor"></select>
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label class="customBracketCheckBox" for="frontCurtainOpenness">Front Curtain Openness</label>
        //             <select name="frontCurtain" id="frontCurtainOpenness"></select>
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label class="customBracketCheckBox" for="frontCurtainDropSize">Front Curtain Drop Size</label>
        //             <select name="frontCurtain" id="frontCurtainDropSize"></select>
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label class="customBracketCheckBox" for="Hood">
        //         <input type="checkbox" id="Hood" class='requuiredField' />
        //         Hood
        //         </label>
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label class="customBracketCheckBox" for="backBoard">
        //         <input type="checkbox" id="backBoard" class='requuiredField' />
        //         Back Board
        //         </label>
        //         </div>
        //         <div class="flexItemsInputs">
        //         <label class="customBracketCheckBox" for="winterCover">
        //             <input type="checkbox" id="winterCover" />
        //             Winter Cover
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
        //         <label for="ValSize">Val Size</label>
        //         <input id="ValSize" type="text" class='requuiredField' />
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="numberOfBrackets"># of Brackets</label>
        //         <input id="numberOfBrackets" type="number" class='requuiredField' />
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label for="motorSize">Motor Size</label>
        //         <select id="motorSize" name="motorSize" class='requuiredField'></select>
        //         </div>
                
        //         <div class="flexItemsInputs">
        //         <label for="numberOfBrackets">Calculated Install Time</label>
        //         <input id="calculatedInstallTime" type="number" disabled />
        //         </div>

        //         <div class="flexItemsInputs">
        //         <label class="customBracketCheckBox" for="crossArm">
        //             <input type="checkbox" id="crossArm" disabled />
        //             Cross Arm
        //         </label>
        //         </div>

        //         <div class="flexItemsInputs" style="position: absolute; right: 0px; top: 130px;">
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

           // async function createHeader(type) {
       
      //   let Fabric_Ordered = oldOrderItem.Fabric_Ordered ? oldOrderItem.Fabric_Ordered : '';
      //   let RetractableType = ''
      //   if (oldOrderItem.Product_Category.includes('Awning')) {
      //     RetractableType = $('#crossArm').is(":checked") ? 'Cross Arm Retractable' : 'Standard Retractable'
      //   }

      //   let $formHeader = $(`
      //  <div id="RetractableAwningId" style="font-size: 14pt; font-family: 'Roboto', sans-serif;"> 
      //   <div class='RetractableAwningTitleWrapper'>
      //   <img style="margin-top: 10px;" src="img/logo.jpeg" alt="logo">
      //   <p class="RetractableAwningTitle">${oldOrderItem.Product_Category} ${type == 'reduction' ? 'Production' : 'Measure'} Sheet</p>
      //   <p style="font-size: 20pt;font-weight: bold; margin-top: 10px;">${mainOrder.Deal_Name}</p>
      //   </div>
      //   <p style="text-align: center; font-size: 14pt; min-height: 14px;">${RetractableType}</p>

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

      //   <p style="font-size: 18pt; font-family: 'Roboto', sans-serif; text-align: center; text-decoration: underline; margin-bottom: 0px; margin-top: 12px;">
      //     <b>${$('#crossArm').is(":checked") ? 'X ARM' : ''}</b>
      //   </p>
      //  </div> 
      //   `)
      //   $('.us-phone').mask('(000) 000-0000');

      //   return $formHeader;
      // }