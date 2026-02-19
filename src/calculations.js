// src/calculations.js
// Conversion of Calculations.bas (Access VBA) → Node.js
// All global variables are accessed via ctx.*

import { Dimensions } from "./conversions.js";
import { GetOrderType } from "./init.js";
import { IsOperator } from "./misc.js";

/* ============================================================
   GetActualHeight
============================================================ */
/**
 * Accurate conversion of:
 * Function GetActualHeight(parmPhase)
 */
export function GetActualHeight(ctx, parmPhase, fractions) {
  let lclCustom = "No";
  let lclNumberGlass = 2;
  let lclGlass = 2;
  let lclPushGlassDown = 0;
  let lclGlassSizeAdjust = 0;
  let lclCrossTubeAdjust = 0;
  let lclGlassAdjust = 0;
  let lclPicketHeightAdjust = 0;

  let lclStdPicketHeight = 0;
  let lclStdGlassHeight = 0;
  let lclAdditionalCrossBarAdjust = 0;
  let lclDoorheight = 0;
  let lclHeight = 0;

  /* ---------------------------------
     Glass type defaults
  --------------------------------- */
  switch (ctx.gblGlassType) {
    case "One":
      lclStdPicketHeight = 74;
      lclStdGlassHeight = 74;
      lclAdditionalCrossBarAdjust = 1;
      break;

    case "Two":
      lclStdPicketHeight = 36.5;
      lclStdGlassHeight = 36.5;
      break;

    case "Two SS":
      lclStdPicketHeight = 36.75;
      lclStdGlassHeight = 34.625;
      break;

    case "Three":
      lclStdPicketHeight =
        37.5 - GetLockSize(ctx, "Height") / 2;
      lclStdGlassHeight = 33.5;
      break;
  }

  /* ---------------------------------
     Width-driven glass count
  --------------------------------- */
  if (parmPhase !== "Initial") {
    lclNumberGlass = GetActualWidth(ctx, "Initial", fractions);
  }

  const lclTotalHeight = GetSize(ctx, "Initial Height", fractions);

  /* ---------------------------------
     No standard glass possible
  --------------------------------- */
  if (lclNumberGlass === 0) {
    lclCustom = "Yes";
  } else {
    /* ---------------------------------
       Height optimization rules
    --------------------------------- */
    switch (ctx.gblGlassType) {
      case "One":
        if (lclTotalHeight > 83.25) {
          lclCustom = "Yes";
        } else if (lclTotalHeight > 82.25) {
          lclDoorheight = 81;
          lclCrossTubeAdjust = 2;
        } else if (lclTotalHeight > 81.25) {
          lclDoorheight = 80;
          lclCrossTubeAdjust = 1;
        } else if (lclTotalHeight >= 79.75) {
          lclDoorheight = 79;
        } else if (lclTotalHeight >= 78.75) {
          lclDoorheight = 78;
          lclPushGlassDown = 1;
          lclPicketHeightAdjust = -1;
        } else {
          lclCustom = "Yes";
        }
        break;

      case "Two":
        if (lclTotalHeight > 83.25) {
          lclCustom = "Yes";
        } else if (lclTotalHeight > 82.25) {
          lclDoorheight = 81;
          lclCrossTubeAdjust = 2;
        } else if (lclTotalHeight > 81.25) {
          lclDoorheight = 80;
          lclCrossTubeAdjust = 1;
        } else if (lclTotalHeight >= 79.75) {
          lclDoorheight = 79;
        } else if (lclTotalHeight >= 78.75) {
          lclDoorheight = 78;
          lclPushGlassDown = 1;
          lclPicketHeightAdjust = -1;
        } else if (lclTotalHeight >= 77.75) {
          lclDoorheight = 77;
          lclGlassSizeAdjust = -3;
          lclCrossTubeAdjust = 1;
          lclPushGlassDown = 1;
          lclPicketHeightAdjust = -3;
        } else if (lclTotalHeight >= 76.75) {
          lclDoorheight = 76;
          lclGlassSizeAdjust = -3;
          lclPicketHeightAdjust = -3;
        } else if (lclTotalHeight >= 75.75) {
          lclDoorheight = 75;
          lclGlassSizeAdjust = -3;
          lclPushGlassDown = 1;
          lclPicketHeightAdjust = -4;
        } else {
          lclCustom = "Yes";
        }
        break;

      case "Two SS":
        if (lclTotalHeight > 83.25) {
          lclCustom = "Yes";
        } else if (lclTotalHeight > 82.25) {
          lclDoorheight = 81;
        } else if (lclTotalHeight > 81.25) {
          lclDoorheight = 80;
        } else if (lclTotalHeight >= 79.75) {
          lclDoorheight = 79;
        } else if (lclTotalHeight >= 78.75) {
          lclDoorheight = 78;
        } else if (lclTotalHeight >= 77.75) {
          lclDoorheight = 77;
        } else if (lclTotalHeight >= 76.75) {
          lclDoorheight = 76;
        } else if (lclTotalHeight >= 75.75) {
          lclDoorheight = 75;
        } else {
          lclCustom = "Yes";
        }
        break;

      case "Three":
        if (lclTotalHeight > 86.25) {
          lclCustom = "Yes";
        } else if (lclTotalHeight > 85.25) {
          lclStdPicketHeight += 3;
          lclStdGlassHeight += 3;
          lclDoorheight = 84;
          lclGlassSizeAdjust = -3;
          lclCrossTubeAdjust = 2;
          lclPicketHeightAdjust = -3;
        } else if (lclTotalHeight > 84.25) {
          lclStdPicketHeight += 3;
          lclStdGlassHeight += 3;
          lclDoorheight = 83;
          lclGlassSizeAdjust = -3;
          lclPicketHeightAdjust = -3;
          lclCrossTubeAdjust = 1;
        } else if (lclTotalHeight >= 83) {
          lclStdPicketHeight += 3;
          lclStdGlassHeight += 3;
          lclDoorheight = 82;
          lclGlassSizeAdjust = -3;
          lclPicketHeightAdjust = -3;
        } else if (lclTotalHeight > 82.25) {
          lclDoorheight = 81;
          lclCrossTubeAdjust = 2;
        } else if (lclTotalHeight > 81.25) {
          lclDoorheight = 80;
          lclCrossTubeAdjust = 1;
        } else if (lclTotalHeight >= 79.75) {
          lclDoorheight = 79;
        } else if (lclTotalHeight >= 78.75) {
          lclDoorheight = 78;
          lclPushGlassDown = 1;
          lclPicketHeightAdjust = -1;
        } else {
          lclCustom = "Yes";
        }
        break;
    }
  }

  /* ---------------------------------
     Custom glass fallback
  --------------------------------- */
  if (lclCustom === "Yes") {
    lclDoorheight =
      lclTotalHeight - ctx.gblOpeningHeightReduce;
    lclGlassAdjust = 9999;

    switch (ctx.gblGlassType) {
      case "One":
        lclGlass = 0;
        break;
      default:
        lclGlass = 1;
    }
  }

  /* ---------------------------------
     Return by phase
  --------------------------------- */
  switch (parmPhase) {
    case "Initial":
      return lclNumberGlass;

    case "Full Height":
      return lclDoorheight;

    case "Cross Tube":
      return lclCrossTubeAdjust;

    case "Glass Comment":
      return lclGlassAdjust;

    case "Glass":
      return lclGlassSizeAdjust;

    case "Push Glass Down":
      return lclPushGlassDown;

    case "Top Glass":
    case "Top Screen":
      if (lclCustom === "Yes") {
        if (lclNumberGlass !== 0) {
          ctx.gblNotes =
            (parmPhase === "Top Glass"
              ? "Custom glass.  "
              : "Custom screen.  ") + ctx.gblNotes;
        }

        let result =
          lclDoorheight -
          lclGlassSizeAdjust -
          lclCrossTubeAdjust -
          ctx.gblFrameWidth -
          GetLockSize(ctx, "Height Glass") -
          (lclStdPicketHeight + lclPicketHeightAdjust) +
          0.5;

        if (ctx.gblGlassType === "Two SS") {
          result = lclDoorheight - 42.375;
        }

        return result;
      }

      return lclStdGlassHeight + 0.5;

    case "Bottom Glass":
    case "Bottom Screen": {
      let result =
        lclStdGlassHeight + lclGlassSizeAdjust + 0.5;

      if (ctx.gblGlassType === "One" && lclCustom === "Yes") {
        result =
          lclDoorheight - ctx.gblFrameWidth - 1 + 0.5;
      }

      return result;
    }

    case "Bottom Picket":
      if (lclPicketHeightAdjust > 0) {
        ctx.gblNotes +=
          `Use +${lclPicketHeightAdjust}" Pickets.  `;
      } else if (lclPicketHeightAdjust < 0) {
        ctx.gblNotes +=
          `Use ${lclPicketHeightAdjust}" Pickets.  `;
      }

      return lclStdPicketHeight + lclPicketHeightAdjust;

    case "Top Picket":
      lclHeight =
        lclDoorheight -
        lclCrossTubeAdjust -
        ctx.gblFrameWidth -
        GetLockSize(ctx, "Height") -
        (lclStdPicketHeight + lclPicketHeightAdjust);

      if (ctx.gblGlassType === "Two SS") {
        lclHeight += 0.5;
      }

      if (lclHeight !== lclStdPicketHeight) {
        ctx.gblNotes =
          "Cut Pickets " +
          Dimensions("Height", 0, lclHeight, fractions) +
          ".  ";
      }

      return lclHeight;
  }

  return 0;
}

/* ============================================================
   GetActualWidth
============================================================ */
export function GetActualWidth(ctx, parmPhase, fractions) {
  let lclSizeDiff;
  let lclGlassWidth;
  let lclDoorWidth = 0;
  let lclGlassAdjust = 0;
  let lclNumberGlass = 2;
  let lclStandardGlass;
  let lclCompensate;
  let lclMaxDoorDiff;

  /* ---------------------------------
     SINGLE vs DOUBLE DOOR DIFFERENCE
  --------------------------------- */
  switch (ctx.gblType) {
    case "Single":
    case "1 Sidelite":
    case "2 Sidelite":
      lclMaxDoorDiff = 0;
      ctx.gblRefWidth1 = GetSize(ctx, "Initial Width", fractions);
      break;
    default:
      lclMaxDoorDiff = ctx.gblMaxDoorDiff / 2;
  }

  /* ---------------------------------
     STANDARD WIDTH SELECTION (36/32/30)
  --------------------------------- */
  const lclTotalWidth =
    GetSize(ctx, "Initial Width", fractions) + ctx.gblOpeningWidthReduce;

  if (parmPhase !== "Initial") {
    lclStandardGlass = GetActualHeight(ctx, "Initial", fractions);
  }

  if (
    Math.abs(lclTotalWidth - 36) - ctx.gblGlassMinWidthAdjust <=
    Math.abs(lclTotalWidth - 32) + ctx.gblGlassMaxWidthAdjust
  ) {
    lclSizeDiff = lclTotalWidth - 36;
    lclGlassWidth = 36;
  } else if (
    Math.abs(lclTotalWidth - 32) - ctx.gblGlassMinWidthAdjust <=
    Math.abs(lclTotalWidth - 30) + ctx.gblGlassMaxWidthAdjust
  ) {
    lclSizeDiff = lclTotalWidth - 32;
    lclGlassWidth = 32;
  } else {
    lclSizeDiff = lclTotalWidth - 30;
    lclGlassWidth = 30;
  }

  /* ---------------------------------
     STANDARD GLASS BOTH DOORS
  --------------------------------- */
  if (
    lclSizeDiff <= ctx.gblGlassMaxWidthAdjust &&
    lclSizeDiff >= ctx.gblGlassMinWidthAdjust
  ) {
    lclNumberGlass = 2;

    if (Math.abs(lclSizeDiff) > lclMaxDoorDiff) {
      lclGlassAdjust = ctx.gblStandardDrillAt - lclSizeDiff / 2;
      lclDoorWidth = GetSize(ctx, "Initial Width", fractions);

      if (ctx.gblRefWidth1 === 0) {
        ctx.gblRefWidth1 = lclDoorWidth;
        ctx.gblRefWidth2 = lclDoorWidth;
      }
    } else {
      if (IsOperator(ctx)) {
        lclGlassAdjust = ctx.gblStandardDrillAt;
        lclDoorWidth =
          GetSize(ctx, "Initial Width", fractions) - lclSizeDiff;
      } else {
        lclGlassAdjust =
          ctx.gblStandardDrillAt - lclSizeDiff;
        lclDoorWidth =
          GetSize(ctx, "Initial Width", fractions) + lclSizeDiff;
      }

      if (ctx.gblRefWidth1 === 0) {
        if (IsOperator(ctx)) {
          ctx.gblRefWidth1 =
            GetSize(ctx, "Initial Width", fractions) - lclSizeDiff;
          ctx.gblRefWidth2 =
            GetSize(ctx, "Initial Width", fractions) + lclSizeDiff;
        } else {
          ctx.gblRefWidth1 =
            GetSize(ctx, "Initial Width", fractions) + lclSizeDiff;
          ctx.gblRefWidth2 =
            GetSize(ctx, "Initial Width", fractions) - lclSizeDiff;
        }
      }
    }

  /* ---------------------------------
     STANDARD GLASS ONE DOOR ONLY
  --------------------------------- */
  } else if (
    lclSizeDiff <= ctx.gblGlassMaxWidthAdjust + lclMaxDoorDiff &&
    lclSizeDiff >= ctx.gblGlassMinWidthAdjust - lclMaxDoorDiff
  ) {
    lclNumberGlass = 2;

    if (parmPhase !== "Initial") {
      lclStandardGlass = GetActualHeight(ctx, "Initial", fractions);
    }

    if (lclStandardGlass === 0) {
      lclDoorWidth = GetSize(ctx, "Initial Width", fractions);
      if (ctx.gblRefWidth1 === 0) {
        ctx.gblRefWidth1 = lclDoorWidth;
        ctx.gblRefWidth2 = lclDoorWidth;
      }
    } else {
      if (lclSizeDiff < 0) {
        lclCompensate = lclSizeDiff - ctx.gblGlassMinWidthAdjust;
        lclGlassAdjust = ctx.gblGlassMinWidthAdjust;
      } else {
        lclCompensate = lclSizeDiff - ctx.gblGlassMaxWidthAdjust;
        lclGlassAdjust = ctx.gblGlassMaxWidthAdjust;
      }

      if (IsOperator(ctx)) {
        lclGlassAdjust =
          ctx.gblStandardDrillAt + lclGlassAdjust / 2;
        lclDoorWidth =
          GetSize(ctx, "Initial Width", fractions) - lclCompensate;
      } else {
        lclGlassAdjust = 9999;
        lclDoorWidth =
          GetSize(ctx, "Initial Width", fractions) + lclCompensate;
      }

      if (ctx.gblRefWidth1 === 0) {
        if (IsOperator(ctx)) {
          ctx.gblRefWidth1 =
            GetSize(ctx, "Initial Width", fractions) - lclCompensate;
          ctx.gblRefWidth2 =
            GetSize(ctx, "Initial Width", fractions) + lclCompensate;
        } else {
          ctx.gblRefWidth1 =
            GetSize(ctx, "Initial Width", fractions) + lclCompensate;
          ctx.gblRefWidth2 =
            GetSize(ctx, "Initial Width", fractions) - lclCompensate;
        }
      }
    }

  /* ---------------------------------
     NO STANDARD GLASS
  --------------------------------- */
  } else {
    lclNumberGlass = 0;
    lclGlassAdjust = 9999;
    lclDoorWidth = GetSize(ctx, "Initial Width", fractions);
    ctx.gblRefWidth1 = lclDoorWidth;
    ctx.gblRefWidth2 = lclDoorWidth;
  }

  /* ---------------------------------
     RETURN VALUES BY PHASE
  --------------------------------- */
  switch (parmPhase) {
    case "Initial":
      return lclNumberGlass;

    case "Full Width":
      return lclDoorWidth;

    case "Glass":
    case "Screen":
      if (lclGlassAdjust === 9999) {
        ctx.gblNotes =
          (parmPhase === "Glass"
            ? "Custom glass.  "
            : "Custom screen.  ") + ctx.gblNotes;

        return lclDoorWidth - ctx.gblFrameWidth + 0.625;
      }

      if (ctx.gblGlassType === "Two SS") {
        return ctx.gblSection === "Top"
          ? lclDoorWidth - 5.625
          : lclDoorWidth - 6.375;
      }

      return (
        lclDoorWidth -
        2 * (ctx.gblStandardDrillAt - lclGlassAdjust) -
        ctx.gblFrameWidth +
        0.625
      );

    case "Glass Comment":
      return lclGlassAdjust;
  }

  return 0;
}

/* ============================================================
   GetBuildNotes
============================================================ */
export function GetBuildNotes(ctx, fractions) {
  let lclNotes = "";

  /* ---------------------------------
     GLASS COMMENTS (Door only, not Two SS)
  --------------------------------- */
  if (ctx.gblProductType === "Door" && ctx.gblGlassType !== "Two SS") {
    let lclReturn = GetActualWidth(ctx, "Glass Comment", fractions);

    if (lclReturn === 9999) {
      lclNotes +=
        "Custom glass needed for this door.  See glass notes below.  ";
      lclReturn = ctx.gblStandardDrillAt;
    } else {
      const lclReturn1 = GetActualHeight(ctx, "Glass Comment", fractions);
      if (lclReturn1 === 9999) {
        lclNotes +=
          "Custom glass needed for this door.  See glass notes below.  ";
      }
    }

    lclNotes +=
      "Drill side holes at " +
      Dimensions("Width", lclReturn, 0, fractions) +
      ".  ";

    lclReturn = GetActualHeight(ctx, "Push Glass Down", fractions);
    if (lclReturn !== 0) {
      // VBA Str() adds leading space for positive numbers
      const vbaStr =
        lclReturn > 0 ? " " + String(lclReturn) : String(lclReturn);

      lclNotes +=
        'Do not drill bottom glass holes.  Push Glass down' +
        vbaStr +
        '".  ';
    }
  }

  /* ---------------------------------
     2 FRAME PRODUCT
  --------------------------------- */
  if (ctx.gblProductType === "2 Frame") {
    lclNotes +=
      "Build frame with gate opening on the " +
      ctx.gblOperator +
      " side.  ";

    lclNotes +=
      ctx.gblNewline +
      "Hole to Hole distance = " +
      Dimensions(
        "Width",
        GetSize(ctx, "Total Width", fractions) + 2,
        0,
        fractions
      ) +
      ".  ";

    lclNotes +=
      ctx.gblNewline +
      "Bottom to Hole distance = " +
      Dimensions(
        "Height",
        0,
        GetSize(ctx, "Total Height", fractions) + 1,
        fractions
      ) +
      ".  ";
  }

  /* ---------------------------------
     SIDELITE PRODUCTS
  --------------------------------- */
  if (
    ctx.gblProductType === "1 Sidelite" ||
    ctx.gblProductType === "2 Sidelite"
  ) {
    lclNotes +=
      "Build sidelite with door hinge on the " +
      ctx.gblHinge +
      " side.  ";
  }

  return lclNotes;
}

/* ============================================================
   GetLockSize
============================================================ */
export function GetLockSize(ctx, parmOption) {
  let result = 0;

  switch (ctx.gblLock) {
    case "Yale":
      if (parmOption === "Width") {
        result = 4.4375 - (ctx.gblFrameWidth / 2);
      } else if (parmOption === "Height Glass") {
        result = 7.75;
      } else {
        result = 7.5;
      }
      break;

    case "Yale 1":
      if (parmOption === "Width") {
        result = 4.4375 - (ctx.gblFrameWidth / 2);
      } else {
        result = 4.25;
      }
      break;

    case "Four Way":
      if (parmOption === "Width") {
        result = 4.1875 - (ctx.gblFrameWidth / 2);
      } else if (parmOption === "Height Glass") {
        result = 7.625;
      } else {
        result = 7.25;
      }
      break;

    case "Slim Line":
    case "Bee Line":
    case "None":
    case "Cut Out":
    case "Deluxe":
      if (parmOption === "Width") {
        result = 0;
      } else {
        result = 2;
      }
      break;

    default:
      // VBA MsgBox equivalent → hard failure is correct here
      throw new Error(
        "Error encountered in (GetLockSize) routine - " + ctx.gblLock
      );
  }

  return result;
}

/* ============================================================
   GetOptions / GetSide / GetSize
============================================================ */
export function GetOptions(ctx, parmOption, referenceCodes) {
  let tempvalue;
  let tempCutOut;

  switch (parmOption) {

    /* ------------------------------------
       HINGE
    ------------------------------------ */
    case "Hinge":
      switch (ctx.gblProductType) {
        case "Door":
          switch (ctx.gblType) {
            case "Patio":
            case "Single":
            case "1 Sidelite":
            case "2 Sidelite":
              ctx.gblRefHinge1 = "  " + ctx.gblHinge + " hinge";
              ctx.gblRefHinge2 = "  " + ctx.gblHinge + " hinge";
              return ctx.gblHinge;

            case "French":
              ctx.gblRefHinge1 = "  Left hinge";
              ctx.gblRefHinge2 = "  Right hinge";
              return ctx.gblCurrentSide;
          }
          break;

        case "Gate":
          return ctx.gblHinge;

        case "1 SideLite":
        case "1 Sidelite":
        case "2 Sidelite":
        case "1 Frame":
        case "2 Frame":
        case "Window":
          return "None";
      }
      break;

    /* ------------------------------------
       LOCK
    ------------------------------------ */
    case "Lock":
      tempvalue = GetOrderType(referenceCodes, "Lock", ctx.gblLock);

      switch (ctx.gblProductType) {
        case "Door":
          switch (ctx.gblType) {
            case "Single":
            case "1 Sidelite":
            case "2 Sidelite":
              break;

            case "French":
            case "Patio":
              if (!IsOperator(ctx)) {
                tempvalue = "None";
              }
              break;
          }
          break;

        case "Gate":
          break;

        case "1 SideLite":
        case "1 Sidelite":
        case "2 Sidelite":
        case "1 Frame":
        case "2 Frame":
        case "Window":
          tempvalue = "None";
          break;
      }

      if (ctx.gblRefLock1 === "") {
        if (ctx.gblType === "French") {
          tempCutOut = " with Cut-Out";
        } else {
          tempCutOut = ", No Cut-Out";
        }

        if (tempvalue === "None") {
          ctx.gblRefLock1 = ", No lock" + tempCutOut;
          ctx.gblRefLock2 = " with lock";
        } else {
          ctx.gblRefLock1 = " with lock";
          ctx.gblRefLock2 = ", No lock" + tempCutOut;
        }
      }

      return tempvalue;

    /* ------------------------------------
       OPERATOR
    ------------------------------------ */
    case "Operator":
      tempvalue = ctx.gblOperator;

      switch (ctx.gblProductType) {
        case "Door":
          switch (ctx.gblType) {
            case "Single":
            case "2 Sidelite":
              return " ";

            case "Patio":
              if (GetOptions(ctx, "Hinge", referenceCodes) === "Right") {
                return "Left operator";
              } else if (GetOptions(ctx, "Hinge", referenceCodes) === "Left") {
                return "Right operator";
              } else {
                return " ";
              }

            case "1 Sidelite":
            case "French":
              return tempvalue + " operator";
          }
          break;

        case "Gate":
          switch (ctx.gblType) {
            case "1 Gate":
              return " ";
            case "2 Gate":
              return tempvalue + " operator";
          }
          break;

        case "1 SideLite":
        case "1 Sidelite":
        case "2 Sidelite":
        case "1 Frame":
        case "2 Frame":
        case "Window":
          return " ";
      }
      break;
  }

  return "";
}

export function GetSide(ctx) {
  switch (String(ctx.gblRecordID)) {

    case "1":
    case "2":
      switch (ctx.gblType) {
        case "Single":
        case "1 Sidelite":
        case "2 Sidelite":
        case "1 Gate":
        case "2 Gate":
          return "Door";

        case "Patio":
        case "French":
          return ctx.gblCurrentSide + " Door";

        case "Window":
          return "Window";
      }
      break;

    case "3":
      switch (ctx.gblType) {
        case "1 Sidelite":
        case "2 Sidelite":
          return "Sidelite";

        case "1 Gate":
        case "2 Gate":
        case "Patio":
          return "Frame";

        case "Window":
          return "Window";
      }
      break;
  }

  return "";
}

/**
 * Conversion of VBA GetSize(parmOption)
 */
export function GetSize(ctx, parmOption, fractions) {
  let lclTotalWidth;
  let lclTotalHeight;
  let lclSizeDiff;

  switch (parmOption) {

    /* =========================
       TOTAL WIDTH
    ========================= */
    case "Total Width":
      switch (ctx.gblProductType) {
        case "Door":
          return GetActualWidth(ctx, "Full Width", fractions);

        case "Gate":
          switch (ctx.gblType) {
            case "1 Gate":
              return (
                ctx.gblTotalWidth -
                ctx.gblOpeningWidthReduce -
                ctx.gblFrameWidth
              );

            case "2 Gate":
              return (
                ctx.gblTotalWidth / 2 -
                ctx.gblOpeningWidthReduce -
                ctx.gblDoubleGateAdjust
              );
          }
          break;

        case "1 SideLite":
        case "1 Sidelite":
        case "2 Sidelite":
        case "1 Frame":
        case "2 Frame":
        case "Window":
          if (ctx.gblType === "Patio") {
            return ctx.gblTotalWidth + ctx.gblFrameWidth;
          } else {
            return ctx.gblTotalWidth;
          }

        default:
          throw new Error("Error encountered in GetSize (Total Width)");
      }
      break;

    /* =========================
       TOTAL HEIGHT
    ========================= */
    case "Total Height":
      switch (ctx.gblProductType) {
        case "Door":
          return GetActualHeight(ctx, "Full Height", fractions);

        case "Gate":
          return (
            GetSize(ctx, "Initial Height", fractions) -
            ctx.gblOpeningHeightReduce -
            ctx.gblFrameWidth / 2 -
            0.5
          );

        case "1 SideLite":
        case "1 Sidelite":
        case "2 Sidelite":
        case "1 Frame":
        case "2 Frame":
        case "Window":
          if (ctx.gblType === "Patio") {
            return ctx.gblTotalHeight + ctx.gblFrameWidth / 2;
          } else {
            return GetSize(ctx, "Initial Height", fractions);
          }

        default:
          throw new Error("Error encountered in GetSize (Total Height)");
      }

    /* =========================
       INITIAL WIDTH
    ========================= */
    case "Initial Width":
      lclTotalWidth = ctx.gblTotalWidth;

      // Patio width increase
      if (ctx.gblType === "Patio") {
        lclTotalWidth += ctx.gblPatioDoorIncrease;
      }

      // French width normalization
      if (ctx.gblType === "French") {
        if (Math.abs(lclTotalWidth - 72) <= Math.abs(lclTotalWidth - 64)) {
          lclSizeDiff = lclTotalWidth - 72;
        } else if (
          Math.abs(lclTotalWidth - 64) <= Math.abs(lclTotalWidth - 60)
        ) {
          lclSizeDiff = lclTotalWidth - 64;
        } else {
          lclSizeDiff = lclTotalWidth - 60;
        }

        if (
          lclSizeDiff === 0.75 ||
          (lclSizeDiff <= -0.25 && lclSizeDiff >= -0.75) ||
          lclSizeDiff === -1.25
        ) {
          lclTotalWidth += 0.25;
        }
      }

      // Divide for French / Patio
      if (ctx.gblType === "French" || ctx.gblType === "Patio") {
        lclTotalWidth = lclTotalWidth / 2;
      }

      // Sidelite uses door width
      if (
        (ctx.gblType === "1 Sidelite" || ctx.gblType === "2 Sidelite") &&
        ctx.gblProductType === "Door"
      ) {
        lclTotalWidth = ctx.gblDoorTotalWidth;
      }

      // Opening reduction
      lclTotalWidth -= ctx.gblOpeningWidthReduce;
      return lclTotalWidth;

    /* =========================
       INITIAL HEIGHT
    ========================= */
    case "Initial Height":
      lclTotalHeight = ctx.gblTotalHeight;

      if (
        (ctx.gblType === "1 Sidelite" || ctx.gblType === "2 Sidelite") &&
        ctx.gblProductType === "Door"
      ) {
        lclTotalHeight = ctx.gblDoorTotalHeight;
      }

      return lclTotalHeight;

    /* =========================
       DIMENSIONS
    ========================= */
    case "Dimensions":
      return Dimensions(
        "Both",
        GetSize(ctx, "Total Width", fractions),
        GetSize(ctx, "Total Height", fractions),
        fractions
      );

    /* =========================
       OPENING DIMENSIONS
    ========================= */
    case "Opening Dimensions":
      return Dimensions(
        "Both",
        ctx.gblTotalWidth,
        ctx.gblTotalHeight,
        fractions
      );

    /* =========================
       REFERENCE DIMENSION
    ========================= */
    case "Reference Dimension":
      switch (ctx.gblType) {
        case "Single":
        case "French":
        case "Patio":
        case "1 Sidelite":
        case "2 Sidelite":
          if (ctx.gblProductType === "Door") {
            if (ctx.gblCurrentSide === "Left") {
              return (
                Dimensions(
                  "Both",
                  ctx.gblRefWidth1 + ctx.gblOpeningWidthReduce,
                  ctx.gblTotalHeight,
                  fractions
                ) +
                ctx.gblRefHinge1 +
                ctx.gblRefLock1
              );
            } else {
              return (
                Dimensions(
                  "Both",
                  ctx.gblRefWidth2 + ctx.gblOpeningWidthReduce,
                  ctx.gblTotalHeight,
                  fractions
                ) +
                ctx.gblRefHinge2 +
                ctx.gblRefLock2
              );
            }
          }
          break;
      }
      return "";

    /* =========================
       HOLE TO HOLE
    ========================= */
    case "Hole to Hole Dimensions":
      return Dimensions(
        "Both",
        ctx.gblTotalWidth + 2 * ctx.gblHoletoHoleAdjust,
        ctx.gblTotalHeight + ctx.gblHoletoHoleAdjust,
        fractions
      );

    default:
      throw new Error("Error encountered in GetSize");
  }
}
