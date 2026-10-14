import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import test from 'node:test';
import * as PDFLib from 'pdf-lib';

const titles = ['Production Copy', 'File Copy', 'Quality Control Copy'];
const widgets = [
  ['input', 'public/zoho-widget/app/app.js', '  const toBase64 ='],
  ['result', 'public/zoho-widget/reduction-result-widget/app/app.js', '  const appTemplate ='],
];

// Evaluate the actual PDF functions without mounting UI or contacting CRM.
function loadRenderer(path, endMarker) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  const load = new Function('window', 'React', 'return ' +
    source.slice(0, source.indexOf(endMarker)) + 'return buildPdfBytesForDoors; })();');
  return load({ PDFLib }, {});
}

function pageContent(doc, page) {
  const streams = page.node.Contents();
  return streams.asArray().map(ref =>
    Buffer.from(PDFLib.decodePDFRawStream(doc.context.lookup(ref)).decode()).toString()
  ).join('\n');
}

const hex = value => Buffer.from(value).toString('hex').toUpperCase();
function normalized(content) {
  return content.replace(/<([0-9A-F]+)>/g, (_, value) => {
    let text = Buffer.from(value, 'hex').toString();
    for (const title of titles) text = text.replace(title, 'COPY');
    return `<${hex(text)}>`;
  });
}

function door(side, overflow = false) {
  return {
    raw: {
      'Job Number': 'TEST-188', 'Job Name': `Sample side ${side}`,
      'Product ID': `TEST-${side}`, ProductDescription: 'Sample steel door',
      'Order Notes': overflow ? 'Inspect finish and dimensions. '.repeat(150) : 'Sample order notes.',
    },
    components: Array.from({ length: overflow ? 70 : 2 }, (_, i) => ({
      'Component Group': 'Frame', Quantity: 1,
      'Component Description': `Frame component ${i + 1}`,
      Location: 'Left', Size: '80', Notes: 'Sample component',
    })),
  };
}

for (const [name, path, marker] of widgets) {
  const render = loadRenderer(path, marker);
  for (const [scenario, doors] of [
    ['single', [door(1)]],
    ['paired', [door(1), door(2)]],
    ['overflow', [door(1, true), door(2)]],
  ]) {
    test(`${name}: ${scenario} has three complete heading-only copies`, async () => {
      const bytes = await render(doors);
      const doc = await PDFLib.PDFDocument.load(bytes);
      const pages = doc.getPages().map(page => pageContent(doc, page));
      assert.equal(pages.length % 3, 0);
      const count = pages.length / 3;
      if (scenario === 'overflow') assert.ok(count > doors.length);
      else assert.equal(count, doors.length);
      for (let copy = 0; copy < 3; copy++) {
        const set = pages.slice(copy * count, (copy + 1) * count);
        set.forEach((page, i) => {
          assert.ok(page.includes(hex(titles[copy])), 'correct copy heading');
          assert.equal(normalized(page), normalized(pages[i]), 'all drawing content matches');
        });
        assert.ok(set[0].includes(hex(`Side 1 of ${doors.length}`)));
        if (doors.length === 2) assert.ok(set.at(-1).includes(hex('Side 2 of 2')));
        if (scenario === 'overflow') {
          assert.ok(set.some(page => page.includes(hex(`${titles[copy]} (continued)`))));
        }
      }
      if (process.env.PDF_REVIEW_OUTPUT) {
        mkdirSync(process.env.PDF_REVIEW_OUTPUT, { recursive: true });
        writeFileSync(`${process.env.PDF_REVIEW_OUTPUT}/${name}-${scenario}.pdf`, bytes);
      }
    });
  }
  test(`${name}: empty input is rejected`, async () => {
    await assert.rejects(render([]), /No door JSON/);
  });
}
