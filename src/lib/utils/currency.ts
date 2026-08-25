/**
 * Ratiwal Dream Estates — Currency & Monetary Utilities
 * Strict integer paise storage to avoid floating-point inaccuracies.
 */

/**
 * Checks if a value is a valid non-negative integer paise representation.
 */
export function isValidPaise(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isSafeInteger(value) &&
    value >= 0
  );
}

/**
 * Converts INR Rupees into integer Paise (1 INR = 100 Paise).
 * Throws an error if input is negative or not a finite number.
 */
export function rupeesToPaise(rupees: number): number {
  if (typeof rupees !== "number" || !Number.isFinite(rupees) || rupees < 0) {
    throw new Error(`Invalid rupee amount: ${rupees}. Must be a non-negative finite number.`);
  }

  const paise = Math.round(rupees * 100);
  if (!Number.isSafeInteger(paise)) {
    throw new Error(`Rupee amount ${rupees} exceeds safe integer limit when converted to paise.`);
  }

  return paise;
}

/**
 * Converts integer Paise into INR Rupees.
 */
export function paiseToRupees(paise: number): number {
  if (!isValidPaise(paise)) {
    throw new Error(`Invalid paise amount: ${paise}. Must be a non-negative safe integer.`);
  }

  return paise / 100;
}

/**
 * Formats integer Paise into Indian Rupee display string (e.g. ₹28.5 Lakhs or ₹1,50,000).
 */
export function formatPaiseToRupeeString(paise: number): string {
  if (!isValidPaise(paise)) {
    return "Price on Request";
  }

  const rupees = paiseToRupees(paise);

  if (rupees >= 10000000) {
    const crores = rupees / 10000000;
    const formatted = parseFloat(crores.toFixed(2));
    return `₹${formatted} Cr`;
  }
  if (rupees >= 100000) {
    const lakhs = rupees / 100000;
    const formatted = parseFloat(lakhs.toFixed(2));
    return `₹${formatted} Lakhs`;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}
