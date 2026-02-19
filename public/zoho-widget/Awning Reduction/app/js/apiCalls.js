
class apiCalls {

   GetSelectOptions(entity) {
      return ZOHO.CRM.META.getFields({ Entity: entity }).then(res => { return res.fields })
         .catch(err => console.log(err))
   }

   getShadeReductionFields() {
      return (ZOHO.CRM.API.getOrgVariable("Shade_Reduction_Fields_Def").then(res => { return res.Success.Content }))
   }

   getFromZoho(entity, recordId) {
      return ZOHO.CRM.API.getRecord({
         Entity: entity,
         RecordID: recordId,
      }).then(res => { return res.data })
         .catch(err => console.log(err))

   }
   getRelatedRecordsFromZoho(entity, recordId, relatedList) {
      return ZOHO.CRM.API.getRelatedRecords({
         Entity: entity,
         RecordID: recordId,
         RelatedList: relatedList
      }).then(res => { return res.data })
         .catch(err => console.log(err))
   }
   updateRecordOnZoho(entity, data, trigger){
      return   ZOHO.CRM.API.updateRecord({
         Entity: entity,
         APIData: data,
         Trigger: [trigger]
       }).then(res => {
         return res.data
       })
       .catch(error=> {console.log(error); return error})
   }
   reductionFunction(func_name, req_data) {
      return ZOHO.CRM.FUNCTIONS.execute(func_name, req_data)
         .then(res => {
            console.log(res, 'res reduction');
            return res
         }).catch((error) => {
            console.log(error, 'error reduction');

         })
   }
}


