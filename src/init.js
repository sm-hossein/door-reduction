/**
 * init.js
 * Conversion of Init.bas
 * 
 * This module is responsible for:
 * - Initializing global context (VBA Globals)
 * - Loading Door variables
 * - Loading Product variables
 * - Reference lookups
 */

export function CreateContext(log) {
  return {
    log,
    // --- Door globals
    gblTotalWidth: 0,
    gblTotalHeight: 0,
    gblDoorTotalWidth: 0,
    gblDoorTotalHeight: 0,
    gblDoorSide: "",
    gblRecordID: "",
    gblHinge: "",
    gblLock: "",
    gblType: "",
    gblOperator: "",
    gblDoorID: 0,
    gblProductID: "",
    gblSecondaryProductID: "",
    gblProductType: "",
    gblCurrentSide: "",
    gblGlassType: "",
    gblSection: "",
    gblNewline: "\r\n",
    gblTitle: "",

    // --- Rule globals
    gblOpeningWidthReduce: 0,
    gblOpeningHeightReduce: 0,
    gblPatioDoorIncrease: 0,
    gblFrameWidth: 0,
    gblDoubleGateAdjust: 0,
    gblHoletoHoleAdjust: 0,
    gblMaxDoorDiff: 0,
    gblTopMaxHeightAdjust: 0,
    gblTopMinHeightAdjust: 0,
    gblGlassMaxWidthAdjust: 0,
    gblGlassMinWidthAdjust: 0,
    gblGlassMaxHeightAdjust: 0,
    gblGlassMinHeightAdjust: 0,
    gblExpanderMaxHeightAdjust: 0,
    gblExpanderMinHeightAdjust: 0,
    gblCrossTubeMaxHeightAdjust: 0,
    gblCrossTubeHeightAdjust: 0,
    gblStandardDrillAt: 0,
    gblHandleMinHeight: 0,
    gblHandleMaxHeight: 0,
    gblHandleStdHeight: 0,
    gblTopPicketHeight: 0,
    gblTotalLegLength: 0,
    gblRefWidth1: 0,
    gblRefWidth2: 0,
    gblRefHinge1: "",
    gblRefHinge2: "",
    gblRefLock1: "",
    gblRefLock2: "",

    // --- User strings
    gbl1x3CrossTube: "",
    gbl1x4CrossTube: "",
    gblLockTube: "",
    gblNotes: "",

    // clearance check input payload (ported from VB form-driven fields)
    clearanceInput: null
  };
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toBool(value) {
  if (typeof value === "boolean") return value;
  const v = String(value || "").trim().toLowerCase();
  return v === "true" || v === "1" || v === "-1" || v === "yes";
}

function toLockTypeCode(lockValue) {
  const key = String(lockValue || "").trim().toLowerCase();
  switch (key) {
    case "four way":
    case "fourway":
      return 60;
    case "yale":
    case "yale 1":
      return 61;
    case "slim line":
      return 69;
    case "bee line":
      return 83;
    case "deluxe":
      return 126;
    default:
      return 0;
  }
}

function normalizeSideLiteLabel(value) {
  const v = String(value || "").trim();
  if (!v) return v;
  const canonical = v.replace(/sidelite/i, "Sidelite");
  if (/^1\s+sidelite$/i.test(canonical)) {
    return "1 Sidelite";
  }
  if (/^2\s+sidelite$/i.test(canonical)) {
    return "2 Sidelite";
  }
  return v;
}

/**
 * Replacement for GetOrderType()
 */
export function GetOrderType(referenceCodes, parmKey, parmOrderType) {
  const rec = referenceCodes.find(
    r =>
      String(r["Reference Key"]).toLowerCase() === String(parmKey).toLowerCase() &&
      String(r["Reference Code"]).toLowerCase() === String(parmOrderType).toLowerCase()
  );

  return rec ? rec["Reference Description"] : "";
}

/**
 * Replacement for SetDoorVariables()
 */
export function SetDoorVariables(ctx, door) {

  ctx.gblType = normalizeSideLiteLabel(door["Type"]);
  ctx.gblHinge = door["Hinge"];
  ctx.gblOperator = door["Operator"];
  ctx.gblProductID = door["Product ID"];
  ctx.gblSecondaryProductID = door["Secondary Product ID"];
  ctx.gblDoorSide = door["Door Side"];
  ctx.gblDoorID = Number(door["Door ID"]);
  ctx.gblLock = door["Lock"];

  ctx.gblTotalWidth =
    Number(door["Width"]) + Number(door["Width Fraction"]);

  ctx.gblTotalHeight =
    Number(door["Height"]) + Number(door["Height Fraction"]);

  ctx.gblDoorTotalWidth =
    Number(door["Door Width"]) + Number(door["Door Width Fraction"]);

  ctx.gblDoorTotalHeight =
    Number(door["Door Height"]) + Number(door["Door Height Fraction"]);

  ctx.gblTotalLegLength =
    Number(door["Leg Length"]) + Number(door["Leg Length Fraction"]);

  ctx.clearanceInput = {
    doorHeight: ctx.gblTotalHeight,
    lockType: toLockTypeCode(ctx.gblLock),
    chkLockOK: toBool(door["LockOK"]),
    ex: {
      DBLoc: toNumber(door["ExDBLoc"]),
      DBLocB: toNumber(door["ExDBLocB"]),
      DBProj: toNumber(door["ExDBLocFrac"]),
      KLoc: toNumber(door["ExKnobLoc"]),
      KLocB: toNumber(door["ExKnobLocB"]),
      KProj: toNumber(door["ExKnobLocFrac"])
    }
  };
}

/**
 * Replacement for SetProductVariables()
 */
export function SetProductVariables(ctx, product) {

  ctx.gblProductType = normalizeSideLiteLabel(product["Product Type"]);
  ctx.gblGlassType = product["Glass Type"];

  switch (ctx.gblProductType) {
    case "Door":
      ctx.gblFrameWidth = 4;
      break;
    case "Gate":
    case "1 SideLite":
    case "1 Sidelite":
    case "2 Sidelite":
    case "1 Frame":
    case "2 Frame":
    case "Window":
      ctx.gblFrameWidth = 2;
      break;
  }
}

/**
 * Replacement for GetProductID()
 */
export function GetProductID(ctx, products, parmOption) {
  ctx.gblRecordID = parmOption;

  let productID = ctx.gblProductID;

  switch (parmOption) {
    case "1":
      ctx.gblCurrentSide = "Left";
      break;
    case "2":
      ctx.gblCurrentSide = "Right";
      break;
    case "3":
      ctx.gblCurrentSide = "Left";
      productID = ctx.gblSecondaryProductID;
      break;
  }

  SetProductVariables(ctx, products, productID);
  return productID;
}

/**
 * Replacement for SetGlobalVariables()
 */
export function SetGlobalVariables(ctx, door, product) {
  // --- Rule defaults
  ctx.gblOpeningWidthReduce = 0.625;
  ctx.gblOpeningHeightReduce = 1;
  ctx.gblPatioDoorIncrease = 0.25;
  ctx.gblDoubleGateAdjust = 0.125;
  ctx.gblHoletoHoleAdjust = 1;
  ctx.gblMaxDoorDiff = 0.25;
  ctx.gblTopMaxHeightAdjust = 5;
  ctx.gblTopMinHeightAdjust = -5;
  ctx.gblGlassMaxWidthAdjust = 0.5;
  ctx.gblGlassMinWidthAdjust = -0.5;
  ctx.gblGlassMaxHeightAdjust = 0;
  ctx.gblGlassMinHeightAdjust = -1;
  ctx.gblExpanderMaxHeightAdjust = 1.25;
  ctx.gblExpanderMinHeightAdjust = -0.25;
  ctx.gblCrossTubeMaxHeightAdjust = 2;
  ctx.gblCrossTubeHeightAdjust = 0;
  ctx.gblStandardDrillAt = 0.875;
  ctx.gblHandleMinHeight = 35.5;
  ctx.gblHandleStdHeight = 37;
  ctx.gblHandleMaxHeight = 45;
  ctx.gblTopPicketHeight = 0;

  // --- Strings
  ctx.gblNewline = "\r\n";
  ctx.gbl1x3CrossTube = "1x3 Cross Tube";
  ctx.gbl1x4CrossTube = "1x4 Cross Tube";
  ctx.gblLockTube = "1x2 Tube";
  ctx.gblNotes = "";

  // --- Other globals
  ctx.gblDoorID = door["Door ID"];
  ctx.gblCurrentSide = "Left";
  ctx.gblRecordID = "1";
  ctx.gblRefWidth1 = 0;
  ctx.gblRefWidth2 = 0;
  ctx.gblRefHinge1 = "";
  ctx.gblRefHinge2 = "";
  ctx.gblRefLock1 = "";
  ctx.gblRefLock2 = "";

  SetDoorVariables(ctx, door);
  SetProductVariables(ctx, product);
}
