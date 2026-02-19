// function createReductionSheetDataRows(dataArray, printObject, reductionNumber) {
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
//                 </div>`
//         }

//     })
//     return temp
// }

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

// const Reductionsheets = {
//     'Awning': async function createReductionSheet(printObject, reductionNumber, orderItems, order, installContactInfo, contactInfo, propertyInfo) {
//         // await ReductionNumberCreator()
//         $('#submitLA').css('display', 'none')
//         $('#measureFields').css('display', 'none')
//         let printDiv = $(`
//             <div id='AwningReduction' >
//                 <div class='dataWrapper'>
//                         <div class='patioRow'>
//                             <div class='col'>
//                             <div class='colTitle'>Building Information</div>
//                                     ${createReductionSheetDataRows(AwningFabricationInformationFields, printObject, reductionNumber)}
//                             </div>
//                             <div class='col'>
//                                 <div class='colTitle'>Sewing Information</div>
//                                     ${createReductionSheetDataRows(AwningSewingInformationFields, printObject)}
//                                 <div class="spacedBetweenRow rowSpacing">
//                                     <div class="labelStyle">Cloth Width ______</div>
//                                     <div class="labelStyle">Stripe Offset ______</div> 
//                                 </div>
//                                 <div class="reductionTabelRow">
//                                 <table >
//                                      ${reductionsheetTabel()}
//                                 </table>
//                                 </div>
//                                 <div class='colTitle'>Installation Information</div>
//                                      ${createReductionSheetDataRows(AwningInstallationInformationFields, printObject)}
//                             </div>
//                         </div>
//                         <p class="awningReductionNoteStyle">${printObject.Notes ? "**" + printObject.Notes : ''}</p>
//                         <div class='patioRow footerStyle' >
//                             ${measure_reductionSheetFooter('reduction')}
//                         </div>
//                 </div>
//             </div>
//             `);

//         let tmpHeader = Header('reduction ', orderItems, order, installContactInfo, contactInfo, propertyInfo)
//         printDiv.prepend(tmpHeader)
//         $('#LA').hide();
//         $('#mainTitle').hide();
//         $('#printBox').show()
//         $('#backToForm').show()
//         $('#mainContent').prepend(printDiv)
//         window.scrollTo(0, 0)
//     },
//     'PSW': async function createReductionSheet(printObject, reductionNumber, orderItems, order, installContactInfo, contactInfo, propertyInfo) {
//         $('#submitLA').css('display', 'none')
//         $('#measureFields').css('display', 'none')
//         let printDiv = $(`
//         <div id='PSWReduction' >
//             <div class='dataWrapper'>
//                     <div class='patioRow'>
//                     <div class='colLarge'>
//                     <div class='colTitle'>Building Information</div>
//                             ${createReductionSheetDataRows(PSWFabricationInformationFields, printObject, reductionNumber)}
//                         </div>
//                         <div class="d-flex justify-content-end">
//                         ${printObject.RollerTube && printObject.RollerTube.charAt(0) !== '1' ? '<div id="splitPanel">****SPLIT PANEL****</div>' : ''}
//                      </div>
//                         <div class='colSmall'>
//                         <div class='colTitle'>Sewing Information</div>
//                              ${createReductionSheetDataRows(PSWSewingInformationFields, printObject)}
//                              <div class="patioRow rowSpacing">
//                                     <p class='labelStyle'>${printObject['TopBottom']}</p>
//                              </div>
//                         </div>
//                     </div>
//                     <p class="awningMeasureNotes">${printObject.Notes ? "**" + printObject.Notes : ''}</p>
//                     <div class="imageContainer">
//                         <img class='measureImage' src=${"./img/" + printObject.txtProductImageID + ".png"} alt="pswImage" />
//                     </div>
//                     <div class="NoteSpot"></div>
//                     <div class='patioRow footerStyle' >
//                         ${measure_reductionSheetFooter('reduction')}
//                     </div>
//             </div>
//         </div>
//         `);

//         let tmpHeader = Header('reduction ', orderItems, order, installContactInfo, contactInfo, propertyInfo)
//         printDiv.prepend(tmpHeader)
//         $('#LA').hide();
//         $('#mainTitle').hide();
//         $('#printBox').show()
//         $('#backToForm').show()
//         $('#mainContent').prepend(printDiv)
//         window.scrollTo(0, 0)
//     },
//     'Solarshade': async function createReductionSheet(printObject) {
//         await ReductionNumberCreator()
//         $('#submitLA').css('display', 'none')
//         $('#measureFields').css('display', 'none')
//         let printDiv = $(`
//         <div id='SolarShadeReduction' >
//             <div class='dataWrapper'>
//                     <div class='patioRow'>
//                     <div class='colLarge'>
//                     <div class='colTitle'>Building Information</div>
//                             ${createReductionSheetDataRows(SolarShadeFabricationInformationFields, printObject)}
//                         </div>
//                         <div class="d-flex justify-content-end">
//                         ${printObject.RollerTube.charAt(0) !== '1' ? '<div id="splitPanel">****SPLIT PANEL****</div>' : ''}
//                      </div>
//                         <div class='colSmall'>
//                         <div class='colTitle'>Sewing Information</div>
//                              ${createReductionSheetDataRows(SolarShadeSewingInformationFields, printObject)}
//                              <div class="patioRow rowSpacing">
//                                     <p class='labelStyle'>${printObject['TopBottom']}</p>
//                              </div>
//                         </div>
//                     </div>
//                     <p class="awningMeasureNotes">${printObject.Notes ? "**" + printObject.Notes : ''}</p>
//                     <div class="imageContainer">
//                         <img class='measureImage' src=${"./img/" + printObject.txtProductImageID + ".png"} alt="pswImage" />
//                     </div>
//                     <div class="NoteSpot"></div>
//                     <div class='patioRow footerStyle' >
//                         ${measure_reductionSheetFooter('reduction')}
//                     </div>
//             </div>
//         </div>
//         `);

//         let tmpHeader = Header('reduction ', orderItems, order, installContactInfo, contactInfo, propertyInfo)
//         printDiv.prepend(tmpHeader)
//         $('#LA').hide();
//         $('#mainTitle').hide();
//         $('#printBox').show()
//         $('#backToForm').show()
//         $('#mainContent').prepend(printDiv)
//         window.scrollTo(0, 0)
//     }
// }

let reductionNumber = {}
function createReductionSheetDataRows(dataArray, printObject) {
    // console.log(printObject, printObject['Location'], 'location');
    let temp = ''
    dataArray.forEach(item => {
        if (item.singleLine) {
            temp = temp +
                `<div class="patioRow rowSpacing">
            <p class='labelStyle'>${printObject[item.name]} </p>
            </div>`
        }
        else {
            temp = temp +
                `<div class="patioRow rowSpacing">
                    <p class='labelStyle'>${item.showName}:  </p>
                    <p class='valueStyle'>
                    ${printObject[item.name] + (item.secondName ? " - " + printObject[item.secondName] : '') + (item.unit ? " " + item.unit : '')}
                                        </p>
                </div>`
        }

    })
    return temp
    //    ${item.name !== 'Number' || (item.name == 'Number' && printObject['Number']) ? printObject[item.name] + (item.secondName ? " - " + printObject[item.secondName] : '') + (item.unit ? " " + item.unit : '')
   // : reductionNumber.index + ' of ' + reductionNumber.total + (typeof printObject['Location'] !== 'undefined' && printObject['Location'] ? ' (' + printObject['Location'] + ')' : '')}

    //                         ${printObject[item.name] + (item.secondName ? " - " + printObject[item.secondName] : '') + (item.unit ? " " + item.unit : '')}

    // ${item.name !== 'Number' ? printObject[item.name] + (item.secondName ? " - " + printObject[item.secondName] : '') + (item.unit ? " " + item.unit : '')
    //         : reductionNumber.index + ' of ' + reductionNumber.total + ' (' + printObject['Location'] + ')'}

}

function listRenderer(dataArray) {
    let temp = ''
    dataArray.forEach(item => {
        temp = temp +
            `<p class='listItem'>${item}</p>`
    })
    return temp
}
async function ReductionNumberCreator(orderItems) {
    // get pageNumber
    reductionNumber = await checkNextNumber(orderItems);
    if (orderItems.Loc_No) {
        reductionNumber.index = orderItems.Loc_No;
    }
}

async function checkNextNumber(orderItems) {
    let responseObject = {
        total: 0,
        index: 0,
    }
    console.log(orderItems);
    let apicall = new apiCalls()
    let orderItemsList = await apicall.getRelatedRecordsFromZoho("Deals", orderItems.Order.id, "Order_Items")

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
    // console.log(responseObject, 'numberrr');
    responseObject.index = nextNumber

    return responseObject;
}



function reductionsheetTabel() {
    let temp = ''
    AwningoOtherInfo.forEach(item => {
        temp = temp + `<tr>
            <td>${item[0]}</td>
            <td>${item[1]}</td>
        </tr>`
    })
    return temp
}

const Reductionsheets = {
    'Awning': async function createReductionSheet(printObject, orderItems, order, installContactInfo, contactInfo, propertyInfo, pageBreakAfter) {
        // !printObject['Number'] && (await ReductionNumberCreator(orderItems))
        $('#submitLA').css('display', 'none')
        $('#measureFields').css('display', 'none')
        let printDiv = $(`
            <div id='AwningReduction' class=${pageBreakAfter ? 'pageBreakAfter' : ''} >
                <div class='dataWrapper'>
                        <div class='patioRow'>
                            <div class='colLarge'>
                            <div class='colTitle'>Building Information</div>
                                    ${createReductionSheetDataRows(AwningFabricationInformationFields, printObject)}
                            </div>
                            <div class="d-flex justify-content-end">
                                ${printObject.IsCrossed  ? '<div id="iscrossedStyle">X ARM</div>' : ''}
                            </div>
                            <div class='colSmall'>
                                <div class='colTitle'>Sewing Information</div>
                                    ${createReductionSheetDataRows(AwningSewingInformationFields, printObject)}
                                <div class="spacedBetweenRow rowSpacing">
                                    <div class="labelStyle">Cloth Width ______</div>
                                    <div class="labelStyle">Stripe Offset ______</div> 
                                </div>
                                <div class="reductionTabelRow">
                                <table >
                                     ${reductionsheetTabel()}
                                </table>
                                </div>
                                <div class='colTitle'>Installation Information</div>
                                     ${createReductionSheetDataRows(AwningInstallationInformationFields, printObject)}
                            </div>
                        </div>
                        <p class="awningReductionNoteStyle">${printObject.Note ? "**" + printObject.Note : ''}</p>
                        <div class='patioRow footerStyle' >
                            ${measure_reductionSheetFooter('reduction')}
                        </div>
                </div>
            </div>
            `);

        let tmpHeader = Header('reduction ', orderItems, order, installContactInfo, contactInfo, propertyInfo)
        printDiv.prepend(tmpHeader)
        $('#mainContent').append(printDiv)

    },
    'Patio Sun and Wind': async function createReductionSheet(printObject, orderItems, order, installContactInfo, contactInfo, propertyInfo, pageBreakAfter) {
        // !printObject['Number'] && (await ReductionNumberCreator(orderItems))
        let printDiv = $(`
        <div id='PSWReduction' class=${pageBreakAfter ? 'pageBreakAfter' : ''}>
            <div class='dataWrapper'>
                    <div class='patioRow'>
                    <div class='colLarge'>
                    <div class='colTitle'>Building Information</div>
                            ${createReductionSheetDataRows(PSWFabricationInformationFields, printObject)}
                        </div>
                        <div class="d-flex justify-content-end">
                        ${printObject.RollerTube && printObject.RollerTube.charAt(0) !== '1' ? '<div id="splitPanel">****SPLIT PANEL****</div>' : ''}
                     </div>
                        <div class='colSmall'>
                        <div class='colTitle'>Sewing Information</div>
                             ${createReductionSheetDataRows(PSWSewingInformationFields, printObject)}
                             <div class="patioRow rowSpacing">
                                    <p class='labelStyle'>${printObject['TopBottom']}</p>
                             </div>
                        </div>
                    </div>
                    <p class="awningMeasureNotes">${printObject.Note ? "**" + printObject.Note : ''}</p>
                    <div class="imageContainer">
                        <img class='measureImage' src=${"./img/" + printObject.txtProductImageID + ".png"} alt="pswImage" />
                    </div>
                    <div class="NoteSpot"></div>
                    <div class='patioRow footerStyle' >
                        ${measure_reductionSheetFooter('reduction')}
                    </div>
            </div>
        </div>
        `);

        let tmpHeader = Header('reduction ', orderItems, order, installContactInfo, contactInfo, propertyInfo)
        printDiv.prepend(tmpHeader)
        $('#mainContent').append(printDiv)

    },
    'Solar Shade': async function createReductionSheet(printObject, orderItems, order, installContactInfo, contactInfo, propertyInfo, pageBreakAfter) {
        // !printObject['Number'] && (await ReductionNumberCreator(orderItems))
        let printDiv = $(`
        <div id='SolarShadeReduction' class=${pageBreakAfter ? 'pageBreakAfter' : ''}>
            <div class='dataWrapper'>
                    <div class='patioRow'>
                    <div class='colLarge'>
                    <div class='colTitle'>Building Information</div>
                            ${createReductionSheetDataRows(SolarShadeFabricationInformationFields, printObject)}
                        </div>
                        <div class="d-flex justify-content-end">
                        ${printObject.RollerTube.charAt(0) !== '1' ? '<div id="splitPanel">****SPLIT PANEL****</div>' : ''}
                     </div>
                        <div class='colSmall'>
                        <div class='colTitle'>Sewing Information</div>
                             ${createReductionSheetDataRows(SolarShadeSewingInformationFields, printObject)}
                             <div class="patioRow rowSpacing">
                                    <p class='labelStyle'>${printObject['TopBottom']}</p>
                             </div>
                        </div>
                    </div>
                    <p class="awningMeasureNotes">${printObject.Note ? "**" + printObject.Note : ''}</p>
                    <div class="imageContainer">
                        <img class='measureImage' src=${"./img/" + printObject.txtProductImageID + ".png"} alt="pswImage" />
                    </div>
                    <div class="NoteSpot"></div>
                    <div class='patioRow footerStyle' >
                        ${measure_reductionSheetFooter('reduction')}
                    </div>
            </div>
        </div>
        `);

        let tmpHeader = Header('reduction ', orderItems, order, installContactInfo, contactInfo, propertyInfo)
        printDiv.prepend(tmpHeader)
        $('#mainContent').append(printDiv)

    },
    "Zipper Shade": async function createReductionSheet(printObject, orderItems, order, installContactInfo, contactInfo, propertyInfo, pageBreakAfter) {
        // !printObject['Number'] && (await ReductionNumberCreator(orderItems))
        let printDiv = $(`
        <div id='zipperShadeReduction' class=${pageBreakAfter ? 'pageBreakAfter' : ''}>
            <div class='dataWrapper'>
                    <div class='patioRow'>
                        <div class='colLarge'>
                        <div class='colTitle'>Building Information</div>
                            ${createReductionSheetDataRows(FabricationInformationFields, printObject)}
                        </div>
                        <div class='colSmall'>
                        <div class='colTitle'>Sewing Information</div>
                             ${createReductionSheetDataRows(SewingInformationFields, printObject)}
                             <div class="patioRow rowSpacing">
                                    <p class='labelStyle'>${printObject['TopBottom']}</p>
                             </div>
                        </div>
                    </div>
                    <p class="awningMeasureNotes">${printObject.Note ? "**" + printObject.Note : ''}</p>
                    <div class="imageContainer">
                        <img class='measureImage' src=${"./img/" + printObject.txtProductImageID + ".png"} alt="pswImage" />
                    </div>
                    <div class="NoteSpot"></div>
                    <div class='patioRow footerStyle' >
                        ${measure_reductionSheetFooter('reduction')}
                    </div>
            </div>
        </div>
        `);

        let tmpHeader = Header('reduction ', orderItems, order, installContactInfo, contactInfo, propertyInfo)
        printDiv.prepend(tmpHeader)
        $('#mainContent').append(printDiv)

    },
    "Patio Cover": async function createReductionSheet(printObject, orderItems, order, installContactInfo, contactInfo, propertyInfo, pageBreakAfter) {
        // !printObject['Number'] && (await ReductionNumberCreator(orderItems))
        let printDiv = $(`
        <div id='patioCoverReduction' class=${pageBreakAfter ? 'pageBreakAfter' : ''}>
            <div class='dataWrapper'>
                    <div class='patioRow'>
                        <div class='colSmall'>
                        <div class='colTitle'>Fabrication Information</div>
                            ${createReductionSheetDataRows(PatioFabricationInformationFields, printObject)}
                        </div>
                        <div class='colLarge'>
                        <div class='colTitle'>Sewing Information</div>
                             ${createReductionSheetDataRows(PatioSewingInformationFields, printObject)}
                        </div>
                    </div>
                    <div class='patioRow rowSpacingbig'>
                        <div class='fullWidthCol'>
                             ${createReductionSheetDataRows(PatioOtherInfo, printObject)}
                        </div>
                    </div>

                    <div class='patioRow rowSpacingbig'>
                        <div class='col'>
                            <div class='colFlexTitle'>Post Locations From Left</div>
                            <div class='flexColSmall'>
                                ${listRenderer(printObject.PostLocationsFromLeft)}
                            </div>
                        </div>
                        <div class='col'>
                            <div class='colFlexTitle'>Mounting Hole Locations From Left</div>
                            <div class='flexCol'>
                                ${listRenderer(printObject.MountingHoleLocationFromLeft)}

                            </div>
                        </div>
                        <div class='col'>
                            <div class='colFlexTitle'>Rafter Hole Locations From Left</div>
                            <div class='flexCol'>
                                ${listRenderer(printObject.RafterHoleLocationsFromLeft)}
                            </div>
                        </div>
                    </div>
                    <div class="NoteSpot"></div>
                    </div>
                    <div class='patioRow footerStyle' >
                        ${measure_reductionSheetFooter('reduction')}
                    </div>
        </div>
        `);

        let tmpHeader = Header('reduction ', orderItems, order, installContactInfo, contactInfo, propertyInfo)
        printDiv.prepend(tmpHeader)
        $('#mainContent').append(printDiv)

    }
}