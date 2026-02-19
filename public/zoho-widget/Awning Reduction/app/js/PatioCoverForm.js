
var CreateForm = {
  //keeps dropdown Type fields for `CreateOptions` function
  dropdownFields: [],
  //multiSelect Info
    //multiSelect Info+ add 'MultiSelectx' to elements Id
  multiselectArray: [{ api_name: 'Awning_Coversheet_Picklist', id: 'CoversheetPickMultiSelectx' }],
  //used for  rendering form 
  //(any new fields could be added here and if the type doesn't exist condition rendering in `createPatioCoverForm` functionshould bes add )
 

  //creates form from fields for each section 
  createPatioCoverForm: async function createPatioCoverForm(order) {
    let temp = ''; //keeps section wrapper
    let temp2 = '';//keeps content of a section


    let typeObject = {
      'input': (element) => { return `<input id=${element.id} type="text"  />` },
      'dropdown': (element) => { return `<select name=${element.name} id=${element.id} ></select>` },
      'textarea': (element) => {return `<textarea id=${element.id} type="text"></textarea>`},
      'multiselect': (element) => {
        return `<div id='multiSelectWrapper'>
                <label  for="coverSheetPick">
                  ${element.name}
                  <div class="multiSelect" id=${element.id}>
                  <select multiple class="multiSelect_field" id=${element.id+"MultiSelectx"} >
                  </select>
                  </div>
                </label>
            </div>` },
    }

    //create section
    PatioCoverFormFields.forEach(item => {
      temp = temp + `<button class="accordion">${item.section}</button>
      <div class="panel">
      <div class='wrapper'>
      `
      //category name
      //create section contents
      item.fields.forEach(element => {
        //add dropdown types to an array to fill the options later
        if (element.type === 'dropdown') {
          this.dropdownFields.push({ name: element.name, id: element.id, api_name: element.api_name })
        }
        if (element.type !== 'textarea') {
          temp2 = temp2 + `<div class="flexItemsInputs">
          <label for=${element.id} >${element.name}</label>`
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

    return `<div id="LA">` + temp + `</div>`;
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

    //create Options for ShadeReductionFields
    CreateSelectOptions(this.dropdownFields, shadeReductionArray)

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
   //creates option for dropdowns with values extracted from zoho 
   CreateSingleFieldOptions: async function CreateSingleFieldOptions(item, shadeFields) {
    //create an instance of apiCalls class to access Methods
    let apicall = new apiCalls();
    if(!shadeFields){
    //some dropdown options are saved on fields
    let fields = await apicall.GetSelectOptions('Order_Items');
    //create Options for fields from fields(saved on zoho)
    CreateSelectOptions(array , fields)}
    else{
       //some dropdown options are saved on orgVariabels
    let shadeReductionFields = await apicall.getShadeReductionFields()
    
    let array = []
    array.push(item)
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
     //create Options for ShadeReductionFields
     CreateSelectOptions(array, shadeReductionArray)
    }
   
  },

}


