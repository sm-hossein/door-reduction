/**
 * calcDoorOutputShared.js
 * Shared helpers for door output exports.
 */

export function csvEscape(v) {
  if (v === null || v === undefined) return "";
  return String(v)
    .replace(/\r\n/g, " ")
    .replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .replace(/,/g, ";")
    .trim();
}

export function applySide(ctx, side) {
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
