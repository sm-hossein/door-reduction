/**
 * calcDoorOutput.js
 * Conversion of CalcDoorOutput.bas
 */

import { SetGlobalVariables, SetProductVariables, GetOrderType, CreateContext } from "./init.js";
import { GetSize, GetBuildNotes, GetOptions } from "./calculations.js";
import { GetSide } from "./calculations.js";
import {
  GetComponentDescription,
  GetComponentSection,
  GetComponentSize
} from "./components.js";
import { chkClearance } from "./clearanceCheck.js";

function normalizeDoorType(value) {
  const v = String(value || "").trim();
  if (!v) return v;
  const canonical = v.replace(/sidelite/i, "Sidelite");
  if (/^1\s+sidelite$/i.test(canonical)) return "1 Sidelite";
  if (/^2\s+sidelite$/i.test(canonical)) return "2 Sidelite";
  return canonical;
}

function normalizeSideValue(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function csvEscape(v) {
  if (v === null || v === undefined) return "";
  return String(v)
    .replace(/\r\n/g, " ")
    .replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .replace(/,/g, ";")
    .trim();
}

function applySide(ctx, side) {
  const s = String(side || "1");
  ctx.gblRecordID = s;
  switch (s) {
    case "2":
      ctx.gblCurrentSide = "Right";
      break;
    case "3":
      ctx.gblCurrentSide = "Left";
      break;
    default:
      ctx.gblCurrentSide = "Left";
      ctx.gblRecordID = "1";
  }
}

/* -------------------------
   EXPORT DOOR DATA (JSON)
------------------------- */
export function ExportDoorDataToJSON(ctx, data, doorId) {
  const { tables, provider } = data;
  const door = provider.getDoorById(doorId);
  if (!door) throw new Error(`Door ${doorId} not found`);

  const doorTypeKey = normalizeDoorType(door["Type"]);
  const sideRows = tables.DoorType.filter(
    dt => normalizeDoorType(dt.Type) === doorTypeKey
  );
  const sides = sideRows.length
    ? sideRows.map(r => normalizeSideValue(r.Side)).filter(Boolean)
    : ["1"];

  const results = [];

  const toStr = v => (v === null || v === undefined ? "" : String(v));
  const toOptionList = value => {
    if (Array.isArray(value)) {
      return value.map(v => toStr(v).trim()).filter(Boolean);
    }
    const s = toStr(value).trim();
    if (!s) return [];
    if (s.includes("\n")) {
      return s.split(/\r?\n/).map(v => v.trim()).filter(Boolean);
    }
    if (s.includes(",")) {
      return s.split(",").map(v => v.trim()).filter(Boolean);
    }
    return [s];
  };

  const primaryProductId = door["Product ID"];
  const secondaryProductId = door["Secondary Product ID"];
  const primaryProduct = provider.getProductById(primaryProductId) || {};
  const openingComponents = provider.getProductComponentsByDoorType
    ? provider.getProductComponentsByDoorType(door["Type"])
    : provider.getProductComponentsByProductId(door["Type"]);

  const productComponentsPrimary = provider.getProductComponentsByProductId(primaryProductId);
  const productComponentsSecondary = secondaryProductId
    ? provider.getProductComponentsByProductId(secondaryProductId)
    : [];

  ctx.log.INFO("Door trace: " + JSON.stringify(door));
  ctx.log.INFO("Product components (primary): " + JSON.stringify(productComponentsPrimary));
  ctx.log.INFO("Product components (secondary): " + JSON.stringify(productComponentsSecondary));
  ctx.log.INFO("Opening components: " + JSON.stringify(openingComponents));
  const componentIds = new Set([
    ...productComponentsPrimary,
    ...productComponentsSecondary,
    ...openingComponents
  ].map(pc => pc["Component ID"]));
  ctx.log.INFO("Component IDs sample: " + JSON.stringify(componentIds));
  const components = provider.getComponentsByIds([...componentIds]);
  const globalComponentById = new Map(components.map(c => [c["Component ID"], c]));
  ctx.log.INFO(
    "Components trace: productId=" + String(primaryProductId) +
    ", secondaryProductId=" + String(secondaryProductId || "") +
    ", type=" + String(door["Type"]) +
    ", productComponentsPrimary=" + String(productComponentsPrimary.length) +
    ", productComponentsSecondary=" + String(productComponentsSecondary.length) +
    ", openingComponents=" + String(openingComponents.length) +
    ", componentIds=" + String(componentIds.size) +
    ", componentsResolved=" + String(components.length)
  );

  const ctxSide = CreateContext(ctx && ctx.log ? ctx.log : undefined);
  SetGlobalVariables(ctxSide, door, primaryProduct);

  for (const side of sides) {
    applySide(ctxSide, side);
    ctxSide.gblNotes = "";

    const sideKey = normalizeSideValue(side);
    const useSecondaryProduct = sideKey === "3" && !!secondaryProductId;
    const sideProductId = useSecondaryProduct ? secondaryProductId : primaryProductId;
    const sideProduct = provider.getProductById(sideProductId) || primaryProduct;
    const productComponents = provider.getProductComponentsByProductId(sideProductId);
    const componentById = new Map(globalComponentById);
    ctxSide.gblProductID = sideProductId;
    SetProductVariables(ctxSide, sideProduct);

    const manualAdjustNotes = toStr(door["AdjustNotes"]).trim();
    const clearanceNotes = manualAdjustNotes || chkClearance(ctxSide.clearanceInput || {});
    const buildNotes = GetBuildNotes(ctxSide, tables.Fractions);
    const hinge = GetOptions(ctxSide, "Hinge", tables.ReferenceCodes);
    const lock = GetOptions(ctxSide, "Lock", tables.ReferenceCodes);
    const measuredDim =
      GetSize(ctxSide, "Opening Dimensions", tables.Fractions) +
      " " +
      GetOptions(ctxSide, "Operator", tables.ReferenceCodes);
    const refDim = GetSize(ctxSide, "Reference Dimension", tables.Fractions);
    const buildDim = GetSize(ctxSide, "Dimensions", tables.Fractions) + " " + GetSide(ctxSide);

    const orderType = GetOrderType(
      tables.ReferenceCodes,
      "Door Type",
      door["Type"]
    );

    const color = GetOrderType(
      tables.ReferenceCodes,
      "Color",
      door["Color"]
    );
    const lockColor = toStr(door["Lock Color"] || door.Lock_Color).trim();
    const handleType = toStr(door["Handle Type"] || door.Handle_Type).trim();
    const optionValues = toOptionList(
      door["Door_Gate_Option"] || door["Options"] || door.Option
    );

    const rawHeaders = [
      ...Object.keys(door),
      "MeasuredDimensions",
      "RefDimensions",
      "BuildDimensions",
      "OrderType",
      "ColorName",
      "ProductDescription",
      "HingeOutput",
      "LockOutput",
      "ClearanceNotes",
      "BuildNotes"
    ];

    const raw = {};
    for (const h of rawHeaders) {
      switch (h) {
        case "Product ID":
          // Build Product ID in PDF must reflect side-selected product (primary vs secondary).
          raw[h] = toStr(sideProductId);
          break;
        case "MeasuredDimensions":
          raw[h] = toStr(measuredDim);
          break;
        case "RefDimensions":
          raw[h] = toStr(refDim);
          break;
        case "BuildDimensions":
          raw[h] = toStr(buildDim);
          break;
        case "OrderType":
          raw[h] = toStr(orderType);
          break;
        case "ColorName":
          raw[h] = toStr(color);
          break;
        case "ProductDescription":
          raw[h] = toStr(sideProduct.Description || "");
          break;
        case "HingeOutput":
          raw[h] = toStr(hinge);
          break;
        case "LockOutput":
          raw[h] = toStr(lock);
          break;
        case "ClearanceNotes":
          raw[h] = toStr(clearanceNotes);
          break;
        case "BuildNotes":
          raw[h] = toStr(buildNotes);
          break;
        default:
          raw[h] = toStr(door[h]);
      }
    }
    raw["Lock Color"] = lockColor;
    raw["Handle Type"] = handleType;
    raw["Door_Gate_Option"] = optionValues.join(", ");
    raw["Options"] = optionValues.join(", ");

    const components = [];

    const pushComponent = (row, productFields = {}) => {
      components.push({
        "Door ID": row.doorId,
        "Job Number": toStr(row.jobNumber),
        "Job Name": toStr(row.jobName),
        "Issue Date": toStr(row.issueDate),
        "Due Date": toStr(row.dueDate),
        "Product ID": toStr(row.productId),
        "Product Description": toStr(productFields.productDescription || ""),
        "Door Type": toStr(row.doorType),
        "Product Type": toStr(productFields.productType || ""),
        "Glass Type": toStr(productFields.glassType || ""),
        "Component Group": toStr(row.group),
        "Section": toStr(row.section),
        "Side": toStr(row.side),
        "Quantity": toStr(row.quantity),
        "Measurement": toStr(row.measurement),
        "Raw Component Description": toStr(row.rawDescription),
        "Component Category": toStr(row.category),
        "Component Description": toStr(row.description),
        "Location": toStr(row.location),
        "Size": toStr(row.size),
        "Notes": toStr(row.notes)
      });
    };

    const baseCompInfo = {
      doorId,
      jobNumber: csvEscape(door["Job Number"]),
      jobName: csvEscape(door["Job Name"]),
      issueDate: door["Issue Date"],
      dueDate: door["Due Date"]
    };

    const productInfo = {
      productDescription: sideProduct.Description || "",
      productType: sideProduct["Product Type"] || "",
      glassType: sideProduct["Glass Type"] || ""
    };

    // Frame / Internal / Design / Final
    productComponents
      .filter(pc =>
        ["Frame","Internal","Design","Final"].includes(pc["Group"])
      )
      .forEach(pc => {
        const comp = componentById.get(pc["Component ID"]);
        if (!comp) return;

        ctxSide.gblNotes = "";

        const desc = GetComponentDescription(
          ctxSide,
          comp.Description,
          pc.Group,
          comp.Category,
          pc.Section,
          tables.Fractions,
          tables.ReferenceCodes
        );

        const loc = GetComponentSection(
          ctxSide,
          comp.Description,
          pc.Group,
          comp.Category,
          pc.Section
        );

        const size = GetComponentSize(
          ctxSide,
          comp.Description,
          pc.Group,
          comp.Category,
          pc.Section,
          tables.ComponentSizeRules,
          tables.Fractions,
          tables.ReferenceCodes
        );

        pushComponent({
          ...baseCompInfo,
          productId: sideProductId,
          doorType: door["Type"],
          group: pc.Group,
          section: pc.Section,
          side: pc.Side,
          quantity: pc.Quantity,
          measurement: pc.Measurement,
          rawDescription: comp.Description,
          category: comp.Category,
          description: desc,
          location: loc,
          size,
          notes: ctxSide.gblNotes
        }, productInfo);
      });

    // Opening
    const doorTypeRow =
      tables.DoorType.find(
        dt =>
          normalizeDoorType(dt.Type) === doorTypeKey &&
          normalizeSideValue(dt.Side) === sideKey
      ) ||
      tables.DoorType.find(dt => normalizeDoorType(dt.Type) === doorTypeKey);

    if (doorTypeRow) {
      openingComponents
        .filter(pc => {
          const pcDoorType = pc["Door Type"] || pc["Door_Type"];
          const doorTypeMatches = pcDoorType
            ? normalizeDoorType(pcDoorType) === doorTypeKey
            : String(pc["Product ID"]) === String(door["Type"]);
          return (
            doorTypeMatches &&
            pc["Group"] === "Opening" &&
            normalizeSideValue(pc["Side"]) === normalizeSideValue(doorTypeRow.Side)
          );
        })
        .forEach(pc => {
          const comp = componentById.get(pc["Component ID"]);
          if (!comp) return;

          ctxSide.gblNotes = "";

          const desc = GetComponentDescription(
            ctxSide,
            comp.Description,
            pc.Group,
            comp.Category,
            pc.Section,
            tables.Fractions,
            tables.ReferenceCodes
          );

          const loc = GetComponentSection(
            ctxSide,
            comp.Description,
            pc.Group,
            comp.Category,
            pc.Section
          );

          const size = GetComponentSize(
            ctxSide,
            comp.Description,
            pc.Group,
            comp.Category,
            pc.Section,
            tables.ComponentSizeRules,
            tables.Fractions,
            tables.ReferenceCodes
          );

          pushComponent({
            ...baseCompInfo,
            productId: door["Type"],
            doorType: door["Type"],
            group: pc.Group,
            section: pc.Section,
            side: pc.Side,
            quantity: pc.Quantity,
            measurement: pc.Measurement,
            rawDescription: comp.Description,
            category: comp.Category,
            description: desc,
            location: loc,
            size,
            notes: ctxSide.gblNotes
          });
        });
    }

    const orderedComponents = [...components].reverse();
    const isThirdSide = sideKey === "3";
    const componentGroupCounts = orderedComponents.reduce((acc, item) => {
      const group = toStr(item["Component Group"]);
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {});
    const debug = isThirdSide
      ? {
          side: toStr(side),
          doorType: toStr(door["Type"]),
          primaryProductId: toStr(primaryProductId),
          secondaryProductId: toStr(secondaryProductId),
          selectedSideProductId: toStr(sideProductId),
          selectedSideProductDescription: toStr(sideProduct.Description || ""),
          selectedSideProductType: toStr(sideProduct["Product Type"] || ""),
          selectedSideProductGlassType: toStr(sideProduct["Glass Type"] || ""),
          productComponentsCount: Array.isArray(productComponents) ? productComponents.length : 0,
          openingComponentsCount: Array.isArray(openingComponents) ? openingComponents.length : 0,
          componentGroupCounts
        }
      : undefined;

    results.push({
      "doorId": toStr(doorId),
      "side": toStr(side),
      "raw": raw,
      "components": orderedComponents,
      ...(debug ? { "debug": debug } : {})
    });
  }

  return { doors: results };
}
