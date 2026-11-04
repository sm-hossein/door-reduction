import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import test from 'node:test';

import zohoDataProviderModule from '../src/zohoDataProvider.cjs';

const { createZohoDataProvider } = zohoDataProviderModule;

function createContext(requests) {
  return {
    getConnection() {
      return {
        async makeRequestSync(request) {
          requests.push(request);
          return Readable.from([Buffer.from(JSON.stringify({ data: [] }))]);
        },
      };
    },
    log: { INFO() {} },
  };
}

test('product definition reads use the renamed CRM module API', async () => {
  const requests = [];
  const provider = createZohoDataProvider(createContext(requests));

  await provider.getProductById('Y206');

  assert.equal(requests.length, 1);
  assert.equal(
    requests[0].url,
    'https://www.zohoapis.com/crm/v8/Product_Definitions/search?criteria=(Name:equals:Y206)'
  );
});

test('product definition component reads use the renamed CRM module API', async () => {
  const requests = [];
  const provider = createZohoDataProvider(createContext(requests));

  await provider.getProductComponentsByProductId('Y206');

  assert.equal(requests.length, 1);
  assert.equal(
    requests[0].url,
    'https://www.zohoapis.com/crm/v8/Product_Definition_Components/search?criteria=(Product_Definition:equals:Y206)'
  );
});
