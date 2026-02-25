const esmRequire = require("esm")(module);
const { createZohoDataProvider, createZohoDoorDataContext } = require("./src/zohoDataProvider.cjs");
const { ExportDoorDataToJSON } = esmRequire("./src/calcDoorOutput.js");

module.exports = async function (context, basicIO) {
    console.log("!!!!Hello World!!!!!!!");
    const requestObject = basicIO.getParameter("request_object");
    const params = requestObject && requestObject.params ? requestObject.params : {};
    const testComponentId = params.testComponentId;
    const productPhotoRecordId = params.productPhotoRecordId;

    try {
        if (testComponentId) {
            const provider = createZohoDataProvider(context);
            const component = await provider.getComponentById(testComponentId);
            basicIO.write(JSON.stringify({ testComponentId, component }));
            return;
        }

        if (productPhotoRecordId) {
            const provider = createZohoDataProvider(context);
            const photo = provider.getProductPhotoByZohoId
                ? await provider.getProductPhotoByZohoId(productPhotoRecordId)
                : null;
            basicIO.write(JSON.stringify({ photo: photo || null }));
            return;
        }

        const doorId = params.orderItemsId || params.doorId;
        if (!doorId) {
            basicIO.write("Error: orderItemsId (or doorId) is required");
            return;
        }

        const dataContext = await createZohoDoorDataContext(context, doorId);
        const ctx = { log: context.log };
        const json = ExportDoorDataToJSON(ctx, dataContext, doorId);
        basicIO.write(JSON.stringify(json));
    } catch (err) {
        basicIO.write("Error: " + String(err));
    } finally {
        context.log.INFO("zoho test executed");
        context.close();
    }
}
