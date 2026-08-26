/**
 * @file money.ts
 * @description Ratiwal Dream Estates — Authoritative Minor-Unit Monetary Arithmetic & Allocation Engine.
 * 
 * Strict integer arithmetic (e.g. Paise for INR, Cents for USD).
 * Eliminates JavaScript floating-point inaccuracies and rounding drift.
 */

export class MoneyUtils {
  /**
   * Validates whether a value is a valid non-negative integer minor unit.
   */
  public static isValidMinorUnit(val: unknown): val is number {
    return (
      typeof val === "number" &&
      Number.isFinite(val) &&
      Number.isSafeInteger(val) &&
      val >= 0
    );
  }

  /**
   * Asserts that a value is a valid non-negative safe integer minor unit.
   */
  public static assertValidMinorUnit(val: unknown, label: string = "Amount"): asserts val is number {
    if (!this.isValidMinorUnit(val)) {
      throw new Error(
        `INVALID_MONETARY_VALUE: ${label} must be a non-negative safe integer minor unit (received: ${val}).`
      );
    }
  }

  /**
   * Safe addition of two non-negative minor unit amounts.
   */
  public static add(aPaise: number, bPaise: number): number {
    this.assertValidMinorUnit(aPaise, "Operand A");
    this.assertValidMinorUnit(bPaise, "Operand B");
    const sum = aPaise + bPaise;
    if (!Number.isSafeInteger(sum)) {
      throw new Error(`OVERFLOW: Sum (${sum}) exceeds JavaScript Number.MAX_SAFE_INTEGER.`);
    }
    return sum;
  }

  /**
   * Safe subtraction of two non-negative minor unit amounts (a - b).
   * Ensures result does not drop below zero unless allowNegative is explicitly set.
   */
  public static subtract(aPaise: number, bPaise: number, allowNegative: boolean = false): number {
    this.assertValidMinorUnit(aPaise, "Minuend");
    this.assertValidMinorUnit(bPaise, "Subtrahend");
    const result = aPaise - bPaise;
    if (!allowNegative && result < 0) {
      throw new Error(`UNDERFLOW: Subtraction result (${result}) cannot be negative.`);
    }
    if (!Number.isSafeInteger(result)) {
      throw new Error(`OVERFLOW: Subtraction result (${result}) exceeds safe integer limits.`);
    }
    return result;
  }

  /**
   * Calculates a percentage of a minor-unit amount using integer arithmetic with half-up rounding.
   * e.g. 10% of 1000 paise = 100 paise.
   */
  public static percentageOf(amountPaise: number, percentage: number): number {
    this.assertValidMinorUnit(amountPaise, "Base amount");
    if (typeof percentage !== "number" || !Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
      throw new Error(`INVALID_PERCENTAGE: Percentage must be between 0 and 100 (received: ${percentage}).`);
    }
    // Multiply first to preserve precision, then divide by 100 with Math.round
    const result = Math.round((amountPaise * percentage) / 100);
    this.assertValidMinorUnit(result, "Calculated percentage amount");
    return result;
  }

  /**
   * Converts major unit (e.g. Rupees) to minor unit (e.g. Paise).
   * 1 INR = 100 Paise.
   */
  public static majorToMinor(major: number, decimalPlaces: number = 2): number {
    if (typeof major !== "number" || !Number.isFinite(major) || major < 0) {
      throw new Error(`INVALID_MAJOR_AMOUNT: Must be a non-negative finite number (received: ${major}).`);
    }
    const factor = Math.pow(10, decimalPlaces);
    const minor = Math.round(major * factor);
    this.assertValidMinorUnit(minor, "Converted minor unit");
    return minor;
  }

  public static toMinorUnits(major: number, decimalPlaces: number = 2): number {
    return this.majorToMinor(major, decimalPlaces);
  }

  /**
   * Converts minor unit (e.g. Paise) to major unit (e.g. Rupees).
   */
  public static minorToMajor(minor: number, decimalPlaces: number = 2): number {
    this.assertValidMinorUnit(minor, "Minor unit");
    const factor = Math.pow(10, decimalPlaces);
    return minor / factor;
  }

  public static toMajorUnits(minor: number, decimalPlaces: number = 2): number {
    return this.minorToMajor(minor, decimalPlaces);
  }

  public static formatINR(minorAmount: number, options?: { compact?: boolean; exactDecimals?: boolean }): string {
    return this.format(minorAmount, "INR", options);
  }

  /**
   * Formats minor units into an institutional display string.
   * Supports Indian numbering format (Crores/Lakhs for large amounts, standard formatted currency for exact receipts).
   */
  public static format(
    minorAmount: number,
    currency: string = "INR",
    options: { compact?: boolean; exactDecimals?: boolean } = {}
  ): string {
    if (!this.isValidMinorUnit(minorAmount)) {
      return "—";
    }

    const major = this.minorToMajor(minorAmount);

    if (currency === "INR" && options.compact) {
      if (major >= 10000000) {
        const crores = major / 10000000;
        return `₹${parseFloat(crores.toFixed(2))} Cr`;
      }
      if (major >= 100000) {
        const lakhs = major / 100000;
        return `₹${parseFloat(lakhs.toFixed(2))} Lakhs`;
      }
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      minimumFractionDigits: options.exactDecimals ? 2 : (major % 1 === 0 ? 0 : 2),
      maximumFractionDigits: 2,
    }).format(major);
  }

  /**
   * Distributes a total amount across multiple weight ratios without losing a single minor unit to rounding.
   * Uses the Largest Remainder Method (Hamilton-Hare) for exact allocation.
   */
  public static distribute(totalPaise: number, ratios: number[]): number[] {
    this.assertValidMinorUnit(totalPaise, "Total distribution amount");
    if (!Array.isArray(ratios) || ratios.length === 0) {
      throw new Error("INVALID_RATIOS: Ratios array cannot be empty.");
    }

    const ratioSum = ratios.reduce((acc, r) => acc + r, 0);
    if (ratioSum <= 0) {
      throw new Error("INVALID_RATIOS: Sum of ratios must be greater than zero.");
    }

    const rawShares: number[] = [];
    const floorShares: number[] = [];
    const remainders: Array<{ index: number; remainder: number }> = [];

    let allocatedSum = 0;

    for (let i = 0; i < ratios.length; i++) {
      const share = (totalPaise * ratios[i]) / ratioSum;
      rawShares.push(share);
      const floor = Math.floor(share);
      floorShares.push(floor);
      allocatedSum += floor;
      remainders.push({ index: i, remainder: share - floor });
    }

    let unassignedUnits = totalPaise - allocatedSum;

    // Sort descending by largest remainder
    remainders.sort((a, b) => b.remainder - a.remainder);

    for (let i = 0; i < unassignedUnits; i++) {
      const targetIndex = remainders[i].index;
      floorShares[targetIndex] += 1;
    }

    // Verify exact sum invariant
    const finalSum = floorShares.reduce((acc, s) => acc + s, 0);
    if (finalSum !== totalPaise) {
      throw new Error(`ALLOCATION_INVARIANT_FAILED: Allocated sum (${finalSum}) does not match total (${totalPaise}).`);
    }

    return floorShares;
  }
}
