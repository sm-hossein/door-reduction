/**
 * components.js
 * Conversion of Components.bas
 */

import {
  GetActualHeight,
  GetActualWidth,
  GetSize,
  GetLockSize,
  GetOptions
} from "./calculations.js";

import { Dimensions } from "./conversions.js";
import { IsOperator } from "./misc.js";
import { GetOrderType } from "./init.js";

/* -------------------------
   GetComponentDescription
------------------------- */

export function GetComponentDescription(
  ctx,
  parmDescription,
  parmGroup,
  parmCategory,
  parmSection,
  fractions,
  referenceCodes
) {
  // VBA: GetComponentDescription = parmDescription
  let result = parmDescription;

  switch (parmGroup) {
    /* =========================
       Case "Frame"
    ========================= */
    case "Frame":
      switch (parmCategory) {
        /* -------- Horz -------- */
        case "Horz":
          if (parmSection === "Bottom") {
            // lclCrossTube = GetActualHeight("Cross Tube")
            const lclCrossTube = GetActualHeight(
              ctx,
              "Cross Tube",
              fractions
            );

            switch (lclCrossTube) {
              case 1:
                result = ctx.gbl1x3CrossTube;
                ctx.gblNotes = "Use " + ctx.gbl1x3CrossTube + ".  ";
                break;

              case 2:
                result = ctx.gbl1x4CrossTube;
                ctx.gblNotes = "Use " + ctx.gbl1x4CrossTube + ".  ";
                break;
            }
          }
          break;

        /* -------- Lock Tube -------- */
        case "Lock Tube":
          result = ctx.gblLockTube;

          if (
            IsOperator(ctx) &&
            (ctx.gblProductType === "Door" ||
             ctx.gblProductType === "Gate")
          ) {
            result =
              parmDescription +
              " - " +
              GetOrderType(referenceCodes, "Lock", ctx.gblLock);
          }
          break;
      }
      break;

    /* =========================
       Case "Opening"
    ========================= */
    case "Opening":
      switch (parmCategory) {
        case "Z-Bar":
          // French + Astrical
          if (
            ctx.gblType === "French" &&
            parmDescription === "Astrical"
          ) {
            ctx.gblNotes = "Punch top down";
            result =
              parmDescription +
              " - " +
              GetOrderType(referenceCodes, "Lock", ctx.gblLock);
          }

          // Patio/French + Header
          if (
            (ctx.gblType === "Patio" ||
             ctx.gblType === "French") &&
            parmDescription === "Header"
          ) {
            ctx.gblNotes = "Punch 1 side only";
          }

          // Patio/Single/Sidelite + Jambs
          if (
            (
              ctx.gblType === "Patio" ||
              ctx.gblType === "Single" ||
              ctx.gblType === "1 Sidelite" ||
              ctx.gblType === "2 Sidelite"
            ) &&
            parmDescription === "Jambs"
          ) {
            if (ctx.gblHinge === "Right") {
              ctx.gblNotes =
                "Punch Left side top down.  " + ctx.gblNotes;
            } else {
              ctx.gblNotes =
                "Punch Right side top down.  " + ctx.gblNotes;
            }
          }
          break;
      }
      break;
  }
  // VBA: GetComponentDescription returned implicitly
  return result;
}

/* -------------------------
   GetComponentSection
------------------------- */
export function GetComponentSection(
  ctx,
  parmDescription,
  parmGroup,
  parmCategory,
  parmSection,
  referenceCodes
) {
  // Default behavior:
  // VBA: GetComponentSection = parmSection
  let result = parmSection;

  // If Side → Left/Right
  if (parmSection === "Side") {
    result = "Left/Right";
  }

  /* =========================
     DOOR / GATE
  ========================= */
  switch (ctx.gblProductType) {
    case "Door":
    case "Gate":
      switch (parmGroup) {
        case "Frame":
          switch (parmCategory) {
            // Hinge side
            case "Hinge":
              result = GetOptions(ctx, "Hinge", referenceCodes);
              break;

            // Lock tube = opposite of hinge
            case "Lock Tube":
              if (GetOptions(ctx, "Hinge", referenceCodes) === "Left") {
                result = "Right";
              } else {
                result = "Left";
              }
              break;
          }
          break;
      }
      break;

    /* =========================
       FRAMES / SIDELITES
    ========================= */
    case "1 Frame":
    case "2 Frame":
    case "1 Sidelite":
    case "2 Sidelite":
      switch (parmGroup) {
        case "Frame":
          switch (parmCategory) {
            case "Vert":
              switch (parmSection) {
                case "Side":
                  if (ctx.gblProductType !== "2 Sidelite") {
                    if (ctx.gblProductType === "1 Frame") {
                      if (ctx.gblHinge === "Right") {
                        ctx.gblNotes +=
                          "Add cut-out to left tube.  ";
                      } else {
                        ctx.gblNotes +=
                          "Add cut-out to right tube.  ";
                      }
                    } else {
                      if (ctx.gblOperator !== ctx.gblHinge) {
                        ctx.gblNotes +=
                          `Add cut-out to ${ctx.gblOperator} tube.  `;
                      }
                    }
                  }
                  break;

                case "Center":
                  if (ctx.gblProductType === "2 Sidelite") {
                    if (ctx.gblHinge === "Right") {
                      ctx.gblNotes +=
                        "Add cut-out to left center tube.  ";
                    } else {
                      ctx.gblNotes +=
                        "Add cut-out to right center tube.  ";
                    }
                  } else if (ctx.gblOperator === ctx.gblHinge) {
                    ctx.gblNotes +=
                      "Add cut-out to center tube.  ";
                  }
                  break;
              }
              break;
          }
          break;
      }
      break;
  }

  return result;
}

// GetComponentSize(parmDescription, parmGroup, parmCategory, parmSection)
// VBA -> JS conversion (line-by-line logic preserved as closely as practical).
// NOTE: This function intentionally calls other functions (GetSize, GetActualHeight,
// GetActualWidth, GetLockSize, GetOptions, IsOperator, Dimensions) but does NOT
// implement them here (per your request). :contentReference[oaicite:0]{index=0}
export function GetComponentSize(
  ctx,
  parmDescription,
  parmGroup,
  parmCategory,
  parmSection,
  componentSizeRules,
  fractions,
  referenceCodes
) {
  // Dim db As Database, tblGeneric As DAO.Recordset  (N/A in JS) :contentReference[oaicite:1]{index=1}

  // '*** Move to Global section :contentReference[oaicite:2]{index=2}
  ctx.gblExpanderWidthReduce = 0.125;
  ctx.gblGlassFrameAdjust = 0.75;
  ctx.gblSection = parmSection;

  // DAO table seek:
  // Set tblGeneric = db.OpenRecordset("Component Size Rules", dbOpenTable)
  // tblGeneric.Index = "Index1"
  // tblGeneric.Seek "=", gblProductType, parmGroup, parmCategory, parmSection :contentReference[oaicite:3]{index=3}
  //
  // JS equivalent: find the matching rule row.
  // IMPORTANT: trim() is required because your CSV loader preserved "\r" (e.g. "Std Width\r").
    // === LOOKUP RULE ===
  const ruleRow = componentSizeRules.find(
    r =>
      r["Product Type"] === ctx.gblProductType &&
      r["Group"] === parmGroup &&
      r["Category"] === parmCategory &&
      r["Section"] === parmSection
  );
  
  // If tblGeneric.NoMatch Then ... Exit Function :contentReference[oaicite:4]{index=4}
  if (!ruleRow) {
    return "";
  }

  // lclRule = tblGeneric("Sizing Rule") :contentReference[oaicite:5]{index=5}
  const lclRule = String(
    ruleRow["Sizing Rule"] === null || ruleRow["Sizing Rule"] === undefined
      ? ""
      : ruleRow["Sizing Rule"]
  ).trim();

  // Select Case lclRule ... :contentReference[oaicite:6]{index=6}
  switch (lclRule) {
    case "Std Height":
      return Dimensions("Height", 0, GetSize(ctx, "Total Height", fractions, referenceCodes), fractions);

    case "Std Center Height":
      return Dimensions(
        "Height",
        0,
        GetSize(ctx, "Total Height", fractions, referenceCodes) - (ctx.gblFrameWidth / 2),
        fractions
      );

    case "Std Full Height":
      return Dimensions(
        "Height",
        0,
        GetSize(ctx, "Total Height", fractions, referenceCodes) - ctx.gblFrameWidth,
        fractions
      );

    case "Std Lock Tube Height": {
      if (ctx.gblGlassType !== "One") {
        let lclHeightAbove;
        let lclHeightBelow;

        if (ctx.gblGlassType === "Two SS") {
          lclHeightAbove = Dimensions(
            "Height",
            0,
            GetActualHeight(ctx, "Top Picket", fractions, referenceCodes) + (ctx.gblFrameWidth / 2) - 0.25,
            fractions
          );
          lclHeightBelow = Dimensions(
            "Height",
            0,
            GetActualHeight(ctx, "Bottom Picket", fractions, referenceCodes) + (ctx.gblFrameWidth / 2) - 0.25,
            fractions
          );
        } else {
          lclHeightAbove = Dimensions(
            "Height",
            0,
            GetActualHeight(ctx, "Top Picket", fractions, referenceCodes) + (ctx.gblFrameWidth / 2),
            fractions
          );

          // gblTopPicketHeight = GetActualHeight("Top Picket") + (gblFrameWidth / 2) :contentReference[oaicite:7]{index=7}
          ctx.gblTopPicketHeight =
            GetActualHeight(ctx, "Top Picket", fractions, referenceCodes) + (ctx.gblFrameWidth / 2);

          lclHeightBelow = Dimensions(
            "Height",
            0,
            GetActualHeight(ctx, "Bottom Picket", fractions, referenceCodes) +
              (ctx.gblFrameWidth / 2) +
              GetActualHeight(ctx, "Cross Tube", fractions, referenceCodes),
            fractions
          );
        }

        if (IsOperator(ctx)) {
          // gblNotes = "Cut " & lclHeightAbove & """ above lock.  " ... :contentReference[oaicite:8]{index=8}
          ctx.gblNotes = `Cut ${lclHeightAbove}" above lock.  `;
          ctx.gblNotes = ctx.gblNotes + `Cut ${lclHeightBelow}" below lock.  `;
        } else {
          // NOTE: original VBA has a minor indentation oddity; preserve semantics. :contentReference[oaicite:9]{index=9}
          ctx.gblNotes = `Use ${ctx.gblLockTube}.  `;
          if (ctx.gblType === "French") {
            ctx.gblNotes = ctx.gblNotes + "Add cut-out to tube.  ";
          }
        }
      }

      return Dimensions(
        "Height",
        0,
        GetSize(ctx, "Total Height", fractions, referenceCodes),
        fractions
      );
    }

    case "Std Gate Lock Tube Height": {
      const lclHeight = Dimensions(
        "Height",
        0,
        (GetSize(ctx, "Total Height", fractions, referenceCodes) - GetLockSize(ctx, "Height")) / 2,
        fractions
      );
      ctx.gblNotes = `Cut ${lclHeight}" above lock.  `;
      ctx.gblNotes = ctx.gblNotes + `Cut ${lclHeight}" below lock.  `;
      return Dimensions(
        "Height",
        0,
        GetSize(ctx, "Total Height", fractions, referenceCodes),
        fractions
      );
    }

    case "Std Width":
    case "Std Frame Width":
      return Dimensions(
        "Width",
        GetSize(ctx, "Total Width", fractions, referenceCodes) - ctx.gblFrameWidth,
        0,
        fractions
      );

    case "Std 2 Frame Width":
      return Dimensions(
        "Width",
        (GetSize(ctx, "Total Width", fractions, referenceCodes) / 2) - (ctx.gblFrameWidth * 1.5) + ctx.gblDoubleGateAdjust,
        0,
        fractions
      );

    case "Std Sidelite Width":
      return Dimensions(
        "Width",
        ((GetSize(ctx, "Total Width", fractions, referenceCodes) - ctx.gblDoorTotalWidth) - (ctx.gblFrameWidth * 1.5)),
        0,
        fractions
      );

    case "Std 2 Sidelite Top Frame Width":
      return Dimensions(
        "Width",
        (((GetSize(ctx, "Total Width", fractions, referenceCodes) - ctx.gblDoorTotalWidth) / 2) - (ctx.gblFrameWidth / 2)),
        0,
        fractions
      );

    case "Std 2 Sidelite Center Width":
      return Dimensions("Width", ctx.gblDoorTotalWidth, 0, fractions);

    case "Std 2 Sidelite Width":
      return Dimensions(
        "Width",
        (((GetSize(ctx, "Total Width", fractions, referenceCodes) - ctx.gblDoorTotalWidth) / 2) - ctx.gblFrameWidth),
        0,
        fractions
      );

    case "Std Top Picket": {
      const lclHeight = GetActualHeight(ctx, "Top Picket", fractions, referenceCodes);
      return Dimensions("Height", 0, lclHeight, fractions);
    }

    case "Std Top Picket - Middle": {
      const lclHeight = GetActualHeight(ctx, "Top Picket", fractions, referenceCodes) - 4;
      return Dimensions("Height", 0, lclHeight, fractions);
    }

    case "Std Top Picket - Inside": {
      const lclHeight = GetActualHeight(ctx, "Top Picket", fractions, referenceCodes) - 7.125;
      return Dimensions("Height", 0, lclHeight, fractions);
    }

    case "Std Top Picket - Outside": {
      const lclHeight = GetActualHeight(ctx, "Top Picket", fractions, referenceCodes) - 9.25;
      return Dimensions("Height", 0, lclHeight, fractions);
    }

    case "Std Top Picket - SmFrz": {
      const lclHeight = GetActualHeight(ctx, "Top Picket", fractions, referenceCodes) - 5.25;
      return Dimensions("Height", 0, lclHeight, fractions);
    }

    case "Std Bottom Picket - SmFrz": {
      const lclHeight = GetActualHeight(ctx, "Bottom Picket", fractions, referenceCodes) - 5.25;
      return Dimensions("Height", 0, lclHeight, fractions);
    }

    case "Std Top Picket - StFrz": {
      const lclHeight = GetActualHeight(ctx, "Top Picket", fractions, referenceCodes) - (GetLockSize(ctx, "Height") - 1);
      return Dimensions("Height", 0, lclHeight, fractions);
    }

    case "Std Bottom Picket - StFrz": {
      const lclHeight = GetActualHeight(ctx, "Bottom Picket", fractions, referenceCodes) - (GetLockSize(ctx, "Height") - 1);
      return Dimensions("Height", 0, lclHeight, fractions);
    }

    case "Std Top Picket - 203O": {
      const lclHeight = GetActualHeight(ctx, "Top Picket", fractions, referenceCodes) - 8.5;
      return Dimensions("Height", 0, lclHeight, fractions);
    }

    case "Std Bottom Picket - 203O": {
      const lclHeight = GetActualHeight(ctx, "Bottom Picket", fractions, referenceCodes) - 8.5;
      return Dimensions("Height", 0, lclHeight, fractions);
    }

    case "Std Top Picket - 203I": {
      const lclHeight = GetActualHeight(ctx, "Top Picket", fractions, referenceCodes) - 4.1875;
      return Dimensions("Height", 0, lclHeight, fractions);
    }

    case "Std Bottom Picket - 203I": {
      const lclHeight = GetActualHeight(ctx, "Bottom Picket", fractions, referenceCodes) - 4.1875;
      return Dimensions("Height", 0, lclHeight, fractions);
    }

    case "Std Width - 203": {
      const lclWidth = 3;
      return Dimensions("Width", 0, lclWidth, fractions);
    }

    case "Std Top Picket - Sunrise": {
      let lclHeight = GetSize(ctx, "Total Width", fractions, referenceCodes) - ctx.gblFrameWidth;
      lclHeight = (lclHeight / 2) + 0.4375;
      return Dimensions("Height", 0, lclHeight, fractions);
    }

    case "Std Top Picket - Crowned": {
      const lclHeight = GetActualHeight(ctx, "Top Picket", fractions, referenceCodes) - 14.875;
      return Dimensions("Height", 0, lclHeight, fractions);
    }

    case "Std Bottom Picket": {
      const lclHeight = GetActualHeight(ctx, "Bottom Picket", fractions, referenceCodes);
      return Dimensions("Height", 0, lclHeight, fractions);
    }

    case "Std Center Picket": {
      const lclHeight = GetLockSize(ctx, "Height") - 2.0625;
      return Dimensions("Height", 0, lclHeight, fractions);
    }

    case "Std Sidelite Top Picket": {
      const lclHeight = ctx.gblTopPicketHeight + 0.25;
      return Dimensions("Height", 0, lclHeight, fractions);
    }

    case "Std Sidelite Bottom Picket": {
      const lclHeight =
        ctx.gblTotalHeight - (ctx.gblTopPicketHeight + ctx.gblFrameWidth + GetLockSize(ctx, "Height") + 0.25);
      return Dimensions("Height", 0, lclHeight, fractions);
    }

    case "Std Internal Center Width": {
      let lclWidth = GetSize(ctx, "Total Width", fractions, referenceCodes) - ctx.gblFrameWidth;
      if (GetOptions(ctx, "Lock", referenceCodes) !== "None") {
        lclWidth = lclWidth - GetLockSize(ctx, "Width");
      }
      return Dimensions("Width", lclWidth, 0, fractions);
    }

    case "Top Glass": {
      const lclWidth = GetActualWidth(ctx, "Glass", fractions, referenceCodes);
      if (ctx.gblGlassType !== "Two SS") {
        ctx.gblNotes =
          ctx.gblNotes +
          "Framed Size = " +
          Dimensions(
            "Both",
            lclWidth + ctx.gblGlassFrameAdjust,
            GetActualHeight(ctx, "Top Glass", fractions, referenceCodes) + ctx.gblGlassFrameAdjust,
            fractions
          );
      }
      return Dimensions("Both", lclWidth, GetActualHeight(ctx, "Top Glass", fractions, referenceCodes), fractions);
    }

    case "Bottom Glass": {
      const lclWidth = GetActualWidth(ctx, "Glass", fractions, referenceCodes);
      if (ctx.gblGlassType !== "Two SS") {
        ctx.gblNotes =
          ctx.gblNotes +
          "Framed Size = " +
          Dimensions(
            "Both",
            lclWidth + ctx.gblGlassFrameAdjust,
            GetActualHeight(ctx, "Bottom Glass", fractions, referenceCodes) + ctx.gblGlassFrameAdjust,
            fractions
          );
      }
      return Dimensions("Both", lclWidth, GetActualHeight(ctx, "Bottom Glass", fractions, referenceCodes), fractions);
    }

    case "Center Glass": {
      let lclWidth = GetActualWidth(ctx, "Glass", fractions, referenceCodes);
      if (GetOptions(ctx, "Lock", referenceCodes) !== "None") {
        lclWidth = lclWidth - 2.5;
      }
      ctx.gblNotes =
        ctx.gblNotes +
        "Framed Size = " +
        Dimensions("Both", lclWidth + ctx.gblGlassFrameAdjust, 5.5 + ctx.gblGlassFrameAdjust, fractions);
      return Dimensions("Both", lclWidth, 5.5, fractions);
    }

    case "Top Screen": {
      const lclWidth = GetActualWidth(ctx, "Screen", fractions, referenceCodes);
      return Dimensions(
        "Both",
        lclWidth + ctx.gblGlassFrameAdjust,
        GetActualHeight(ctx, "Top Screen", fractions, referenceCodes) + ctx.gblGlassFrameAdjust,
        fractions
      );
    }

    case "Bottom Screen": {
      const lclWidth = GetActualWidth(ctx, "Screen", fractions, referenceCodes);
      return Dimensions(
        "Both",
        lclWidth + ctx.gblGlassFrameAdjust,
        GetActualHeight(ctx, "Bottom Screen", fractions, referenceCodes) + ctx.gblGlassFrameAdjust,
        fractions
      );
    }

    case "Center Screen": {
      let lclWidth = GetActualWidth(ctx, "Screen", fractions, referenceCodes);
      if (GetOptions(ctx, "Lock", referenceCodes) !== "None") {
        lclWidth = lclWidth - 2.5;
      }
      return Dimensions("Both", lclWidth + ctx.gblGlassFrameAdjust, 5.5 + ctx.gblGlassFrameAdjust, fractions);
    }

    // '*** These rules apply to opening components :contentReference[oaicite:10]{index=10}
    case "Expander":
      return Dimensions(
        "Width",
        GetSize(ctx, "Total Width", fractions, referenceCodes) - ctx.gblExpanderWidthReduce,
        0,
        fractions
      );

    case "Jambs":
      if (GetSize(ctx, "Total Height", fractions, referenceCodes) <= 82) {
        return Dimensions("Height", 0, 85, fractions);
      } else {
        ctx.gblNotes = ctx.gblNotes + "Shop must punch.  ";
        return "";
      }

    case "Header":
      return Dimensions("Width", ctx.gblTotalWidth + 2, 0, fractions);

    case "Legs":
      return Dimensions("Width", ctx.gblTotalLegLength + 1, 0, fractions);

    // Case Else -> MsgBox "Undefined Component sizing rule - " & lclRule :contentReference[oaicite:11]{index=11}
    default:
      // closest analogue to MsgBox for dev:
      throw new Error(`Undefined Component sizing rule - ${lclRule}`);
  }
}
