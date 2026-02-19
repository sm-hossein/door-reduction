import fs from "fs";

export function loadCSV(path) {
  const text = fs.readFileSync(path, "utf8").trim();
  const lines = text.split("\n");

  const headers = lines[0].split(",").map(h => h.trim());

  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = lines[i].split(",");
    const row = {};

    headers.forEach((h, idx) => {
      row[h] = (values[idx] ?? "").trim(); // ✅ CRITICAL FIX
    });

    rows.push(row);
  }

  return rows;
}
