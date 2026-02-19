const checkExtracheckboxes = {
    'Hood': ['No Hood', false],
    'PlugOptionText': ['-None-'],
    'CustomBrackets': [false],
    'IsCrossArms': [false],
    'WinterCover': [false],
    'Backboard': [false],
}
class MeasuresheetCreator {
    mainMeasureTabel(MeasureTabelInfo, measureObject, extras, firstColName) {
        return `     
            <div class="tableHeader">
                <p>${firstColName ? firstColName : ''}</p>
                <p>Per Salesperson</p>
                <p>Actual Measure</p>
            </div>
            <div class="table">
            ${this.createMeasureTabelRows(MeasureTabelInfo, measureObject, extras)}
            </div>`
    }
    createMeasureTabelRows(tabelRowsArray, values, extras) {
        let temp = ``
        tabelRowsArray.forEach(item => {
            temp = temp + `<div class="rowStyle">
                        <div class="measureLabelCol">${item.showName}:</div>
                        <div class=${typeof item.fullRow == 'undefined' ? 'measuredValue' : 'measuredValueFull'}>${values[item.name]}</div>
                        ${typeof item.fullRow == 'undefined' ? `<div class="measureActualCol"></div>` : ''}
                    </div >`
        })
        extras.length > 0 && (temp = temp + `<div class="rowStyle">
        <div class="measureLabelCol">Extras:</div>
         <div class="measuredValueSemiFull" id='extras'>
            ${this.measuresheetCreateExtraRow(extras, values)}
         </div>
        </div >`)
        return temp
    }

    measuresheetCreateExtraRow(extras, valueObj) {
        let temp = ``
        extras.length > 0 && extras.forEach(item => {
            console.log(checkExtracheckboxes[item.zoho_name], valueObj[item.zoho_name], "bfvsdfkj", checkExtracheckboxes[item.zoho_name].includes(valueObj[item.zoho_name]))
            if (item.type == 'checkbox') {
                temp = temp + `<label>
                 <input type="checkbox" ${checkExtracheckboxes[item.zoho_name].includes(valueObj[item.zoho_name]) ? '' : 'checked'} />
                ${item.name}
            </label>`
            }
            else {
                temp = temp + `
                <label  >
                    <p>${item.name}</p>
                    <input class="extraInputStyle" type="text" value=${valueObj[item.zoho_name] && valueObj[item.zoho_name] !== "-None-" ? valueObj[item.zoho_name] : ' '} />
                </label>
                `
            }
        })
        return temp
    }
    measuresheetNoteSection(measureObject, className) {
        return `<div class="awningMeasureNotes ${className ? className : ''}">Notes:
        ${measureObject.Note ? "** " + measureObject.Note : ''}
        </div>`
    }
    measuresheetImage(measureObject) {
        return ` <div id="PSWMeasure">
        <img class='measureImage' src=${"./img/" + measureObject.txtProductImageID + ".png"} alt="pswImage" />
        </div>`

    }
    measuresheetMountingTabel(measureObject) {
        return `<div class="tables" id='Mounting'>
                            <div class="tableTitle">Mounting Type/Material</div>
                            <div class="tableRow">
                                <div class="tableCol">
                                    ${measureObject.Mount == '-None-' || measureObject.Mount == null ? `<p></p>` : `<p>${measureObject.Mount}</p>`}
                                </div>
                                <div class="tableCol">
                                    ${measureObject.Material == '-None-' || measureObject.Material == null ? `<p></p>` : `<p>${measureObject.Material}</p>`}
                                </div>
                            </div>
                    </div>`
    }
    measuresheetMountingTabelPSW(measureObject) {
        return `<div class="tables" id='Mounting'>
                            <div class="tableTitle">Mounting Type/Material</div>
                            <div class="tableRow">
                                <div class="tableCol">
                                 
                                    ${measureObject.MountingType == '-None-' || measureObject.MountingType == null ? `<p></p>` : `<p>${measureObject.MountingType}</p>`}
                                </div>
                                <div class="tableCol">
                                
                                    ${measureObject.MountingMaterial == '-None-' || measureObject.MountingMaterial == null ? `<p></p>` : `<p>${measureObject.MountingMaterial}</p>`}
                                </div>
                            </div>
                    </div>`
    }
    measuresheetMountingTabelZipperShade(measureObject) {
        return `<div class="tables" id='Mounting'>
                            <div class="tableTitle">Mounting Type/Material</div>
                            <div class="tableRow">
                                <div class="tableCol">
                                 
                                    ${measureObject.Mount == '-None-' || measureObject.Mount == null ? `<p></p>` : `<p>${measureObject.Mount.split('-')[0]}</p>`}
                                </div>
                                <div class="tableCol">
                                
                                    ${measureObject.Mount == '-None-' || measureObject.Mount == null ? `<p></p>` : `<p>${measureObject.Mount.split('-')[1]}</p>`}
                                </div>
                            </div>
                    </div>`
    }
    measuresheetOtherInfoTabel(MeasureOtherInfoFields, measureObject) {
        return `<div class="tables">
                    <div class="tableTitle">Other Information</div>
                        ${this.measuresheetOtherInfo(MeasureOtherInfoFields, measureObject)} 
                </div>`
    }
    measuresheetOtherInfo(MeasureOtherInfoFields, measureObject) {
        let temp = ``
        MeasureOtherInfoFields.forEach(item => {
            if (!item.fullRow) {
                temp = temp + `<div class="tablesRows">
                <div class="tablesCols" style="border-right: 2px solid black;">${item.name}</div>
                <div class="tablesCols" style="border-right: 2px solid black;">${measureObject[item.zoho_name]}</div>
                <div class="tablesCols"></div>
                </div>`
            }
            else {
                temp = temp + `
                <div class="tablesRows">
                          <div class="tablesCols" style="flex-grow: 3;">${item.name}</div>
                          <div class="tablesCols"></div>
                          <div class="tablesCols"></div>
                      </div>`
            }
        })
        return temp
    }
    measuresheetCrank(measureObject) {
        return `<div class="tables">
        <div class="incompleteBorderTitle">
            <p>Hand Crank Size</p>
        </div>

        <div id="CreatedCrankSize">
            ${this.createCrankSize(measureObject)[0].outerHTML}
        </div>
        <label class="labelWrapper"> 
            Custom Crank Size:
            <input type="text" value=${measureObject.customcrank ? measureObject.customcrank : ''} />
        </label>
        </div>
        `
    }
    createCrankSize(measureObject) {
        let $crankDiv = $(`
          <div class="labelWrapper"></div>
        `)
        $('#CrankSize').children('option').each(function () {
            let objVal = measureObject.Crank.split(' ')
            let $innerCrankDiv = $(`
          <label for="${this.value}">
          <input type="checkbox"  ${objVal[objVal.length - 2] === 'Custom' && this.value.split(' ')[0] === 'Custom' ? "checked" : (measureObject.Crank.split(' ')[0] && this.value.split(' ')[0].includes(measureObject.Crank.split(' ')[0]) ? "checked" : "")} />
          ${this.value}
          </label>
          `)
            $crankDiv.append($innerCrankDiv)
        });
        // console.log($crankDiv, 'crankDiv');
        return $crankDiv;
    }
    measuresheetInstallInfo(order) {
        let utcTime = new Date(order.Scheduled_Date)
        return `
        <div class="tables">
        <div class="incompleteBorderTitle">
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
    </div>`
    }
}