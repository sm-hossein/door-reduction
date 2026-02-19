import { createZohoDataProvider } from "./src/zohoDataProvider.js";

export async function handler(context, basicIO) {
  try {
    const productId = basicIO.get("productId") || "Y206";
    const provider = createZohoDataProvider(context);
    const product = await provider.getProductById(productId);
    basicIO.write(JSON.stringify(product));
  } catch (err) {
    basicIO.write("Error: " + String(err));
  }
  context.close();
}
