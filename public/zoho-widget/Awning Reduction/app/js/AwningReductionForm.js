
function createMultiSelectDropdown(type) {
    return `<div class="multiSelect">
    <select multiple class="multiSelect_field"  id='CoversheetPick'>
    </select>
  </div>
  `
}

function createAwningReductionForm(type) {
    let tmpDiv
    if (type === 'awning') {
        tmpDiv = $(`
          <div id="LA">
          <button class="accordion">Size</button>
          <div class="panel">
          <div class="wrapper">
          <div class="flexItemsInputs">
          <label for="widthIn">Width In</label>
          <input id="widthIn" type="text" class='requuiredField' />
          </div>
          <div class="flexItemsInputs">
          <label for="projection">Projection</label>
          <select name="projection" id="projection" class='requuiredField'></select>
          </div>

          <div class="flexItemsInputs">
          <label for="ClothSize">Cloth Size</label>
          <select class="clothChange" name="ClothSize" id="ClothSize"></select>
          </div>

          <div class="flexItemsInputs">
          <label for="clothActualSize">Cloth Actual Size</label>
          <input class="clothChange" id="clothActualSize" />
          </div>

          <div class="flexItemsInputs">
          <label for="WindLeg">Wind Leg</label>
          <input id="WindLeg" type="number" min="0" value="0" class='requuiredField' />
          </div>
          <div class="flexItemsInputs">
          <label for="StripOffset">Strip Offset</label>
          <input id="StripOffset" type="text" />
          </div>

          </div>
          </div>

          <button class="accordion">Fabric/Styles</button>
          <div class="panel">
          <div class="wrapper">
          <div class="flexItemsInputs">
          <label for="fabricType">Fabric Type</label>
          <select name="fabricType" id="fabricType"></select>
          </div>
          <div class="flexItemsInputs">
          <label for="fabricSelection">Fabric Selection</label>
          <div class="fabricSelectionWrapper"></div>
          
          </div>
          <div class="flexItemsInputs">
          <label for="bindingColor">Binding Color</label>
          <select name="bindingColor" id="bindingColor"></select>
          </div>
          <div class="flexItemsInputs">
          <label for="valanceStyle">Valance Style</label>
          <select name="valanceStyle" id="valanceStyle"></select>
          </div>
          <div class="flexItemsInputs">
          <label for="frameColor">Frame Color</label>
          <select name="frameColor" id="frameColor"></select>
          </div>
          </div>
          </div>

          <button class="accordion">Installation</button>
          <div class="panel">
          <div class="wrapper">
          <div class="flexItemsInputs">
          <label for="mountHeight">Mount Height</label>
          <input id="mountHeight" type="number" />
          </div>
          <div class="flexItemsInputs">
          <label for="mountType">Mount Type</label>
          <select id="mountType" name="mountType"></select>
          </div>
          <div class="flexItemsInputs">
          <label for="mountSurface">Mount Surface</label>
          <select id="mountSurface" name="mountSurface"></select>
          </div>
          <div class="flexItemsInputs">
          <label for="BottomOfVal">Bottom of Val</label>
          <input id="BottomOfVal" type="number" />
          </div>
          <div class="flexItemsInputs">
          <label for="OverrideInstallTime">Override Install Time</label>
          <input id="OverrideInstallTime" type="number" />
          </div>
          <div class="flexItemsInputs">
          <label for="Location">Location</label>
          <input id="Location" type="text" />
          </div>
          <div class="flexItemsInputs">
          <label class="customBracketCheckBox" for="customBracket">
           <input type="checkbox" id="customBracket" />
           Custom Bracket
          </label>
          </div>
          </div>
          </div>

          <button class="accordion">Motor/Controler</button>
          <div class="panel">
          <div class="wrapper">
          <div class="flexItemsInputs">
          <label for="motorType">Operator Type</label>
          <select id="motorType" name="motorType" class='requuiredField'></select>
          </div>

          <div class="flexItemsInputs">
          <label for="motorCrankSide">Motor/Crank Side</label>
          <select id="motorCrankSide" name="motorCrankSide"></select>
          </div>
          <div class="flexItemsInputs">
          <label for="crankSize">Crank Size</label>
          <select id="crankSize" name="crankSize"></select>
          </div>
          <div class="flexItemsInputs">
          <label for="customCrankSize">Custom Crank Size</label>
          <input id="customCrankSize" name="customCrankSize" />
          </div>
          <div class="flexItemsInputs">
          <label for="plugType">Plug Type</label>
          <select id="plugType" name="plugType"></select>
          </div>
          <div class="flexItemsInputs">
          <label for="switchTX">Switch / TX
          <select id="switchTX" name="switchTX"></select>
          </label>
          </div>

          <div class="flexItemsInputs">
          <label class="customBracketCheckBox" for="motionSensor">
           <input type="checkbox" id="motionSensor" />
           Motion Sensor
          </label>
          </div>

          </div>
          </div>

          <button class="accordion">Addons</button>
          <div class="panel">
          <div class="wrapper">

          <div class="flexItemsInputs">
          <label class="customBracketCheckBox" for="frontCurtain">Front Curtain</label>
              <select name="frontCurtain" id="frontCurtain"></select>
          </div>

          <div class="flexItemsInputs">
          <label class="customBracketCheckBox" for="frontCurtainColor">Front Curtain Color</label>
              <select name="frontCurtain" id="frontCurtainColor"></select>
          </div>

          <div class="flexItemsInputs">
          <label class="customBracketCheckBox" for="frontCurtainOpenness">Front Curtain Openness</label>
              <select name="frontCurtain" id="frontCurtainOpenness"></select>
          </div>

          <div class="flexItemsInputs">
          <label class="customBracketCheckBox" for="frontCurtainDropSize">Front Curtain Drop Size</label>
              <select name="frontCurtain" id="frontCurtainDropSize"></select>
          </div>

          <div class="flexItemsInputs">
          <label class="customBracketCheckBox" for="Hood">
          <input type="checkbox" id="Hood" class='requuiredField' />
          Hood
          </label>
          </div>
          <div class="flexItemsInputs">
          <label class="customBracketCheckBox" for="backBoard">
          <input type="checkbox" id="backBoard" class='requuiredField' />
          Back Board
          </label>
          </div>
          <div class="flexItemsInputs">
          <label class="customBracketCheckBox" for="winterCover">
              <input type="checkbox" id="winterCover" />
              Winter Cover
          </label>
          </div>

          </div>
          </div>

          <button class="accordion">Note</button>
          <div class="panel">
          <div class="wrapper">
          <textarea id="reductionNote" type="text"></textarea>
          </div>
          </div>

          <button class="accordion">CoverSheet</button>
          <div class="panel">
          <div class="wrapper">
          <textarea id="coversheetNote" type="text"></textarea>
          <div id='multiSelectWrapper'>
          
          <label  for="coverSheetPick">
          Coversheet Pick
          ${createMultiSelectDropdown()}
          </label>
         
          </div>
          </div>
          </div>

          <button class="accordion">Calculation</button>
          <div class="panel">
          <div class="wrapper" style="position: relative;">

          <div class="flexItemsInputs">
          <label for="NumberInput">Location Number</label>
          <input id="NumberInput" type="number" />
          </div>

          <div class="flexItemsInputs">
          <label for="ValSize">Val Size</label>
          <input id="ValSize" type="text" class='requuiredField' />
          </div>

          <div class="flexItemsInputs">
          <label for="numberOfBrackets"># of Brackets</label>
          <input id="numberOfBrackets" type="number" class='requuiredField' />
          </div>

          <div class="flexItemsInputs">
          <label for="motorSize">Motor Size</label>
          <select id="motorSize" name="motorSize" class='requuiredField'></select>
          </div>
          
          <div class="flexItemsInputs">
          <label for="numberOfBrackets">Calculated Install Time</label>
          <input id="calculatedInstallTime" type="number" disabled />
          </div>

          <div class="flexItemsInputs">
          <label class="customBracketCheckBox" for="crossArm">
              <input type="checkbox" id="crossArm" disabled />
              Cross Arm
          </label>
          </div>

          <div class="flexItemsInputs" style="position: absolute; right: 0px; top: 130px;">
          <button class="refreshMeasureBtn" id="refreshMeasure">
          <img id="refreshIcon" src="./img/refresh.png" />
               Calculate
          </button>
          </div>

          </div>
          </div>

          </div>
          `)
    }
    else if (type === 'psw' || type === 'solarShade') {
        tmpDiv = $(`
            <div id="LA">
            <button class="accordion">Size</button>
            <div class="panel">
            <div class="wrapper">
            <div class="flexItemsInputs">
            <label for="widthIn">Width in Inches</label>
            <input id="widthIn" type="text" class='requuiredField' />
            </div>

            <div class="flexItemsInputs">
            <label for="dropIn">Drop in Inches</label>
            <input id="dropIn" type="text"  />
            </div>

            </div>
            </div>

            <button class="accordion">Fabric/Styles</button>
            <div class="panel">
            <div class="wrapper">
            <div class="flexItemsInputs">
            <label for="frameColor">Frame Color</label>
            <select name="frameColor" id="frameColor"></select>
            </div>

            <div class="flexItemsInputs">
            <label for="fabricColor">Fabric Color</label>
            <select name="fabricColor" id="fabricColor"></select>
            </div>

            <div class="flexItemsInputs">
            <label for="shadeOpenness">Shade Openness</label>
            <select name="shadeOpenness" id="shadeOpenness"></select>
            </div>

            <div class="flexItemsInputs">
            <label for="ShadeFabricWidth">Shade Fabric Width</label>
            <select name="ShadeFabricWidth" id="ShadeFabricWidth"></select>
            </div>

            </div>
            </div>

            <button class="accordion">Installation</button>
            <div class="panel">
            <div class="wrapper">
            <div class="flexItemsInputs">
            <label for="mountHeight">Mount Height</label>
            <input id="mountHeight" type="number" />
            </div>
            <div class="flexItemsInputs">
            <label for="mountType">Mount Type</label>
            <select id="mountType" name="mountType"></select>
            </div>
            <div class="flexItemsInputs">
            <label for="mountSurface">Mount Surface</label>
            <select id="mountSurface" name="mountSurface"></select>
            </div>

            <div class="flexItemsInputs">
            <label class="customBracketCheckBox" for="customBracket">
             <input type="checkbox" id="customBracket" />
             Custom Bracket
            </label>
            </div>

            <div class="flexItemsInputs">
            <label for="OverrideInstallTime">Override Install Time</label>
            <input id="OverrideInstallTime" type="number" />
            </div>
            
            <div class="flexItemsInputs">
            <label for="Location">Location</label>
            <input id="Location" type="text" />
            </div>

            </div>
            </div>

            <button class="accordion">Motor/Controler</button>
            <div class="panel">
            <div class="wrapper">
            <div class="flexItemsInputs">
            <label for="motorType">Operator Type</label>
            <select id="motorType" name="motorType" class='requuiredField'></select>
            </div>

            <div class="flexItemsInputs">
            <label for="motorCrankSide">Motor/Crank Side</label>
            <select id="motorCrankSide" name="motorCrankSide" class='requuiredField'></select>
            </div>
            <div class="flexItemsInputs">
            <label for="crankSize">Crank Size</label>
            <select id="crankSize" name="crankSize"></select>
            </div>
            <div class="flexItemsInputs">
            <label for="customCrankSize">Custom Crank Size</label>
            <input id="customCrankSize" name="customCrankSize" />
            </div>
            <div class="flexItemsInputs">
            <label for="plugType">Plug Type</label>
            <select id="plugType" name="plugType"></select>
            </div>
            <div class="flexItemsInputs">
            <label for="switchTX">Switch / TX
            <select id="switchTX" name="switchTX"></select>
            </label>
            </div>
            <div class="flexItemsInputs">
            <label for="trackGuide">Track Guide
            <select id="trackGuide" name="trackGuide"></select>
            </label>
            </div>

         

            </div>
            </div>

            <button class="accordion">Addons</button>
            <div class="panel">
            <div class="wrapper">

            <div class="flexItemsInputs">
            <label class="customBracketCheckBox" for="Hood">
            <input type="checkbox" id="Hood"  />
            Hood
            </label>
            </div>

            </div>
            </div>

            <button class="accordion">Note</button>
            <div class="panel">
            <div class="wrapper">
            <textarea id="reductionNote" type="text"></textarea>
            </div>
            </div>

            <button class="accordion">CoverSheet</button>
            <div class="panel">
            <div class="wrapper">
            <textarea id="coversheetNote" type="text"></textarea>
            <div id='multiSelectWrapper'>
            <label  for="coverSheetPick">
            Coversheet Pick
            ${createMultiSelectDropdown()}
            </label>
            </div>
            </div>
            </div>

            <button class="accordion">Calculation</button>
            <div class="panel">
            <div class="wrapper" style="position: relative;">

            <div class="flexItemsInputs">
            <label for="NumberInput">Location Number</label>
            <input id="NumberInput" type="number" />
            </div>

            <div class="flexItemsInputs">
            <label for="motorSize">Motor Size</label>
            <select id="motorSize" name="motorSize" class='requuiredField' ></select>
            </div>
            
            <div class="flexItemsInputs">
            <label for="numberOfBrackets">Calculated Install Time</label>
            <input id="calculatedInstallTime" type="number" disabled />
            </div>

            <div class="flexItemsInputs">
            <label for="QTY">QTY</label>
            <input id="QTY" type="number" class='requuiredField' value='1' disabled />
            </div>

            <div class="flexItemsInputs">
            <label for="OperatorSideWidth">Operator Side Width</label>
            <input id="OperatorSideWidth" type="number" />
            </div>
         
            <div class="flexItemsInputs">
            <label for="Grain">Grain</label>
            <select name="Grain" id="Grain"></select>
            </div>

            <div class="flexItemsInputs" style="position: absolute; right: 0px; top: 160px;">
            <button class="refreshMeasureBtn" id="refreshMeasure">
            <img id="refreshIcon" src="./img/refresh.png" />
                 Calculate
            </button>
            </div>

            </div>
            </div>

            </div>
            `)
            

    }

    return tmpDiv;
}