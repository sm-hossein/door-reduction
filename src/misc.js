/**
 * misc.js
 * Conversion of Misc.bas
 *
 * Contains small helper functions and state logic
 * that depend on the global context (ctx).
 */

/**
 * Replacement for GetTitle()
 */
export function GetTitle(ctx) {
  return ctx.gblTitle;
}

/**
 * Replacement for IsOperator()
 *
 * Determines whether the current door is the operator door.
 */
export function IsOperator(ctx) {
  switch (ctx.gblType) {
    case "1 Gate":
    case "Single":
      return true;

    case "Patio":
      // In VBA:
      // If gblCurrentSide = gblHinge Then IsOperator = False Else True
      return ctx.gblCurrentSide !== ctx.gblHinge;

    default:
      if (
        (ctx.gblOperator === "Left" && ctx.gblCurrentSide === "Left") ||
        (ctx.gblOperator === "Right" && ctx.gblCurrentSide === "Right")
      ) {
        return true;
      }
      return false;
  }
}

/**
 * Replacement for SetCutSheet()
 *
 * UI-related logic removed.
 * Only updates ctx state, which is what backend needs.
 */
export function SetCutSheet(ctx, parmOption) {
  ctx.gblRecordID = parmOption;

  switch (parmOption) {
    case "1":
      ctx.gblCurrentSide = "Left";
      break;

    case "2":
      ctx.gblCurrentSide = "Right";
      break;

    case "3":
      ctx.gblCurrentSide = "Left";
      break;
  }
}

/**
 * Replacement for SetPrintCutSheet()
 *
 * Same as SetCutSheet, without any UI logic.
 */
export function SetPrintCutSheet(ctx, parmOption) {
  ctx.gblRecordID = parmOption;

  switch (parmOption) {
    case "1":
      ctx.gblCurrentSide = "Left";
      break;

    case "2":
      ctx.gblCurrentSide = "Right";
      break;

    case "3":
      ctx.gblCurrentSide = "Left";
      break;
  }
}
