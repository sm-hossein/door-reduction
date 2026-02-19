const esmRequire = require("esm")(module);
const { createZohoDataProvider, createZohoDoorDataContext } = esmRequire("./src/zohoDataProvider.js");
const { ExportDoorDataToJSON } = esmRequire("./src/calcDoorOutput.js");

module.exports = async function (context, basicIO) {
    console.log("!!!!Hello World!!!!!!!");
    const requestObject = basicIO.getParameter("request_object");
    const params = requestObject && requestObject.params ? requestObject.params : {};
    const testComponentId = params.testComponentId;

    try {
        if (testComponentId) {
            const provider = createZohoDataProvider(context);
            const component = await provider.getComponentById(testComponentId);
            basicIO.write(JSON.stringify({ testComponentId, component }));
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
