
// // let mainOrder, installContactInfo, contactInfo, propertyInfo, MountingTypeList, MountingSurfaceList, Shade_Reduction_Fields_Def;
// // let pageNumber = 1
// // let totlaPageNumber = 1;
// // var options = {
// //   year: "numeric",
// //   month: "numeric",
// //   day: "numeric",
// //   timeZone: "UTC",
// // };
// // let uniqueInsertedData = [];

// jQuery(function ($) {

//   getData()

//   async function getData() {

//     await ZOHO.embeddedApp.on("PageLoad", async function (data) {
//       ZOHO.CRM.UI.Resize({ height: "90%", width: "95%" }).then(function (
//         data
//       ) { });

//       // await ZOHO.CRM.API.getRecord({
//       //   Entity: "Deals",
//       //   RecordID: data.EntityId[0]
//       // }).then(async function (orderData) {
//       //   mainOrder = orderData.data[0]
//       //   if (orderData.data[0].Type == "Awning") {

//       //     //add a print button to top
//       //     //collect all reductionsheets in a file

//       //     // get Contacts
//       //     await ZOHO.CRM.API.getRecord({
//       //       Entity: "Contacts",
//       //       RecordID: mainOrder.Contact_Name.id
//       //     }).then(async function (contactData) {
//       //       contactInfo = contactData.data[0];
//       //       // get Properties
//       //       await ZOHO.CRM.API.getRecord({
//       //         Entity: "Properties",
//       //         RecordID: mainOrder.Property.id
//       //       }).then(function (propertyData) {
//       //         propertyInfo = propertyData.data[0];
//       //       });
//       //     });
//       //     // get install Contacts
//       //     if (mainOrder.Install_Contact) {
//       //       await ZOHO.CRM.API.getRecord({
//       //         Entity: "Contacts",
//       //         RecordID: mainOrder.Install_Contact.id
//       //       }).then(function (installData) {
//       //         installContactInfo = installData.data[0]
//       //       });
//       //     }
//       //     // get mounting-type table
//       //     ZOHO.CRM.META.getFields({ Entity: "Order_Items" }).then(function (data) {
//       //       MountingTypeList = data.fields.filter(function (value, index, arr) {
//       //         if (value.api_name == "Mounting_type") {
//       //           console.log(value.pick_list_values, "Mounting_type");
//       //           return value.pick_list_values;
//       //         }
//       //       });
//       //       MountingSurfaceList = data.fields.filter(function (value, index, arr) {
//       //         if (value.api_name == "Mounting_Surface") {
//       //           console.log(value.pick_list_values, "Mounting_Surface");
//       //           return value.pick_list_values;
//       //         }
//       //       });
//       //     });
//       //     // get orderItems data
//       //     ZOHO.CRM.API.getRelatedRecords({
//       //       Entity: "Deals",
//       //       RecordID: data.EntityId[0],
//       //       RelatedList: "Order_Items"
//       //     }).then(async function (orderItems) {
//       //       if (orderItems.data) {

//       //         let items = orderItems.data;
//       //         let sortedList = items.sort((a, b) => a.Product_Category.localeCompare(b.Product_Category))

//       //         let tmparray = [];
//       //         tmparray = sortedList;

//       //         totlaPageNumber = tmparray.length;
//       //         for (let j = 0; j < tmparray.length; j++) {
//       //           let $SheetDiv = $(``);
//       //           if (tmparray[j].Product_Category.includes('Awning')
//       //             // && !uniqueInsertedData.includes('Awning')
//       //           ) {
//       //             let measureResponse = await requestToMKZ(tmparray[j]);
//       //             console.log(measureResponse, 'measureResponse');
//       //             // uniqueInsertedData.push('Awning')
//       //             $SheetDiv = $(`
//       //             <div class="container" id="LAPrint">
//       //             <div class="headerInfo" id="awningHeader"></div>
//       //             <div class="mainInfoWrapper">
//       //               <div class="infoCol">
//       //                 <p class="infoColTitle">Fabric Information</p>

//       //                 <div class="fabricInfoCol">
//       //                   <div class="fabricInfoColItem">Number: </div>
//       //                   <div class="fabricInfoColItem">${pageNumber.index}</div>
//       //                   <div class="fabricInfoColItem">Type: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Type ? measureResponse.Type : ''}</div>
//       //                   <div class="fabricInfoColItem">Width: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Width[0]} (${measureResponse.Width[1]} Ft. ${measureResponse.Width[2]} In)</div>
//       //                   <div class="fabricInfoColItem">Projection: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Projection[0]} - (${measureResponse.Projection[1]} Arms)</div>
//       //                   <div class="fabricInfoColItem">Frame: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.FrameColor}</div>
//       //                   <div class="fabricInfoColItem">Operator: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Operator[0]} (${measureResponse.Operator[1]})</div>
//       //                   <div class="fabricInfoColItem">Motor: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Motor}</div>
//       //                   <div class="fabricInfoColItem">Switch/TX: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Switch_TX}</div>
//       //                   <div class="fabricInfoColItem">Controls: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Controls ? measureResponse.Controls : ''}</div>
//       //                   <div class="fabricInfoColItem">Cord/Plug: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Cord_Plug}</div>
//       //                   <div class="fabricInfoColItem">Back Bar: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.BackBar} In.</div>
//       //                   <div class="fabricInfoColItem">Front Bar: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.FrontBar[0]} In. ${measureResponse.RetractableFrontCurtain != '-None-' ? "- 1.5in. RETRACTABLE FRONT CURTAIN" : ""}</div>
//       //                   <div class="fabricInfoColItem">Roller Tube: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.RollerTube} - 70mm</div>
//       //                   <div class="fabricInfoColItem" style="max-width: 100%; flex: 1 0 100%;">Attach knuckles ${measureResponse.Attach} In. from ends of back bar.</div>
//       //                   <div class="fabricInfoColItem" style="max-width: 0%; flex: 1 0 0%;"></div>
//       //                   <div class="fabricInfoColItem" style="max-width: 100%; flex: 1 0 100%;">Use Standard Upper Slope Hole</div>
//       //                   <div class="fabricInfoColItem" style="max-width: 0%; flex: 1 0 0%;"></div>
//       //                   <div class="fabricInfoColItem">Center Support: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.CenterSupport}</div>
//       //                   <div class="fabricInfoColItem">Hood: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Hood}</div>
//       //                   <div class="fabricInfoColItem">Wind Legs: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.WindLegs}</div>
//       //                   <div class="fabricInfoColItem">Curtain: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.RetractableFrontCurtain} ${measureResponse.FrontCurtainColor ? '- ' + measureResponse.FrontCurtainColor : ''} ${measureResponse.FrontCurtainOpenness ? '- ' + measureResponse.FrontCurtainOpenness : ''} ${measureResponse.FrontCurtainDropSize ? '- ' + measureResponse.FrontCurtainDropSize + 'In.' : ''} </div>
//       //                   <div class="fabricInfoColItem">Crank: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Crank}</div>
//       //                   <div class="fabricInfoColItem" style="max-width: 100%; flex: 1 0 100%;"><b>${measureResponse.CustomBrackets}</b></div>
//       //                   <div class="fabricInfoColItem" style="max-width: 0%; flex: 1 0 0%;"></div>

//       //                 </div>

//       //               </div>
//       //               <div class="infoCol">
//       //                 <p class="infoColTitle">Sewing Information</p>
//       //                 <div class="fabricInfoCol">
//       //                   <div class="fabricInfoColItem">Yards: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.TotalYardage} Yards</div>
//       //                   <div class="fabricInfoColItem">Fabric: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Material}</div>
//       //                   <div class="fabricInfoColItem">Valance: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Valance[0]} - ${measureResponse.Valance[1]} In.</div>
//       //                   <div class="fabricInfoColItem">Binding </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Binding}</div>
//       //                   <div class="fabricInfoColItem">Panels cut length: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.PanelsCutLength[0]} Panels at ${measureResponse.PanelsCutLength[1]}</div>
//       //                   <div class="fabricInfoColItem">Finished Width: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.FinishedWidth} In.</div>
//       //                   <div class="fabricInfoColItem">Cloth Width: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.ActualClothWidth}</div>
//       //                   <div class="fabricInfoColItem">Stripe Offset: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.StripOffset}</div>
//       //                   <div class="fabricInfoColItem">Hot Knife: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.HotKnife}</div>
//       //                   <div class="fabricInfoColItem">Curtain: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.RetractableFrontCurtain} ${measureResponse.FrontCurtainColor ? '- ' + measureResponse.FrontCurtainColor : ''} ${measureResponse.FrontCurtainOpenness ? '- ' + measureResponse.FrontCurtainOpenness : ''} ${measureResponse.FrontCurtainDropSize ? '- ' + measureResponse.FrontCurtainDropSize + 'In.' : ''} </div>
//       //                   <div style="margin-top: 40px;" class="fabricInfoColItem">Cloth Width ___________</div>
//       //                   <div style="margin-top: 40px;" class="fabricInfoColItem">Stripe Offset ___________</div>
//       //                 </div>

//       //                 <div class="fabricStaticCol">
//       //                   <div class="fabricStaticInside">
//       //                     <div class="colStyle">
//       //                       <div class="colStyleInside">1/16- .062</div>
//       //                       <div class="colStyleInside">9/16- .562</div>
//       //                     </div>
//       //                     <div class="colStyle">
//       //                       <div class="colStyleInside">1/8- .125</div>
//       //                       <div class="colStyleInside">5/8- .625</div>
//       //                     </div>
//       //                     <div class="colStyle">
//       //                       <div class="colStyleInside">3/16- .187</div>
//       //                       <div class="colStyleInside">11/16- .687</div>
//       //                     </div>
//       //                     <div class="colStyle">
//       //                       <div class="colStyleInside">1/4- .250</div>
//       //                       <div class="colStyleInside">3/4- .750</div>
//       //                     </div>
//       //                     <div class="colStyle">
//       //                       <div class="colStyleInside">5/16- .312</div>
//       //                       <div class="colStyleInside">13/16- .812</div>
//       //                     </div>
//       //                     <div class="colStyle">
//       //                       <div class="colStyleInside">3/8- .375</div>
//       //                       <div class="colStyleInside">7/8/16- .875</div>
//       //                     </div>
//       //                     <div class="colStyle">
//       //                       <div class="colStyleInside">7/16- .437</div>
//       //                       <div class="colStyleInside">15/16- .937</div>
//       //                     </div>
//       //                     <div class="colStyle">
//       //                       <div class="colStyleInside">1/2- .500</div>
//       //                       <div class="colStyleInside"> </div>
//       //                     </div>
//       //                   </div>
//       //                 </div>

//       //                 <p class="infoColTitle">Installation Information</p>

//       //                 <div class="fabricInfoCol">
//       //                   <div class="fabricInfoColItem">Install Time: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.InstallTime} Hrs</div>
//       //                   <div class="fabricInfoColItem"># Brackets: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.QtyOfBrackets}</div>
//       //                   <div class="fabricInfoColItem">Mount Height: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.MountHeight}</div>
//       //                   <div class="fabricInfoColItem">Valance Height: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.ValanceHeight}</div>
//       //                   <div class="fabricInfoColItem">Mount Surface: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.MountSurface}</div>
//       //                   <div class="fabricInfoColItem">Mount Location: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.MountLocation}</div>
//       //                 </div>

//       //               </div>
//       //             </div>
//       //           </div>                                  
//       //             `);
//       //             let $headerDiv = createHeader(tmparray[j], tmparray[j].Product_Category, pageNumber)
//       //             let $footerDiv = createFooter(measureResponse, measureResponse.Type)
//       //             $SheetDiv.prepend($headerDiv)
//       //             $SheetDiv.append($footerDiv)
//       //             let mainDiv = $('<div id="Retractable"></div>')
//       //             mainDiv.append($SheetDiv)
//       //             $('#sheetsID').append(mainDiv)
//       //             pageNumber++;
//       //           }

//       //           if (tmparray[j].Product_Category.includes('Patio Sun and Wind')
//       //             // && !uniqueInsertedData.includes('Patio Sun and Wind')
//       //           ) {
//       //             let measureResponse = await requestToMKZ(tmparray[j]);
//       //             // uniqueInsertedData.push('Patio Sun and Wind')

//       //             $SheetDiv = $(`
//       //             <div class="container" id="LAPrint">
//       //             <div class="headerInfo" id="awningHeader"></div>
//       //             <div class="mainInfoWrapper">
//       //               <div class="infoCol">
//       //                 <p class="infoColTitle">Fabric Information</p>

//       //                 <div class="fabricInfoCol">
//       //                   <div class="fabricInfoColItem">Number: </div>
//       //                   <div class="fabricInfoColItem">${pageNumber.index}</div>
//       //                   <div class="fabricInfoColItem">Type: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Type ? measureResponse.Type : ''}</div>
//       //                   <div class="fabricInfoColItem">Width: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Width[0]} (${measureResponse.Width[1]} Ft. ${measureResponse.Width[2]} In)</div>
//       //                   <div class="fabricInfoColItem">Drop: </div>
//       //                   <div class="fabricInfoColItem"> </div>
//       //                   <div class="fabricInfoColItem">Frame Color: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.FrameColor}</div>
//       //                   <div class="fabricInfoColItem">Roller Tube: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.RollerTube} - 70mm</div>
//       //                   <div class="fabricInfoColItem">Bottom Pipe: </div>
//       //                   <div class="fabricInfoColItem"> </div>
//       //                   <div class="fabricInfoColItem">Operator: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Operator[0]} (${measureResponse.Operator[1]})</div>
//       //                   <div class="fabricInfoColItem">Controls: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Controls ? measureResponse.Controls : ''}</div>
//       //                   <div class="fabricInfoColItem">Mount: </div>
//       //                   <div class="fabricInfoColItem"></div>
//       //                   <div class="fabricInfoColItem">Hood: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Hood}</div>
//       //                   <div class="fabricInfoColItem">Crank: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Crank}</div>
//       //                   <div class="fabricInfoColItem">Motor: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Motor}</div>
//       //                   <div class="fabricInfoColItem">Switch/TX: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Switch_TX}</div>
//       //                   <div class="fabricInfoColItem">Cord/Plug: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Cord_Plug}</div>

//       //                 </div>

//       //               </div>
//       //               <div class="infoCol">
//       //                 <p class="infoColTitle">Sewing Information</p>
//       //                 <div class="fabricInfoCol">
//       //                   <div class="fabricInfoColItem">Total Yardage: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.TotalYardage} Yards</div>
//       //                   <div class="fabricInfoColItem">Material: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Material}</div>
//       //                   <div class="fabricInfoColItem">Panels cut length: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.PanelsCutLength[0]} Panels at ${measureResponse.PanelsCutLength[1]}</div>
//       //                   <div class="fabricInfoColItem">Final Fabric Width: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.FinishedWidth} In.</div>
//       //                   <div class="fabricInfoColItem">Downsize Length: </div>
//       //                   <div class="fabricInfoColItem"> In.</div>
//       //                   <div class="fabricInfoColItem">Final Fabric Length: </div>
//       //                   <div class="fabricInfoColItem"> In.</div>
//       //                   <div class="fabricInfoColItem" style="max-width: 100%; flex: 1 0 100%;">Sew rope in top, weld 3" pipe pocket bottom</div>

//       //                 </div>

//       //                 <p class="infoColTitle">Installation Information</p>

//       //                 <div class="fabricInfoCol">
//       //                   <div class="fabricInfoColItem">Install Time: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.InstallTime} Hrs</div>
//       //                   <div class="fabricInfoColItem">Mount Height: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.MountHeight}</div>
//       //                   <div class="fabricInfoColItem">Valance Height: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.ValanceHeight}</div>
//       //                   <div class="fabricInfoColItem">Mount Surface: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.MountSurface}</div>
//       //                   <div class="fabricInfoColItem">Mount Location: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.MountLocation}</div>
//       //                 </div>

//       //               </div>
//       //             </div>

//       //           </div>
//       //              `)
//       //             let $headerDiv = createHeader(tmparray[j], tmparray[j].Product_Category, pageNumber)
//       //             let $footerDiv = createFooter(measureResponse, measureResponse.Type)
//       //             $SheetDiv.prepend($headerDiv)
//       //             $SheetDiv.append($footerDiv)
//       //             let mainDiv = $('<div id="PatioSunWind"></div>')
//       //             mainDiv.append($SheetDiv)
//       //             $('#sheetsID').append(mainDiv)
//       //             pageNumber++
//       //           }

//       //           if (tmparray[j].Product_Category.includes('Shade')
//       //             // && !uniqueInsertedData.includes('Shade')
//       //           ) {
//       //             let measureResponse = await requestToMKZ(tmparray[j]);
//       //             // uniqueInsertedData.push('Shade')

//       //             $SheetDiv = $(`
//       //             <div class="container" id="LAPrint">
//       //             <div class="headerInfo" id="awningHeader"></div>
//       //             <div class="mainInfoWrapper">
//       //               <div class="infoCol">
//       //                 <p class="infoColTitle">Fabric Information</p>

//       //                 <div class="fabricInfoCol">
//       //                   <div class="fabricInfoColItem">Number: </div>
//       //                   <div class="fabricInfoColItem">${pageNumber}</div>
//       //                   <div class="fabricInfoColItem">Type: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Type ? measureResponse.Type : ''}</div>
//       //                   <div class="fabricInfoColItem">Width: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Width[0]} (${measureResponse.Width[1]} Ft. ${measureResponse.Width[2]} In)</div>
//       //                   <div class="fabricInfoColItem">Drop: </div>
//       //                   <div class="fabricInfoColItem"> </div>
//       //                   <div class="fabricInfoColItem">Frame Color: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.FrameColor}</div>
//       //                   <div class="fabricInfoColItem">Roller Tube: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.RollerTube} - 70mm</div>
//       //                   <div class="fabricInfoColItem">Bottom Pipe: </div>
//       //                   <div class="fabricInfoColItem"> </div>
//       //                   <div class="fabricInfoColItem">Operator: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Operator[0]} (${measureResponse.Operator[1]})</div>
//       //                   <div class="fabricInfoColItem">Controls: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Controls ? measureResponse.Controls : ''}</div>
//       //                   <div class="fabricInfoColItem">Mount: </div>
//       //                   <div class="fabricInfoColItem"></div>
//       //                   <div class="fabricInfoColItem">Hood: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Hood}</div>
//       //                   <div class="fabricInfoColItem">Crank: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Crank}</div>
//       //                   <div class="fabricInfoColItem">Motor: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Motor}</div>
//       //                   <div class="fabricInfoColItem">Switch/TX: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Switch_TX}</div>
//       //                   <div class="fabricInfoColItem">Cord/Plug: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Cord_Plug}</div>

//       //                 </div>

//       //               </div>
//       //               <div class="infoCol">
//       //                 <p class="infoColTitle">Sewing Information</p>
//       //                 <div class="fabricInfoCol">
//       //                   <div class="fabricInfoColItem">Total Yardage: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.TotalYardage} Yards</div>
//       //                   <div class="fabricInfoColItem">Material: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.Material}</div>
//       //                   <div class="fabricInfoColItem">Panels cut length: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.PanelsCutLength[0]} Panels at ${measureResponse.PanelsCutLength[1]}</div>
//       //                   <div class="fabricInfoColItem">Final Fabric Width: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.FinishedWidth} In.</div>
//       //                   <div class="fabricInfoColItem">Downsize Length: </div>
//       //                   <div class="fabricInfoColItem"> In.</div>
//       //                   <div class="fabricInfoColItem">Final Fabric Length: </div>
//       //                   <div class="fabricInfoColItem"> In.</div>
//       //                   <div class="fabricInfoColItem" style="max-width: 100%; flex: 1 0 100%;">Sew rope in top, weld 3" pipe pocket bottom</div>

//       //                 </div>

//       //                 <p class="infoColTitle">Installation Information</p>

//       //                 <div class="fabricInfoCol">
//       //                   <div class="fabricInfoColItem">Install Time: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.InstallTime} Hrs</div>
//       //                   <div class="fabricInfoColItem">Mount Height: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.MountHeight}</div>
//       //                   <div class="fabricInfoColItem">Valance Height: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.ValanceHeight}</div>
//       //                   <div class="fabricInfoColItem">Mount Surface: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.MountSurface}</div>
//       //                   <div class="fabricInfoColItem">Mount Location: </div>
//       //                   <div class="fabricInfoColItem">${measureResponse.MountLocation}</div>
//       //                 </div>

//       //               </div>
//       //             </div>

//       //           </div>
//       //               `)
//       //             let $headerDiv = createHeader(tmparray[j], tmparray[j].Product_Category, pageNumber)
//       //             let $footerDiv = createFooter(measureResponse, measureResponse.Type)
//       //             $SheetDiv.prepend($headerDiv)
//       //             $SheetDiv.append($footerDiv)
//       //             let mainDiv = $('<div id="SolarShade"></div>')
//       //             mainDiv.append($SheetDiv)
//       //             $('#sheetsID').append(mainDiv)
//       //             pageNumber++
//       //           }
//       //         }
//       //         // totlaPageNumber = uniqueInsertedData.length;
//       //         $('.totlaPageNumber').empty();
//       //         $('.totlaPageNumber').html(totlaPageNumber)
//       //       }
//       //     })
//       //   }
//       // });

//     });
//     ZOHO.embeddedApp.init();
//   }

//   function createHeader(orderItem, type, pageNumber) {
//     let $header = $(`
//       <div class='RetractableAwningTitleWrapper'>
//       <p>Liberty Home Products</p>
//         <p class="RetractableAwningTitle">${type} Measure Sheet</p>
//         <p>${mainOrder.Deal_Name}</p>
//       </div>
//         <div class="headerInfo">
//           <div class="headerInfoItem_1">
//           <div class="innerInfoLeft"><b>Job Address: </b></div>
//            <div id="install-info">${installContactInfo && installContactInfo.Full_Name ? installContactInfo.Full_Name + '|' : ''} ${installContactInfo && installContactInfo.Phone ? "<span class='us-phone'>" + installContactInfo.Phone + "</span>" + " | " : ""} ${installContactInfo && installContactInfo.Mobile ? "<span class='us-phone'>" + installContactInfo.Mobile + "</span>" : ""}</div>
//            <div id="contact-info">${contactInfo && contactInfo.Full_Name ? contactInfo.Full_Name + " | " : ""}    
//            ${contactInfo && contactInfo.Phone ? ("<span class='us-phone'>" + contactInfo.Phone + "</span>" + " | ") : ""} 
//            ${contactInfo && contactInfo.Mobile ? "" : "<br />"}  
//            ${contactInfo && contactInfo.Mobile ? "<span class='us-phone'>" + contactInfo.Mobile + "</span>" + "  <br>" : ""}   
//            ${propertyInfo && propertyInfo.Address_Line_1 ? (propertyInfo.Address_Line_1 + " <br>") : ""}   
//            ${propertyInfo && propertyInfo.Address_Line_2 ? (propertyInfo.Address_Line_2 + "<br>") : ""}
//            ${propertyInfo && propertyInfo.City ? (propertyInfo.City + " ") : ""}
//            ${propertyInfo && propertyInfo.State ? (propertyInfo.State + " ") : ""}
//            ${propertyInfo && propertyInfo.Zip_Code ? (propertyInfo.Zip_Code + " ") : ""}</div>
//           </div>

//           <div class="headerInfoItem_2">
//             <div class="innerInfoLeft"><b>Salesperson: </b><span class="innerInfoLeft">${mainOrder.Owner.name}</span></div>
//             <div class="innerInfoLeft"><b>Order Date: </b><span class="innerInfoLeft">${mainOrder.Closing_Date ? new Date(mainOrder.Closing_Date).toLocaleString("en-US", options) : ''}</span></div>
//             <div class="innerInfoLeft"><b>Fabric Ordered: </b></div>
//             <div class="innerInfoLeft"><b>${pageNumber} of ${totlaPageNumber}</b></div>
//           </div>
//         </div>

//         <div class="headerInfoBottom">
//           <!-- <p>Scheduled: <span><b> Friday, December 18, 2020</b></span></p> -->
//         </div>
//         `)

//     $('.us-phone').mask('(000) 000-0000');

//     return $header;
//   }

//   function createFooter(orderItem, type) {
//     let imageURL = "";
//     if (type.includes('Shade')) {
//       imageURL = (`<div class="pattern">
//       <img src="./image/solarPattern.png" alt="pattern" />
//      </div>`)
//     }
//     if (type.includes('Patio Sun and Wind')) {
//       imageURL = (`<div class="pattern">
//       <img src="./image/pattern.png" alt="pattern" />
//      </div>`)
//     }
//     let $footer = $(`
//         <div class="mainFooterWrapper">

//           <p>Note:</p>
//           <p class="title">${orderItem.Notes ? orderItem.Notes : ''}</p>
//           ${imageURL}

//         <div class="footerInfo">
//           <div class="col">Customer Signature:_______________________________________</div>
//           <div class="col">Date:____________________</div>
//           <div class="col">NOTE: Fabric width is smaller than overall unit width</div>
//           <div class="col"> </div>
//           <div class="col">Signature indicates acceptance of Liberty Home Products measuring policies and final approval
//             of all measurements.</div>
//         </div>
//         <p style="text-align: center; font-size: 12pt; margin-bottom: 0px;">Form Revised 5/2016. Printed 12/3/2020 12:33:15 PM</p>
//       </div>        
//        `)

//     return $footer;
//   }

//   function createMountingTypeTable(selectedType) {
//     let mainDiv = $(`<div class="tableRow"></div>`)
//     let tmpDiv_1 = $(`<div class="tableCol"></div>`)
//     if (MountingTypeList.length > 0) {
//       $.each(MountingTypeList[0].pick_list_values, function (key, val) {
//         if (val.display_value !== '-None-') {
//           tmpDiv_1.append(
//             $(`<p style="${selectedType.includes(val.display_value) ? 'background: black; color: white;' : ''}">${val.display_value}</p>`)
//           );
//         }
//       });
//       $(mainDiv).append(tmpDiv_1);
//     }

//     let tmpDiv_2 = $(`<div class="tableCol"></div>`)
//     if (MountingSurfaceList.length > 0) {
//       $.each(MountingSurfaceList[0].pick_list_values, function (key, val) {
//         if (val.display_value !== '-None-') {
//           tmpDiv_2.append(
//             $(`<p style="${selectedType.includes(val.display_value) ? 'background: black; color: white;' : ''}">${val.display_value}</p>`)
//           );
//         }
//       });
//       $(mainDiv).append(tmpDiv_2);
//     }
//     return mainDiv[0].outerHTML;

//   }

//   async function requestToMKZ(entry) {
//     let finalResponse;
//     let reductionField = JSON.parse(entry.Reduction_Fields);
//     console.log(reductionField, 'reductionField');
//     if (entry.Reduction_Result && Object.keys(JSON.parse(entry.Reduction_Result)["measure"]).length !== 0) {
//       finalResponse = JSON.parse(entry.Reduction_Result)["reduction"];
//       console.log(JSON.parse(entry.Reduction_Result), 'final result');
//     } else {
//     let reqObject = {
//       "functionType": 'reduction',
//       "OverrideInstallTime": reductionField && reductionField.Override_Install_Time !== '' ? reductionField.Override_Install_Time : null,
//       "type": entry.Item_Type.name,
//       "Width": entry.Awning_Width,
//       "ProjectionText": entry.Projection,
//       "MountHeight": entry.Mounting_Height,
//       "BottomOfVal": reductionField && reductionField.Bottom_of_val !== '' ? reductionField.Bottom_of_val : null,
//       "ValSize": reductionField && reductionField.Val_Size !== '' ? reductionField.Val_Size : null,
//       "OperatorTypeId": entry.Motor_Type,
//       "Side": entry.Motor_Crank_Side,
//       "Binding": entry.Binding_Color,
//       "Fabric Selection": entry.Fabric_Selection,
//       "NsFabric": entry.Fabric_Selection,
//       "Fabric Type": entry.Fabric_Type,
//       "FrameColorText": entry.Frame_Color,
//       "Valance": entry.Valance_Style,
//       "MotorText": entry.Motor_Size,
//       "Switch_TX": reductionField && reductionField['switch-TX'] ? reductionField['switch-TX'] : null,
//       "PlugOptionText": entry.Plug_Type,
//       "CrankText": entry.Crank_Size,
//       "Hood": entry.Hood,
//       "CustomBrackets": entry.Custom_Brackets,
//       "Backboard": entry.Back_Board,
//       "Xla": entry.Cross_Arm,
//       "RetractableFrontCurtain": entry.Front_Curtain,
//       "FrontCurtainColor": entry.Front_Curtain_Color,
//       "FrontCurtainOpenness": entry.Front_Curtain_Openness,
//       "FrontCurtainDropSize": entry.Front_Curtain_Drop_Size,
//       "WinterCover": entry.Winter_Cover,
//       "StripOffset": reductionField && reductionField.Strip_Offset ? reductionField.Strip_Offset : null,
//       "WindLegText": reductionField && reductionField.Wind_Leg ? reductionField.Wind_Leg : null,
//       "QtyOfBrackets": entry.Number_of_Brackets,
//       "SurfaceText": entry.Mounting_Surface,
//       "TypeText": entry.Mounting_type,
//       "Notes": reductionField && reductionField.Note ? reductionField.Note : null,
//       "ActualClothWidth": reductionField && reductionField.cloth_Actual_Size != '' ? reductionField.cloth_Actual_Size : null,
//       "defaultClothWidth": reductionField && reductionField.cloth_Size ? reductionField.cloth_Size : null,
//       "MotionSensor": entry.Motion_Sensor,
//     }

//     console.log(reqObject, 'reqObject');
//     // Request to MKZ
//     var func_name = "mkztest";
//     var req_data = {
//       "arguments": JSON.stringify({
//         "AMPFactorDetail": reqObject
//       })
//     };
//     await ZOHO.CRM.FUNCTIONS.execute(func_name, req_data)
//       .then(function (data) {
//         console.log(data, 'first Response');
//         let response = JSON.parse(data.details.output);
//         let printObject = JSON.parse(response.details.output);
//         finalResponse = printObject;
//         console.log(finalResponse, 'finalResponse');
//       }).catch(function (error) {
//         console.log(error, 'error');
//       })
//     }
//     return finalResponse;
//   }
// });
const types = ['Awning', 'Patio Sun and Wind', 'Solar Shade', 'Zipper Shade', 'Patio Cover']
jQuery(function ($) {
    getData()
    async function getData() {
        let totalReductionNumbers
        await ZOHO.embeddedApp.on("PageLoad", async function (data) {
            console.log(data, "daatttttaaa");
            ZOHO.CRM.UI.Resize({ height: "90%", width: "95%" }).then(async function (
                data
            ) { });
            async function checkNextNumber(orderItems) {
                let responseObject = {
                    total: 0,
                    index: 0,
                }
                console.log(orderItems);
                // let apicall = new apiCalls()
                let orderItemsList = await apicalls.getRelatedRecordsFromZoho("Deals", orderItems.Order.id, "Order_Items")

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
            temp = `<div class="modalContent"><img src="./img/icons8-spinner.gif"/>
            <p>Creating Reduction Sheets</p>
            </div>
            `
            $('#Modal').Modal({ title: '', content: temp });
            $('#modal‌Box').css({ "width": '25%', 'height': 'auto' })
            let apicalls = new apiCalls()
            let order = await apicalls.getFromZoho('Deals', data.EntityId[0])
            console.log(order, 'orderrrr');
            let contactInfo = await apicalls.getFromZoho("Contacts", order[0].Contact_Name.id)
            // console.log(contactInfo, 'contact Info');
            let propertyInfo = order[0].Property ? await apicalls.getFromZoho("Properties", order[0].Property.id) : {}
            // console.log(propertyInfo, 'propertyInfo Info');
            let installContactInfo = order[0].Install_Contact ? await apicalls.getFromZoho("Contacts", order[0].Install_Contact.id) : {}

            let orderItems = await apicalls.getRelatedRecordsFromZoho('Deals', data.EntityId[0], 'Order_Items')
            console.log(orderItems, 'order items');
            sheet = ``
            // await orderItems.forEach(item => {
            //     // console.log(item);
            //     let temp = JSON.parse(item.Reduction_Result)
            //     // console.log(temp, 'parsed');
            //     temp && (Reductionsheets[typeAligner(item.Product_Category)](temp.reduction, item, order[0], installContactInfo[0], contactInfo[0], propertyInfo[0])
            //     )
            // })
            let reductionNumber = await checkNextNumber(orderItems[0]);
            totalReductionNumbers = reductionNumber.total
            await Promise.all(orderItems.map(async (item, index) => {
                let temp = JSON.parse(item.Reduction_Result)
                temp && temp.reduction && ( temp.reduction['Number'] = ( item.Loc_No ? item.Loc_No :( temp.reduction['LocationNumber'] ?  temp.reduction['LocationNumber'] : ' ')) + ' of ' + totalReductionNumbers + ' ' + (item.Location ? ' (' + item.Location + ')' : ''))
                temp && (await Reductionsheets[typeAligner(item.Product_Category)](temp.reduction, item, order[0], installContactInfo[0], contactInfo[0], propertyInfo[0], (index == orderItems.length - 1 ? false : true))
                )
            }));

            $('#Modal').empty()
        })
        function typeAligner(type) {
            temp = type
            types.forEach(item => {
                type.includes(item) && (temp = item)
            })
            // console.log(temp, 'temp');
            return temp
        }
        async function ReductionNumberCreator(orderItems) {
            // get pageNumber
            reductionNumber = await checkNextNumber(orderItems);
            if (orderItems.Loc_No) {
                reductionNumber.index = orderItems.Loc_No;
            }
        }
    }
    ZOHO.embeddedApp.init();


})

