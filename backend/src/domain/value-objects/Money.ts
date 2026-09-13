import { ValidationError } from '../errors/DomainError';

/**
 * Immutable money value object.
 *
 * Stores amounts as integer minor-units (cents) to prevent floating-point bugs.
 * Example: $10.99 is stored as 1099.
 *
 * All arithmetic returns a new Money instance; the original is never mutated.
 */
export class Money {
  readonly #amountMinor: number; // always an integer ≥ 0
  readonly #currency: string; // ISO 4217, normalised to uppercase

  private constructor(amountMinor: number, currency: string) {
    if (!Number.isInteger(amountMinor)) {
      throw new ValidationError(
        `Amount must be an integer in minor units, received: ${amountMinor}`,
      );
    }
    if (amountMinor < 0) {
      throw new ValidationError('Money amount cannot be negative');
    }
    this.#amountMinor = amountMinor;
    this.#currency = currency.toUpperCase();
  }

  // ─── Factory methods ────────────────────────────────────────────────────────

  /**
   * Create from a decimal major-unit value (e.g. 10.99 → 1099 cents).
   * Rounds to the nearest minor unit to absorb floating-point noise.
   */
  static fromMajorUnits(amount: number, currency: string): Money {
    return new Money(Math.round(amount * 100), currency);
  }

  /** Create from an already-integer minor-unit value (e.g. from DB column). */
  static fromMinorUnits(amountMinor: number, currency: string): Money {
    return new Money(amountMinor, currency);
  }

  static zero(currency: string): Money {
    return new Money(0, currency);
  }

  // ─── Accessors ──────────────────────────────────────────────────────────────

  /** Amount in major units (e.g. 10.99). Suitable for display/serialisation. */
  get amount(): number {
    return this.#amountMinor / 100;
  }

  get currency(): string {
    return this.#currency;
  }

  /** Raw integer in minor units — use only for persistence and arithmetic. */
  toMinorUnits(): number {
    return this.#amountMinor;
  }

  // ─── Arithmetic ─────────────────────────────────────────────────────────────

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.#amountMinor + other.#amountMinor, this.#currency);
  }

  /**
   * Subtracts `other` from this. Throws ValidationError if the result is negative.
   * Callers responsible for checking sufficiency first via isGreaterThanOrEqual.
   */
  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = this.#amountMinor - other.#amountMinor;
    if (result < 0) {
      throw new ValidationError('Subtraction would result in a negative amount');
    }
    return new Money(result, this.#currency);
  }

  // ─── Comparisons ────────────────────────────────────────────────────────────

  equals(other: Money): boolean {
    return this.#amountMinor === other.#amountMinor && this.#currency === other.#currency;
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.#amountMinor > other.#amountMinor;
  }

  isGreaterThanOrEqual(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.#amountMinor >= other.#amountMinor;
  }

  isLessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.#amountMinor < other.#amountMinor;
  }

  isZero(): boolean {
    return this.#amountMinor === 0;
  }

  /**
   * Returns what percentage of `total` this amount represents.
   * Returns 0 if total is zero.
   */
  percentageOf(total: Money): number {
    this.assertSameCurrency(total);
    if (total.#amountMinor === 0) return 0;
    return (this.#amountMinor / total.#amountMinor) * 100;
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private assertSameCurrency(other: Money): void {
    if (this.#currency !== other.#currency) {
      throw new ValidationError(
        `Currency mismatch: cannot operate on ${this.#currency} and ${other.#currency}`,
      );
    }
  }
}
