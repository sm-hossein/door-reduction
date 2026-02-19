
var FormGenerator = {
  //keeps dropdown Type fields for `CreateOptions` function
  dropdownFields: [],
  //multiSelect Info
  //multiSelect Info+ add 'MultiSelectx' to elements Id
  multiselectArray: [{ api_name: 'Awning_Coversheet_Picklist', id: 'CoverSheetListMultiSelectx' }],
  shadeReduction: [],

  //creates form from fields for each section 
  formGenerator: async function createForm(fieldsList) {

    let temp = ''; //keeps section wrapper
    let temp2 = '';//keeps content of a section


    let typeObject = {
      'input': (element) => { return `<label for=${element.id} >${element.name}</label><input id=${element.id} type="text"  />` },
      'dropdown': (element) => { return `<label for=${element.id} >${element.name}</label><select name=${element.name} id=${element.id} ></select>` },
      'textarea': (element) => {
        return `<textarea id=${element.id} type="text" class='textareaStyle'></textarea>`
      },
      'multiselect': (element) => {
        return `<div id='multiSelectWrapper'>
                <label  for="coverSheetPick">
                  ${element.name}
                  <div class="multiSelect" id=${element.id}>
                  <select multiple class="multiSelect_field" id=${element.id + "MultiSelectx"} >
                  </select>
                  </div>
                </label>
            </div>` },
      'decimalInput': (element) => { return `<label for=${element.id} >${element.name}</label><input id=${element.id} type="number" min=${element.min && element.min} step=${element.step && element.step} />` },
      'checkbox': (element) => { return `<label for=${element.id}  class=${element.class && element.class}><input type="checkbox" id= ${element.id}  /> ${element.name}</label> ` },
    }
    //create section
    fieldsList.forEach(item => {
      temp = temp + `<button class="accordion">${item.section}</button>
      <div class="panel">
      <div class='wrapper'>`
      //create section contents
      item.fields.forEach(element => {
        //add dropdown types to an array to fill the options later
        if (element.type === 'dropdown') {
          this.dropdownFields.push({ name: element.name, id: element.id, api_name: element.api_name, addNone: element.addNone })
        }
        if (element.type !== 'textarea') {
          temp2 = temp2 + `<div class="flexItemsInputs">`
          temp2 = temp2 + typeObject[(element.type)](element);
          temp2 = temp2 + `</div>`
        }
        else {
          temp2 = temp2 + typeObject[(element.type)](element)
        }
      })

      //put sectionWrapper and content together , add it to temp
      temp = temp + temp2 +
        `</div>
      </div>`
      temp2 = ''

    })

    return `<div id="LA" style='position:relative'>` + temp + `
    <div class="flexItemsInputs" style="position: absolute; right: 0px; bottom: 20px; right:24px">
            <button class="refreshMeasureBtn" id="calculateButton">
                <img id="refreshIcon" src="./img/refresh.png" />
                  Calculate
            </button>
            </div>
    </div>`;
  },

  //creates option for dropdowns with values extracted from zoho 
  CreateOptions: async function CreateOptions() {
    //create an instance of apiCalls class to access Methods
    let apicall = new apiCalls();

    //some dropdown options are saved on fields
    let fields = await apicall.GetSelectOptions('Order_Items');
    //create Options for fields from fields(saved on zoho)
    CreateSelectOptions(this.dropdownFields, fields)
    //some dropdown options are saved on orgVariabels
    let shadeReductionFields = await apicall.getShadeReductionFields()
    // formats ShadeReductionFields to a form that can be used by `createSelectOptions` function
    let shadeReductionParsed = JSON.parse(shadeReductionFields)
    let shadeReductionArray = []
    Object.keys(shadeReductionParsed).forEach(item => {
      let pickList = []
      shadeReductionParsed[item].forEach(element => {
        let val = {
          actual_value: element,
          display_value: element
        }
        pickList.push(val)
      })
      let obj = {
        api_name: item,
        pick_list_values: pickList
      }
      shadeReductionArray.push(obj)
    })
    //
    this.shadeReduction = shadeReductionArray
    //create Options for ShadeReductionFields
    CreateSelectOptions(this.dropdownFields, shadeReductionArray)

    //create options to fields that dont exist on zoho
    CreateSelectOptions(this.dropdownFields, customDropdownOptions)
  },
  //create multiSelect Options
  CreateMultiSelectOptions: async function createMultiOptions() {
    //create an instance of apiCalls class to access Methods
    let apicall = new apiCalls();
    //get dropdown options from zoho
    let fields = await apicall.GetSelectOptions('Deals');
    let fieldsOrderItems = await apicall.GetSelectOptions('Order_Items');
    CreateSelectOptions(this.multiselectArray, fieldsOrderItems)
    CreateSelectOptions(this.multiselectArray, fields)
  },

  CreateOptionForDropdown: async function CreateOptionForDropdown(list){
    //create Options for ShadeReductionFields
    CreateSelectOptions(list , this.shadeReduction)
  }
}


