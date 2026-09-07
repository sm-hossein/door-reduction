import assert from "node:assert/strict";
import test from "node:test";

import {
  GetActualHeight,
  GetActualWidth,
  GetSize
} from "../src/calculations.js";
import { CreateContext } from "../src/init.js";

const fractions = [];

function createPatioOperator(totalWidth) {
  const ctx = CreateContext({ INFO() {} });

  Object.assign(ctx, {
    gblType: "Patio",
    gblTotalWidth: totalWidth,
    gblTotalHeight: 80,
    gblProductType: "Door",
    gblGlassType: "Three",
    gblFrameWidth: 4,
    gblOpeningWidthReduce: 0.625,
    gblOpeningHeightReduce: 1,
    gblPatioDoorIncrease: 0.25,
    gblMaxDoorDiff: 0.25,
    gblGlassMaxWidthAdjust: 0.5,
    gblGlassMinWidthAdjust: -0.5,
    gblStandardDrillAt: 0.875,
    gblCurrentSide: "Left",
    // A Patio leaf is the operator when current side differs from hinge.
    gblHinge: "Right",
    gblOperator: "Left",
    gblLock: "Yale"
  });

  return ctx;
}

const extendedEdgeCases = [
  // The Patio 1/4-inch increase makes each adjusted half exactly
  // 5/8 inch above or below the corresponding nominal door family.
  { name: "30-inch family, positive edge", opening: 61, glass: 26, drill: 0.625 },
  { name: "32-inch family, positive edge", opening: 65, glass: 28, drill: 0.625 },
  { name: "36-inch family, positive edge", opening: 73, glass: 32, drill: 0.625 },
  { name: "30-inch family, negative edge", opening: 58.5, glass: 26, drill: 1.125 },
  { name: "32-inch family, negative edge", opening: 62.5, glass: 28, drill: 1.125 },
  { name: "36-inch family, negative edge", opening: 70.5, glass: 32, drill: 1.125 }
];

for (const testCase of extendedEdgeCases) {
  test(`paired operator uses stocked standard glass: ${testCase.name}`, () => {
    const ctx = createPatioOperator(testCase.opening);

    assert.equal(GetActualWidth(ctx, "Initial", fractions), 2);
    assert.equal(
      GetActualWidth(ctx, "Glass Comment", fractions),
      testCase.drill
    );
    assert.equal(GetActualWidth(ctx, "Glass", fractions), testCase.glass);
  });
}

test("supplied 73-1/4-inch French operator uses 32-inch standard glass", () => {
  const ctx = createPatioOperator(73.25);
  ctx.gblType = "French";
  ctx.gblPatioDoorIncrease = 0.25;

  assert.equal(GetActualWidth(ctx, "Full Width", fractions), 35.875);
  assert.equal(GetActualWidth(ctx, "Glass Comment", fractions), 0.625);
  assert.equal(GetActualWidth(ctx, "Glass", fractions), 32);
});

test("French sample keeps pair widths and reference total consistent", () => {
  const ctx = createPatioOperator(73.25);
  ctx.gblType = "French";

  ctx.gblCurrentSide = "Left";
  const leftBuildWidth = GetActualWidth(ctx, "Full Width", fractions);

  ctx.gblCurrentSide = "Right";
  const rightBuildWidth = GetActualWidth(ctx, "Full Width", fractions);

  assert.equal(leftBuildWidth, 35.875);
  assert.equal(rightBuildWidth, 36.125);
  assert.equal(leftBuildWidth + rightBuildWidth, 72);

  // Reference widths add the 5/8-inch opening reduction back to each leaf.
  assert.equal(ctx.gblRefWidth1 + 0.625, 36.5);
  assert.equal(ctx.gblRefWidth2 + 0.625, 36.75);
  assert.equal(
    ctx.gblRefWidth1 + ctx.gblRefWidth2 + 2 * ctx.gblOpeningWidthReduce,
    ctx.gblTotalWidth
  );
});

test("sign correction changes only operator drilling/glass, not build size", () => {
  const ctx = createPatioOperator(73.25);
  ctx.gblType = "French";
  ctx.gblCurrentSide = "Left";

  assert.equal(GetSize(ctx, "Total Width", fractions), 35.875);
  assert.equal(GetActualWidth(ctx, "Glass Comment", fractions), 0.625);
  assert.equal(GetActualWidth(ctx, "Glass", fractions), 32);
  assert.equal(GetActualWidth(ctx, "Screen", fractions), 32);
  assert.equal(GetActualHeight(ctx, "Top Glass", fractions), 34);
  assert.equal(GetActualHeight(ctx, "Bottom Glass", fractions), 34);

  // The glass frame adds 3/4 inch in each dimension.
  assert.equal(GetActualWidth(ctx, "Glass", fractions) + 0.75, 32.75);
  assert.equal(GetActualHeight(ctx, "Top Glass", fractions) + 0.75, 34.75);
});

test("French inactive leaf remains correctly sized and custom", () => {
  const ctx = createPatioOperator(73.25);
  ctx.gblType = "French";
  ctx.gblCurrentSide = "Right";

  assert.equal(GetActualWidth(ctx, "Full Width", fractions), 36.125);
  assert.equal(GetActualWidth(ctx, "Glass Comment", fractions), 9999);
  assert.equal(GetActualWidth(ctx, "Glass", fractions), 32.75);
  assert.equal(GetActualWidth(ctx, "Screen", fractions), 32.75);
});

test("normal Single standard branch is unchanged", () => {
  const ctx = createPatioOperator(36.5);
  ctx.gblType = "Single";

  assert.equal(GetActualWidth(ctx, "Full Width", fractions), 35.875);
  assert.equal(GetActualWidth(ctx, "Glass Comment", fractions), 0.625);
  assert.equal(GetActualWidth(ctx, "Glass", fractions), 32);
});

test("Single outside normal tolerance remains custom", () => {
  const ctx = createPatioOperator(36.75);
  ctx.gblType = "Single";

  assert.equal(GetActualWidth(ctx, "Full Width", fractions), 36.125);
  assert.equal(GetActualWidth(ctx, "Glass Comment", fractions), 9999);
  assert.equal(GetActualWidth(ctx, "Glass", fractions), 32.75);
});

test("all width-classified standard glass in a broad sweep is stocked", () => {
  const stockedWidths = new Set([26, 28, 32]);
  const ranges = [
    { type: "Single", min: 25, max: 40, step: 0.125, sides: ["Left"] },
    { type: "French", min: 55, max: 76, step: 0.25, sides: ["Left", "Right"] },
    { type: "Patio", min: 55, max: 76, step: 0.25, sides: ["Left", "Right"] }
  ];

  for (const range of ranges) {
    for (let raw = range.min; raw <= range.max; raw += range.step) {
      const opening = Math.round(raw * 1000) / 1000;

      for (const side of range.sides) {
        const ctx = createPatioOperator(opening);
        ctx.gblType = range.type;
        ctx.gblCurrentSide = side;

        const marker = GetActualWidth(ctx, "Glass Comment", fractions);
        const glass = GetActualWidth(ctx, "Glass", fractions);

        if (marker !== 9999) {
          assert.ok(
            stockedWidths.has(glass),
            `${range.type} ${opening} ${side} classified ${glass}-inch glass as standard`
          );
        }
      }
    }
  }
});
