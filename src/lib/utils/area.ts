/**
 * Ratiwal Dream Estates — Area Conversion Utilities
 * Canonical stored unit: Square Feet (sqFt).
 * Standard Conversion: 1 Square Yard = 9 Square Feet.
 */

export const SQ_FT_PER_SQ_YD = 9;

/**
 * Checks if a value is a valid positive area number.
 */
export function isValidArea(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && !Number.isNaN(value) && value > 0;
}

/**
 * Converts Square Yards to canonical Square Feet.
 */
export function sqYardsToSqFt(sqYards: number): number {
  if (!isValidArea(sqYards)) {
    throw new Error(`Invalid area in square yards: ${sqYards}. Must be a positive finite number.`);
  }
  return Math.round(sqYards * SQ_FT_PER_SQ_YD * 100) / 100;
}

/**
 * Converts canonical Square Feet to Square Yards for display or analytics.
 */
export function sqFtToSqYards(sqFt: number): number {
  if (!isValidArea(sqFt)) {
    throw new Error(`Invalid area in square feet: ${sqFt}. Must be a positive finite number.`);
  }
  return Math.round((sqFt / SQ_FT_PER_SQ_YD) * 100) / 100;
}
