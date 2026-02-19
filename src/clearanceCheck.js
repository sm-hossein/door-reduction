/**
 * clearanceCheck.js
 * Accurate conversion of ClearanceCheck.bas
 */

/* =========================
   CONSTANTS (exact values)
========================= */

// Build out
const LATH14 = 0.25;
const LATH38 = 0.375;
const TUBE = 1;

// Glass clearance
const NORMAL_GLASS = 0.25;

const DOOR_HEIGHT = 79;

// ----- 4-Way Mortise -----
const MDL = 36.875;
const MDU = 38.875;
const MRDL = 40.875;
const MRDU = 42.875;
const MDP = 0.625;

const MKL = 40.375;
const MKU = 42.75;
const MRKL = 37;
const MRKU = 39.375;
const MKP = 2.5;

const MLL = 40.875;
const MLU = 42.5;
const MRLL = 37.25;
const MRLU = 38.875;
const MLP = 2;

// ----- Yale -----
const YDL = 37;
const YDU = 39.125;
const YRDL = 40.125;
const YRDU = 42.25;
const YDP = 1.25;

const YKL = 40.375;
const YKU = 42.375;
const YRKL = 37.25;
const YRKU = 39.25;
const YKP = 2.625;

const YLL = 41;
const YLU = 42;
const YRLL = 37.625;
const YRLU = 38.625;
const YLP = 2.25;

// ----- Slimline / Bee Line -----
const SDL = 41.375;
const SDU = 42.5;
const SDP = 0.5;

const SLL = 38.5;
const SLU = 40.25;
const SLP = 1.625;

// ----- Return Codes -----
const GLASS_FAILED = 0;
const NO_ADJUSTMENT = 1;
const REVERSE_LOCK = 2;
const LEVER_REQUIRED = 3;
const REVERSE_LEVER = 4;
const LATH14_REQUIRED = 5;
const LATH38_REQUIRED = 6;
const LATH14_LEVER = 7;
const LATH38_LEVER = 8;
const REVERSE_LATH14 = 9;
const REVERSE_LATH38 = 10;
const REVERSE_LEVER_LATH14 = 11;
const REVERSE_LEVER_LATH38 = 12;
const TUBE_REQUIRED = 13;
const TUBE_LEVER = 14;
const REVERSE_TUBE = 15;
const REVERSE_LEVER_TUBE = 16;
const CHECK_FAILED = 17;
const BAD_LOCK = 18;

/* =========================
   ENTRY POINT
========================= */

export function chkClearance(input) {
  // input = {
  //   doorHeight,
  //   lockType,
  //   chkLockOK,
  //   ex: { KLoc, KLocB, KProj, DBLoc, DBLocB, DBProj }
  // }

  if (input.chkLockOK === true) {
    return "No adjustment needed - clearance check skipped";
  }

  if (!input.doorHeight || input.doorHeight === 0) {
    return "Door height was not entered - clearance check not performed";
  }

  const {
    KProj, DBProj,
    KLoc, KLocB,
    DBLoc, DBLocB
  } = input.ex;

  const iDoorHt = input.doorHeight;
  const iLocAdjust = iDoorHt - DOOR_HEIGHT;

  const lowestClearance = Math.min(DBProj, KProj);
  const iGlassAdj = NORMAL_GLASS - lowestClearance;

  let result = chkDBKLoc(
    input.lockType,
    iLocAdjust,
    DBProj,
    KProj,
    DBLoc,
    DBLocB,
    KLoc,
    KLocB,
    iGlassAdj
  );

  // Yale → try 4-way upgrade
  let upgraded = false;
  if (result === CHECK_FAILED && input.lockType === 61) {
    const tryUpgrade = chkDBKLoc(
      60,
      iLocAdjust,
      DBProj,
      KProj,
      DBLoc,
      DBLocB,
      KLoc,
      KLocB,
      iGlassAdj
    );
    if (tryUpgrade !== CHECK_FAILED) {
      result = tryUpgrade;
      upgraded = true;
    }
  }

  let output = OutPut(result);
  if (upgraded) {
    output += "\nUpgrade to 4-Way Mortise Lock is required";
  }

  return output;
}

/* =========================
   LOCK PARAMETER SETUP
========================= */

function chkDBKLoc(
  iLockType,
  iLocAdjust,
  iDBClear,
  iKClear,
  iDBLoc,
  iDBLocB,
  iKLoc,
  iKLocB,
  iGlassAdj
) {
  let iDBLB, iDBUB, iRDBLB, iRDBUB, iDBP;
  let iKLB, iKUB, iRKLB, iRKUB, iKP;
  let iLLB, iLUB, iRLLB, iRLUB, iLP;

  switch (iLockType) {
    case 60: // 4-way
      iDBLB = iLocAdjust + MDL;
      iDBUB = iLocAdjust + MDU;
      iRDBLB = iLocAdjust + MRDL;
      iRDBUB = iLocAdjust + MRDU;
      iKLB = iLocAdjust + MKL;
      iKUB = iLocAdjust + MKU;
      iRKLB = iLocAdjust + MRKL;
      iRKUB = iLocAdjust + MRKU;
      iLLB = iLocAdjust + MLL;
      iLUB = iLocAdjust + MLU;
      iRLLB = iLocAdjust + MRLL;
      iRLUB = iLocAdjust + MRLU;
      iDBP = MDP;
      iKP = MKP;
      iLP = MLP;
      break;

    case 61: // Yale
      iDBLB = iLocAdjust + YDL;
      iDBUB = iLocAdjust + YDU;
      iRDBLB = iLocAdjust + YRDL;
      iRDBUB = iLocAdjust + YRDU;
      iKLB = iLocAdjust + YKL;
      iKUB = iLocAdjust + YKU;
      iRKLB = iLocAdjust + YRKL;
      iRKUB = iLocAdjust + YRKU;
      iLLB = iLocAdjust + YLL;
      iLUB = iLocAdjust + YLU;
      iRLLB = iLocAdjust + YRLL;
      iRLUB = iLocAdjust + YRLU;
      iDBP = YDP;
      iKP = YKP;
      iLP = YLP;
      break;

    case 69:
    case 83:
    case 126: // Slimline / Bee Line
      iDBLB = iLocAdjust + SDL;
      iDBUB = iLocAdjust + SDU;
      iLLB = iLocAdjust + SLL;
      iLUB = iLocAdjust + SLU;
      iDBP = SDP;
      iLP = SLP;
      iKLB = iKUB = iRKLB = iRKUB = iRDBLB = iRDBUB = iRLLB = iRLUB = iKP = 0;
      break;
  }

  return chkClear(
    iDBUB, iDBLB, iRDBLB, iRDBUB, iDBP,
    iKLB, iKUB, iRKLB, iRKUB,
    iLLB, iLUB, iRLLB, iRLUB,
    iKP, iLP,
    iDBClear, iKClear,
    iDBLoc, iDBLocB,
    iKLoc, iKLocB,
    iLockType, iGlassAdj
  );
}

/* =========================
   CLEARANCE CHECK
========================= */

function chkClear(
  iDBUB, iDBLB, iRDBLB, iRDBUB, iDBP,
  iKLB, iKUB, iRKLB, iRKUB,
  iLLB, iLUB, iRLLB, iRLUB,
  iKP, iLP,
  iDBClear, iKClear,
  iDBLoc, iDBLocB,
  iKLoc, iKLocB,
  iLockType, iGlassAdj
) {
  if (iGlassAdj > TUBE) return GLASS_FAILED;

  if ([69, 83, 126].includes(iLockType)) {
    if (iGlassAdj === 0 && chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, iLLB, iLUB, iDBP, iLP, iDBClear, iKClear, 0))
      return NO_ADJUSTMENT;

    if (iGlassAdj <= LATH14 && chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, iLLB, iLUB, iDBP, iLP, iDBClear, iKClear, LATH14))
      return LATH14_REQUIRED;

    if (iGlassAdj <= LATH38 && chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, iLLB, iLUB, iDBP, iLP, iDBClear, iKClear, LATH38))
      return LATH38_REQUIRED;

    if (chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, iLLB, iLUB, iDBP, iLP, iDBClear, iKClear, TUBE))
      return TUBE_REQUIRED;

    return CHECK_FAILED;
  }

  // 4-way / Yale
  if (iGlassAdj <= 0 && chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, iKLB, iKUB, iDBP, iKP, iDBClear, iKClear, 0))
    return NO_ADJUSTMENT;

  if (iGlassAdj <= 0 && chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iRDBLB, iRDBUB, iRKLB, iRKUB, iDBP, iKP, iDBClear, iKClear, 0))
    return REVERSE_LOCK;

  if (iGlassAdj <= 0 && chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, iLLB, iLUB, iDBP, iLP, iDBClear, iKClear, 0))
    return LEVER_REQUIRED;

  if (iGlassAdj <= 0 && chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iRDBLB, iRDBUB, iRLLB, iRLUB, iDBP, iLP, iDBClear, iKClear, 0))
    return REVERSE_LEVER;

  if (iGlassAdj <= LATH14 && chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, iKLB, iKUB, iDBP, iKP, iDBClear, iKClear, LATH14))
    return LATH14_REQUIRED;

  if (iGlassAdj <= LATH38 && chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, iKLB, iKUB, iDBP, iKP, iDBClear, iKClear, LATH38))
    return LATH38_REQUIRED;

  if (iGlassAdj <= LATH14 && chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, iLLB, iLUB, iDBP, iLP, iDBClear, iKClear, LATH14))
    return LATH14_LEVER;

  if (iGlassAdj <= LATH38 && chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, iLLB, iLUB, iDBP, iLP, iDBClear, iKClear, LATH38))
    return LATH38_LEVER;

  if (iGlassAdj <= LATH14 && chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iRDBLB, iRDBUB, iRKLB, iRKUB, iDBP, iKP, iDBClear, iKClear, LATH14))
    return REVERSE_LATH14;

  if (iGlassAdj <= LATH38 && chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iRDBLB, iRDBUB, iRKLB, iRKUB, iDBP, iKP, iDBClear, iKClear, LATH38))
    return REVERSE_LATH38;

  if (iGlassAdj <= LATH14 && chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iRDBLB, iRDBUB, iRLLB, iRLUB, iDBP, iLP, iDBClear, iKClear, LATH14))
    return REVERSE_LEVER_LATH14;

  if (iGlassAdj <= LATH38 && chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iRDBLB, iRDBUB, iRLLB, iRLUB, iDBP, iLP, iDBClear, iKClear, LATH38))
    return REVERSE_LEVER_LATH38;

  if (iGlassAdj <= TUBE && chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, iKLB, iKUB, iDBP, iKP, iDBClear, iKClear, TUBE))
    return TUBE_REQUIRED;

  if (iGlassAdj <= TUBE && chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iDBLB, iDBUB, iLLB, iLUB, iDBP, iLP, iDBClear, iKClear, TUBE))
    return TUBE_LEVER;

  if (iGlassAdj <= TUBE && chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iRDBLB, iRDBUB, iRKLB, iRKUB, iDBP, iKP, iDBClear, iKClear, TUBE))
    return REVERSE_TUBE;

  if (iGlassAdj <= TUBE && chkLoc(iDBLoc, iDBLocB, iKLoc, iKLocB, iRDBLB, iRDBUB, iRLLB, iRLUB, iDBP, iLP, iDBClear, iKClear, TUBE))
    return REVERSE_LEVER_TUBE;

  return CHECK_FAILED;
}

/* =========================
   LOCATION CHECK
========================= */

function chkLoc(
  deadBoltLoc, deadBoltLocB,
  knobLoc, knobLocB,
  deadBoltLB, deadBoltUB,
  knobLB, knobUB,
  deadBoltProj, knobProj,
  deadBoltClear, knobClear,
  adjustment
) {
  if (
    (deadBoltLoc >= deadBoltLB || deadBoltLocB >= deadBoltLB) &&
    (deadBoltLoc <= deadBoltUB || deadBoltLocB <= deadBoltUB) &&
    deadBoltProj > deadBoltClear + adjustment
  ) return false;

  if (
    (deadBoltLoc >= knobLB || deadBoltLocB >= knobLB) &&
    (deadBoltLoc <= knobUB || deadBoltLocB <= knobUB) &&
    knobProj > deadBoltClear + adjustment
  ) return false;

  if (
    (knobLoc >= knobLB || knobLocB >= knobLB) &&
    (knobLoc <= knobUB || knobLocB <= knobUB) &&
    knobProj > knobClear + adjustment
  ) return false;

  if (
    (knobLoc >= deadBoltLB || knobLocB >= deadBoltLB) &&
    (knobLoc <= deadBoltUB || knobLocB <= deadBoltUB) &&
    deadBoltProj > knobClear + adjustment
  ) return false;

  return true;
}

/* =========================
   OUTPUT STRING MAP
========================= */

function OutPut(code) {
  switch (code) {
    case GLASS_FAILED: return "Clearance Checked Failed - not able to adjust glass";
    case NO_ADJUSTMENT: return "No Adjustment Required";
    case REVERSE_LOCK: return "Reverse Lock Set Required";
    case LEVER_REQUIRED: return "Lever Required";
    case REVERSE_LEVER: return "Reverse Lever Required";
    case LATH14_REQUIRED: return "1/4-in Lath Required";
    case LATH38_REQUIRED: return "3/8-in Lath Required";
    case LATH14_LEVER: return "1/4-in Lath and Lever Required";
    case LATH38_LEVER: return "3/8-in Lath and Lever Required";
    case REVERSE_LATH14: return "Reverse and 1/4-in Lath Required";
    case REVERSE_LATH38: return "Reverse and 3/8-in Lath Required";
    case REVERSE_LEVER_LATH14: return "Reverse Lever and 1/4-in Lath Required";
    case REVERSE_LEVER_LATH38: return "Reverse Lever and 3/8-in Lath Required";
    case TUBE_REQUIRED: return "Tube Frame Required";
    case TUBE_LEVER: return "Tube Frame and Lever Required";
    case REVERSE_TUBE: return "Reverse Tube Frame Required";
    case REVERSE_LEVER_TUBE: return "Reverse Lever and Tube Frame Required";
    case CHECK_FAILED: return "Clearance Checked Failed - not able to adjust door";
    case BAD_LOCK: return "Lock Type not recognized - Clearance check not performed";
    default: return "Improper Clearance Check";
  }
}
