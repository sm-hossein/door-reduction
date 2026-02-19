/**
 * conversions.js
 * Conversion of Conversions.bas
 *
 * Requires:
 * - Fractions table loaded as an array of objects
 */

/**
 * Replacement for Dimensions()
 */
export function Dimensions(parmOption, parmWidth, parmHeight, fractions) {
  switch (parmOption) {
    case "Width":
      return buildDimension(parmWidth, fractions);

    case "Height":
      return buildDimension(parmHeight, fractions);

    case "Both":
      return (
        buildDimension(parmWidth, fractions) +
        "  x  " +
        buildDimension(parmHeight, fractions)
      );

    default:
      return "";
  }
}

/**
 * Helper that mirrors the VBA IIf/Int logic
 */
function buildDimension(value, fractions) {
  const intPart = Math.trunc(value);
  const fracPart = value - intPart;

  let result = "";

  if (intPart !== 0) {
    result += intPart;
  }

  if (fracPart !== 0) {
    const fractionText = IntToFraction(fracPart, fractions);
    if (fractionText) {
      if (intPart !== 0) {
        result += " - ";
      }
      result += fractionText;
    }
  }

  return result;
}

/**
 * Replacement for FractionToInt()
 */
export function FractionToInt(parmFraction, fractions) {
  const rec = fractions.find(
    f =>
      String(f.Description).toLowerCase() ===
      String(parmFraction).toLowerCase()
  );

  return rec ? Number(rec.Decimal) : 0;
}

/**
 * Replacement for IntToFraction()
 */
export function IntToFraction(parmInt, fractions) {
  const rec = fractions.find(
    f => Number(f.Decimal) === Number(parmInt)
  );

  return rec ? rec.Description : "";
}

/**
 * Empty Init() from VBA (not required in Node)
 */
export function Init() {
  // intentionally empty
}
