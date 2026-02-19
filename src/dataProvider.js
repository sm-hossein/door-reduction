import fs from "fs";
import { REFERENCE_CODES } from "./referenceCodes.js";
import { DOOR_TYPES } from "./doorTypes.js";
import { FRACTIONS } from "./fractions.js";
import { COMPONENT_SIZE_RULES } from "./componentSizeRules.js";

const referenceCodeRows = REFERENCE_CODES.map(
  ([id, key, code, desc]) => ({
    "Reference ID": id,
    "Reference Key": key,
    "Reference Code": code,
    "Reference Description": desc
  })
);

const doorTypeRows = DOOR_TYPES.map(
  ([id, type, side]) => ({
    "Type ID": id,
    "Type": type,
    "Side": side
  })
);

const fractionRows = FRACTIONS.map(
  ([id, desc, num, den, dec]) => ({
    "Fraction ID": id,
    "Description": desc,
    "Numerator": num,
    "Denominator": den,
    "Decimal": dec
  })
);

const componentSizeRuleRows = COMPONENT_SIZE_RULES.map(
  ([id, productType, group, category, section, rule]) => ({
    "Size ID": id,
    "Product Type": productType,
    "Group": group,
    "Category": category,
    "Section": section,
    "Sizing Rule": rule
  })
);

function readCsvRows(filePath, predicate, options = {}) {
  const text = fs.readFileSync(filePath, "utf8").trim();
  if (!text) return options.first ? null : [];

  const lines = text.split(/\r?\n/);
  const headers = lines[0].split(",").map(h => h.trim());

  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = lines[i].split(",");
    const row = {};

    headers.forEach((h, idx) => {
      row[h] = (values[idx] ?? "").trim();
    });

    if (!predicate || predicate(row)) {
      if (options.first) return row;
      rows.push(row);
    }
  }

  return options.first ? null : rows;
}

export function createCsvDataProvider() {
  const staticTables = {
    DoorType: doorTypeRows,
    ReferenceCodes: referenceCodeRows,
    Fractions: fractionRows,
    ComponentSizeRules: componentSizeRuleRows
  };

  return {
    getStaticTables: () => staticTables,
    getTables: () => staticTables,
    getDoorById: doorId =>
      readCsvRows(
        "data/Door.csv",
        d => String(d["Door ID"]) === String(doorId),
        { first: true }
      ),
    getDoorByJobNumber: jobNumber =>
      readCsvRows(
        "data/Door.csv",
        d => String(d["Job Number"]) === String(jobNumber),
        { first: true }
      ),
    getAllDoors: () => readCsvRows("data/Door.csv"),
    getProductById: productId =>
      readCsvRows(
        "data/Product.csv",
        p => String(p["Product ID"]) === String(productId),
        { first: true }
      ),
    getComponentById: componentId =>
      readCsvRows(
        "data/Component.csv",
        c => String(c["Component ID"]) === String(componentId),
        { first: true }
      ),
    getComponentsByIds: componentIds => {
      const ids = new Set((componentIds || []).map(id => String(id)));
      if (!ids.size) return [];
      return readCsvRows(
        "data/Component.csv",
        c => ids.has(String(c["Component ID"]))
      );
    },
    getProductComponentsByProductId: productId =>
      readCsvRows(
        "data/ProductComponent.csv",
        pc => String(pc["Product ID"]) === String(productId)
      )
  };
}
