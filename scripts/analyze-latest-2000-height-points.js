import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, "..");
const inputPath = path.join(projectDir, "data", "Door.csv");
const outputDir = path.join(projectDir, "Output");
const tablePath = path.join(
  outputDir,
  "door-height-points-latest-2000-78.75-to-79.75.csv",
);
const plotPath = path.join(
  outputDir,
  "door-height-points-latest-2000-78.75-to-79.75.svg",
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

function formatHeight(value) {
  return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

const parsed = parseCsv(fs.readFileSync(inputPath, "utf8"));
const headers = parsed[0];
const heightIndex = headers.indexOf("Height");
const fractionIndex = headers.indexOf("Height Fraction");
const quantityIndex = headers.indexOf("Quantity");

if ([heightIndex, fractionIndex, quantityIndex].some((index) => index < 0)) {
  throw new Error("Door.csv is missing Height, Height Fraction, or Quantity.");
}

const latestRows = parsed
  .slice(1)
  .filter((row) => row.some((field) => field.trim()))
  .slice(-2000);
const counts = new Map();
let totalDoors = 0;
let latestTotalDoors = 0;
let matchingRecords = 0;

for (const row of latestRows) {
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
    continue;
  }

  latestTotalDoors += quantity;
  const exactHeight = height + fraction;
  if (exactHeight < 78.75 || exactHeight >= 79.75) {
    continue;
  }

  const key = Number(exactHeight.toFixed(6));
  counts.set(key, (counts.get(key) ?? 0) + quantity);
  matchingRecords += 1;
  totalDoors += quantity;
}

const points = [...counts.entries()]
  .sort(([left], [right]) => left - right)
  .map(([height, count]) => ({
    height,
    count,
    percentage:
      latestTotalDoors === 0 ? 0 : (count / latestTotalDoors) * 100,
  }));

fs.mkdirSync(outputDir, { recursive: true });
const csv = [
  "Exact Height (inches),Door Count,Percentage of Latest 2000 Doors",
  ...points.map(
    ({ height, count, percentage }) =>
      `${formatHeight(height)},${count},${percentage.toFixed(3)}%`,
  ),
  `FILTERED TOTAL,${totalDoors},${((totalDoors / latestTotalDoors) * 100).toFixed(3)}%`,
].join("\n");
fs.writeFileSync(tablePath, `${csv}\n`);

const width = 1200;
const height = 760;
const margin = { top: 105, right: 45, bottom: 130, left: 90 };
const plotWidth = width - margin.left - margin.right;
const plotHeight = height - margin.top - margin.bottom;
const maxCount = Math.max(1, ...points.map((point) => point.count));
const yMax = Math.max(5, Math.ceil(maxCount / 5) * 5);
const slot = plotWidth / Math.max(1, points.length);
const barWidth = Math.min(90, slot * 0.62);
const y = (value) => margin.top + plotHeight - (value / yMax) * plotHeight;

const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
  '<rect width="100%" height="100%" fill="white"/>',
  `<text x="${width / 2}" y="35" text-anchor="middle" font-family="Arial, sans-serif" font-size="25" font-weight="bold">Latest 2,000 Records: Exact Heights from 78.75 to &lt;79.75 inches</text>`,
  `<text x="${width / 2}" y="66" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" fill="#333">Matching doors: ${totalDoors.toLocaleString("en-US")} of ${latestTotalDoors.toLocaleString("en-US")} (${((totalDoors / latestTotalDoors) * 100).toFixed(2)}%)</text>`,
  `<text x="${width / 2}" y="88" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#666">Counts include Quantity; percentages use all latest 2,000 doors</text>`,
];

const gridStep = yMax / 5;
for (let value = 0; value <= yMax; value += gridStep) {
  const gridY = y(value);
  svg.push(
    `<line x1="${margin.left}" y1="${gridY}" x2="${width - margin.right}" y2="${gridY}" stroke="#d9dee5"/>`,
    `<text x="${margin.left - 12}" y="${gridY + 5}" text-anchor="end" font-family="Arial, sans-serif" font-size="13">${value.toFixed(value % 1 === 0 ? 0 : 1)}</text>`,
  );
}

points.forEach((point, index) => {
  const x = margin.left + index * slot + (slot - barWidth) / 2;
  const barHeight = (point.count / yMax) * plotHeight;
  const barY = margin.top + plotHeight - barHeight;
  const centerX = x + barWidth / 2;
  svg.push(
    `<rect x="${x.toFixed(2)}" y="${barY.toFixed(2)}" width="${barWidth.toFixed(2)}" height="${barHeight.toFixed(2)}" fill="#2878b5"><title>${escapeXml(`${formatHeight(point.height)} inches: ${point.count} doors (${point.percentage.toFixed(2)}%)`)}</title></rect>`,
    `<text x="${centerX.toFixed(2)}" y="${Math.max(margin.top + 12, barY - 8).toFixed(2)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="bold">${point.count} (${point.percentage.toFixed(1)}%)</text>`,
    `<text x="${centerX.toFixed(2)}" y="${margin.top + plotHeight + 25}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14">${formatHeight(point.height)}</text>`,
  );
});

svg.push(
  `<line x1="${margin.left}" y1="${margin.top + plotHeight}" x2="${width - margin.right}" y2="${margin.top + plotHeight}" stroke="#333" stroke-width="1.5"/>`,
  `<line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + plotHeight}" stroke="#333" stroke-width="1.5"/>`,
  `<text x="${margin.left + plotWidth / 2}" y="${height - 48}" text-anchor="middle" font-family="Arial, sans-serif" font-size="17">Exact height (inches)</text>`,
  `<text x="25" y="${margin.top + plotHeight / 2}" text-anchor="middle" transform="rotate(-90 25 ${margin.top + plotHeight / 2})" font-family="Arial, sans-serif" font-size="17">Door count</text>`,
  "</svg>",
);
fs.writeFileSync(plotPath, `${svg.join("\n")}\n`);

console.log(
  JSON.stringify(
    {
      selectedRecords: latestRows.length,
      matchingRecords,
      totalDoors,
      latestTotalDoors,
      points,
      tablePath,
      plotPath,
    },
    null,
    2,
  ),
);
