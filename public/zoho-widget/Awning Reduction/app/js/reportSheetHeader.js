const options = {

}
function Header(type, oldOrderItem, mainOrder, installContactInfo, contactInfo, propertyInfo) {
  let utcTime, utcTime2
  mainOrder.Closing_Date && (utcTime = new Date(mainOrder.Closing_Date))
  mainOrder.Scheduled_Measure_Date && (utcTime2 = new Date(mainOrder.Scheduled_Measure_Date))

  let Fabric_Ordered = oldOrderItem.Fabric_Ordered ? oldOrderItem.Fabric_Ordered : '';
  let RetractableType = ''
  let $formHeader
  if (oldOrderItem.Product_Category.includes('Awning')) {
    RetractableType = $('#crossArm').is(":checked") ? 'Cross Arm Retractable' : 'Standard Retractable'
    $formHeader = $(`
      <div id="RetractableAwningId" style="font-size: 14pt; font-family: 'Roboto', sans-serif;  "> 
       <div class='RetractableAwningTitleWrapper' >
       <img style="margin-top: 10px;" src="img/logo.jpeg" alt="logo">
       <p class="RetractableAwningTitle">${oldOrderItem.Product_Category} ${type.trim() == 'reduction' ? 'Production' : 'Measure'} Sheet</p>
       <p style="font-size: 20pt;font-weight: bold; margin-top: 10px;">${mainOrder.Deal_Name}</p>
       </div>
       <p style="text-align: center; font-size: 14pt; min-height: 14px;">${RetractableType}</p>
   
       <div class="headerInfo">
       <div class="headerInfoItem_1">
       <div class="innerInfoLeft"><b>Job Address: </b></div>
        <div id="install-info">${installContactInfo && installContactInfo.Full_Name ? installContactInfo.Full_Name + '|' : ''} ${installContactInfo && installContactInfo.Phone ? "<span class='us-phone'>" + installContactInfo.Phone + "</span>" + " | " : ""} ${installContactInfo && installContactInfo.Mobile ? "<span class='us-phone'>" + installContactInfo.Mobile + "</span>" : ""}</div>
        <div id="contact-info">${contactInfo && contactInfo.Full_Name ? contactInfo.Full_Name + " | " : ""}
        ${contactInfo && contactInfo.Phone ? ("<span class='us-phone'>" + contactInfo.Phone + "</span>" + " | ") : ""}
        ${contactInfo && contactInfo.Mobile ? "" : "<br />"}
        ${contactInfo && contactInfo.Mobile ? "<span class='us-phone'>" + contactInfo.Mobile + "</span>" + "  <br>" : ""}
        ${propertyInfo && propertyInfo.Address_Line_1 ? (propertyInfo.Address_Line_1 + " <br>") : ""}
        ${propertyInfo && propertyInfo.Address_Line_2 ? (propertyInfo.Address_Line_2 + "<br>") : ""}
        ${propertyInfo && propertyInfo.City ? (propertyInfo.City + " ") : ""}
        ${propertyInfo && propertyInfo.State ? (propertyInfo.State + " ") : ""}
        ${propertyInfo && propertyInfo.Zip_Code ? (propertyInfo.Zip_Code + " ") : ""}</div>
       </div>
       
       <div class="headerInfoItem_2">
         <div class="innerInfoLeft"><b>Salesperson: </b><span class="innerInfoLeft">${mainOrder.Owner.name}</span></div>
         <div class="innerInfoLeft"><b>Order Date: </b><span class="innerInfoLeft">${mainOrder.Closing_Date ? (('0' + (utcTime.getUTCMonth() + 1)).slice(-2) + '/' + ('0' + utcTime.getUTCDate()).slice('-2') + '/' + utcTime.getUTCFullYear()) : ""}</span></div>
         <div class="innerInfoLeft"><b>Measure Date: </b><span class="innerInfoLeft">${mainOrder.Scheduled_Measure_Date ? (('0' + (utcTime2.getUTCMonth() + 1)).slice(-2) + '/' + ('0' + utcTime2.getUTCDate()).slice('-2') + '/' + utcTime2.getUTCFullYear()) : ""}</span></div>
         ${type.trim() == 'reduction' ? '<div class="innerInfoLeft"><b>Fabric Ordered: </b><span class="innerInfoLeft">' + Fabric_Ordered + '</span></div>' : ''}
         ${type.trim() === 'measure' ? '<div class="innerInfoLeft"><b>Arrival Time: </b><span class="innerInfoLeft">' + mainOrder.Measure_Arrival_Window + '</span></div>' : ''}
         </div>
       </div>
   
       <p style="font-size: 18pt; font-family: 'Roboto', sans-serif; text-align: center; text-decoration: underline; margin-bottom: 0px; margin-top: 12px;">
         <b>${$('#crossArm').is(":checked") ? 'X ARM' : ''}</b>
       </p>
      </div> 
       `)
    $('.us-phone').mask('(000) 000-0000');
  }
  else {
    $formHeader = $(`
    <div id="RetractableAwningId" style="font-size: 14pt; font-family: 'Roboto', sans-serif; "> 
     <div class='RetractableAwningTitleWrapper'>
     <img style="margin-top: 10px;" src="img/logo.jpeg" alt="logo">
     <p class="RetractableAwningTitle">${oldOrderItem.Product_Category} ${type.trim() == 'reduction' ? 'Production' : 'Measure'} Sheet</p>
     <p style="font-size: 20pt;font-weight: bold; margin-top: 10px;">${mainOrder.Deal_Name}</p>
     </div>
     <p style="text-align: center; font-size: 14pt; min-height: 14px;"></p>

     <div class="headerInfo">
     <div class="headerInfoItem_1">
     <div class="innerInfoLeft"><b>Job Address: </b></div>
      <div id="install-info">${installContactInfo && installContactInfo.Full_Name ? installContactInfo.Full_Name + '|' : ''} ${installContactInfo && installContactInfo.Phone ? "<span class='us-phone'>" + installContactInfo.Phone + "</span>" + " | " : ""} ${installContactInfo && installContactInfo.Mobile ? "<span class='us-phone'>" + installContactInfo.Mobile + "</span>" : ""}</div>
      <div id="contact-info">${contactInfo && contactInfo.Full_Name ? contactInfo.Full_Name + " | " : ""}
      ${contactInfo && contactInfo.Phone ? ("<span class='us-phone'>" + contactInfo.Phone + "</span>" + " | ") : ""}
      ${contactInfo && contactInfo.Mobile ? "" : "<br />"}
      ${contactInfo && contactInfo.Mobile ? "<span class='us-phone'>" + contactInfo.Mobile + "</span>" + "  <br>" : ""}
      ${propertyInfo && propertyInfo.Address_Line_1 ? (propertyInfo.Address_Line_1 + " <br>") : ""}
      ${propertyInfo && propertyInfo.Address_Line_2 ? (propertyInfo.Address_Line_2 + "<br>") : ""}
      ${propertyInfo && propertyInfo.City ? (propertyInfo.City + " ") : ""}
      ${propertyInfo && propertyInfo.State ? (propertyInfo.State + " ") : ""}
      ${propertyInfo && propertyInfo.Zip_Code ? (propertyInfo.Zip_Code + " ") : ""}</div>
     </div>
     
     <div class="headerInfoItem_2">
       <div class="innerInfoLeft"><b>Salesperson: </b><span class="innerInfoLeft">${mainOrder.Owner.name}</span></div>
       <div class="innerInfoLeft"><b>Order Date: </b><span class="innerInfoLeft">${mainOrder.Closing_Date ? (('0' + (utcTime.getUTCMonth() + 1)).slice(-2) + '/' + ('0' + utcTime.getUTCDate()).slice('-2') + '/' + utcTime.getUTCFullYear()) : ""}</span></div>
         <div class="innerInfoLeft"><b>Measure Date: </b><span class="innerInfoLeft">${mainOrder.Scheduled_Measure_Date ? (('0' + (utcTime2.getUTCMonth() + 1)).slice(-2) + '/' + ('0' + utcTime2.getUTCDate()).slice('-2') + '/' + utcTime2.getUTCFullYear()) : ""}</span></div>
       ${type.trim() === 'reduction' ? '<div class="innerInfoLeft"><b>Fabric Ordered: </b><span class="innerInfoLeft">' + Fabric_Ordered + '</span></div>' : ''}
       ${type.trim() === 'measure' ? '<div class="innerInfoLeft"><b>Arrival Time: </b><span class="innerInfoLeft">' + (mainOrder.Measure_Arrival_Window ? mainOrder.Measure_Arrival_Window : '') + '</span></div>' : ''}
     </div>
     </div>
    </div> 
     `)
    $('.us-phone').mask('(000) 000-0000');

  }

  return $formHeader;
}