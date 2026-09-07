import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, "..");
const inputPath = path.join(projectDir, "data", "Door.csv");
const outputDir = path.join(projectDir, "Output");
const recordLimit = 2000;
const tablePath = path.join(
  outputDir,
  "door-height-counts-latest-2000-records.csv",
);
const plotPath = path.join(
  outputDir,
  "door-height-counts-latest-2000-records.svg",
);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  return rows;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const parsed = parseCsv(fs.readFileSync(inputPath, "utf8"));
const headers = parsed[0];
const heightIndex = headers.indexOf("Height");
const fractionIndex = headers.indexOf("Height Fraction");
const quantityIndex = headers.indexOf("Quantity");

if ([heightIndex, fractionIndex, quantityIndex].some((index) => index < 0)) {
  throw new Error("Door.csv is missing Height, Height Fraction, or Quantity.");
}

const integerCounts = new Map();
const betweenCounts = new Map();
let validRows = 0;
let skippedRows = 0;
let totalDoors = 0;
let minHeight = Infinity;
let maxHeight = -Infinity;

const dataRows = parsed.slice(1).filter((row) => row.some((field) => field.trim()));
const selectedRows = dataRows.slice(-recordLimit);

for (const row of selectedRows) {
  const height = Number.parseFloat(row[heightIndex]);
  const fractionText = row[fractionIndex]?.trim();
  const fraction = fractionText ? Number.parseFloat(fractionText) : 0;
  const quantityText = row[quantityIndex]?.trim();
  const quantity = quantityText ? Number.parseFloat(quantityText) : 1;

  if (
    !Number.isFinite(height) ||
    !Number.isFinite(fraction) ||
    !Number.isFinite(quantity)
  ) {
    skippedRows += 1;
    continue;
  }

  const exactHeight = height + fraction;
  const lowerBound = Math.floor(exactHeight);
  const isInteger = Math.abs(exactHeight - Math.round(exactHeight)) < 1e-9;
  const targetCounts = isInteger ? integerCounts : betweenCounts;
  const countKey = isInteger ? Math.round(exactHeight) : lowerBound;
  targetCounts.set(countKey, (targetCounts.get(countKey) ?? 0) + quantity);
  validRows += 1;
  totalDoors += quantity;
  minHeight = Math.min(minHeight, exactHeight);
  maxHeight = Math.max(maxHeight, exactHeight);
}

const firstBin = Math.floor(minHeight);
const lastBin = Math.floor(maxHeight);
const bins = [];
for (let lower = firstBin; lower <= lastBin; lower += 1) {
  bins.push({
    label: `${lower}`,
    shortLabel: `${lower}`,
    count: integerCounts.get(lower) ?? 0,
    type: "integer",
  });
  bins.push({
    label: `>${lower} to <${lower + 1}`,
    shortLabel: `${lower}-${lower + 1}`,
    count: betweenCounts.get(lower) ?? 0,
    type: "between",
  });
}

fs.mkdirSync(outputDir, { recursive: true });
const csv = [
  "Height Category (inches),Door Count,Percentage",
  ...bins.map(
    ({ label, count }) =>
      `${label},${count},${((count / totalDoors) * 100).toFixed(3)}%`,
  ),
].join("\n");
fs.writeFileSync(tablePath, `${csv}\n`);

const plotBins = bins.filter(({ label, type }) => {
  const heightValue =
    type === "integer"
      ? Number.parseInt(label, 10)
      : Number.parseInt(label.slice(1), 10);
  return heightValue >= 70 && heightValue <= 100 &&
    !(type === "between" && heightValue === 100);
});

const width = 2400;
const height = 850;
const margin = { top: 80, right: 40, bottom: 120, left: 100 };
const plotWidth = width - margin.left - margin.right;
const plotHeight = height - margin.top - margin.bottom;
const maxCount = Math.max(...plotBins.map((bin) => bin.count));
const yStep = maxCount >= 5000 ? 1000 : 100;
const yMax = Math.ceil(maxCount / yStep) * yStep;
const barSlot = plotWidth / plotBins.length;
const barWidth = Math.max(2, barSlot * 0.78);
const y = (value) => margin.top + plotHeight - (value / yMax) * plotHeight;
const gridStep = yMax / 5;

const svg = [];
svg.push(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
  '<rect width="100%" height="100%" fill="white"/>',
  `<text x="${width / 2}" y="34" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" font-weight="bold">Number of Doors by Height (Latest 2,000 Records, 70-100 inches)</text>`,
  `<text x="${width / 2}" y="61" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" fill="#555">Latest records use CSV file order; exact integers are separate; counts include Quantity</text>`,
  `<rect x="${width - 430}" y="18" width="16" height="16" fill="#2878b5"/><text x="${width - 406}" y="31" font-family="Arial, sans-serif" font-size="13">Exact integer</text>`,
  `<rect x="${width - 280}" y="18" width="16" height="16" fill="#e28e2c"/><text x="${width - 256}" y="31" font-family="Arial, sans-serif" font-size="13">Between integers</text>`,
);

for (let value = 0; value <= yMax; value += gridStep) {
  const gridY = y(value);
  svg.push(
    `<line x1="${margin.left}" y1="${gridY}" x2="${width - margin.right}" y2="${gridY}" stroke="#d9dee5" stroke-width="1"/>`,
    `<text x="${margin.left - 12}" y="${gridY + 5}" text-anchor="end" font-family="Arial, sans-serif" font-size="13" fill="#444">${value.toLocaleString("en-US")}</text>`,
  );
}

plotBins.forEach((bin, index) => {
  const barHeight = (bin.count / yMax) * plotHeight;
  const x = margin.left + index * barSlot + (barSlot - barWidth) / 2;
  const barY = margin.top + plotHeight - barHeight;
  const percentage = (bin.count / totalDoors) * 100;
  svg.push(
    `<rect x="${x.toFixed(2)}" y="${barY.toFixed(2)}" width="${barWidth.toFixed(2)}" height="${barHeight.toFixed(2)}" fill="${bin.type === "integer" ? "#2878b5" : "#e28e2c"}">`,
    `<title>${escapeXml(`${bin.label} inches: ${bin.count.toLocaleString("en-US")} doors (${percentage.toFixed(3)}%)`)}</title>`,
    "</rect>",
  );

  if (bin.count > 0) {
    const labelX = x + barWidth / 2;
    const labelY = Math.max(margin.top + 8, barY - 4);
    svg.push(
      `<text x="${labelX.toFixed(2)}" y="${labelY.toFixed(2)}" text-anchor="start" transform="rotate(-90 ${labelX.toFixed(2)} ${labelY.toFixed(2)})" font-family="Arial, sans-serif" font-size="8" fill="#333">${percentage.toFixed(2)}%</text>`,
    );
  }

  const numericHeight = 70 + Math.floor(index / 2);
  if (bin.type === "integer") {
    const labelX = margin.left + index * barSlot + barSlot / 2;
    svg.push(
      `<line x1="${labelX.toFixed(2)}" y1="${margin.top + plotHeight}" x2="${labelX.toFixed(2)}" y2="${margin.top + plotHeight + 6}" stroke="#333"/>`,
      `<text x="${labelX.toFixed(2)}" y="${margin.top + plotHeight + 14}" text-anchor="end" transform="rotate(-90 ${labelX.toFixed(2)} ${margin.top + plotHeight + 14})" font-family="Arial, sans-serif" font-size="11">${numericHeight}</text>`,
    );
  }
});

svg.push(
  `<line x1="${margin.left}" y1="${margin.top + plotHeight}" x2="${width - margin.right}" y2="${margin.top + plotHeight}" stroke="#333" stroke-width="1.5"/>`,
  `<line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + plotHeight}" stroke="#333" stroke-width="1.5"/>`,
  `<text x="${margin.left + plotWidth / 2}" y="${height - 40}" text-anchor="middle" font-family="Arial, sans-serif" font-size="17">Height (inches)</text>`,
  `<text x="28" y="${margin.top + plotHeight / 2}" text-anchor="middle" transform="rotate(-90 28 ${margin.top + plotHeight / 2})" font-family="Arial, sans-serif" font-size="17">Door count</text>`,
  "</svg>",
);
fs.writeFileSync(plotPath, `${svg.join("\n")}\n`);

console.log(
  JSON.stringify(
    {
      validRows,
      skippedRows,
      selectedRecords: selectedRows.length,
      totalDoors,
      minHeight,
      maxHeight,
      tablePath,
      plotPath,
    },
    null,
    2,
  ),
);
