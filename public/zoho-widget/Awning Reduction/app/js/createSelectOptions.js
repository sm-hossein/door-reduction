function CreateSelectOptions(dataArray, fields, extraOptions) {
  let i;
  let selectArray = []
  for (i = 0; i < dataArray.length; i++) {
    selectArray = fields.filter(function (value, index, arr) {
      if (value.api_name == dataArray[i].api_name) {
        let array = value.pick_list_values
        dataArray[i].addNone && (array.unshift({
          actual_value: '-None-',
          display_value: '-None-'
        }))
        return array;
      }
    });
    var $selectDiv = $("#" + dataArray[i].id);
    if (selectArray.length > 0) {
      let options = selectArray[0].pick_list_values;
      $.each(options, function (key, val) {
        $selectDiv.append(
          $("<option />").val(val.display_value).text(val.display_value)
        );
      });
    }

  }

}