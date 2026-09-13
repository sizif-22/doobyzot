import { ValidationError } from '../errors/DomainError';

/**
 * CardNumber value object.
 *
 * Invariants:
 *  - Exactly 16 numeric digits (spaces are stripped on construction).
 *  - The raw value is stored in a private class field and is NEVER returned
 *    by any public method; the default representation is always masked.
 *
 * The only way to retrieve the raw value is via `toRaw()`, which is
 * explicitly named to signal that it is for infrastructure persistence only.
 * Never call `toRaw()` outside of the persistence mapper.
 */
export class CardNumber {
  /** Raw 16-digit string. Never exposed through public interface. */
  readonly #raw: string;

  constructor(value: string) {
    const digits = value.replace(/[\s-]/g, '');
    if (!/^\d{16}$/.test(digits)) {
      throw new ValidationError(
        'Card number must be exactly 16 numeric digits',
      );
    }
    this.#raw = digits;
  }

  /**
   * Returns the masked representation: `**** **** **** XXXX`.
   * This is the ONLY safe way to display the card number in API responses.
   */
  masked(): string {
    return `**** **** **** ${this.#raw.slice(-4)}`;
  }

  equals(other: CardNumber): boolean {
    return this.#raw === other.#raw;
  }

  /**
   * ⚠️ INFRASTRUCTURE USE ONLY.
   * Returns the raw 16-digit string for database persistence.
   * Must NOT be called from domain entities, use cases, or controllers.
   */
  toRaw(): string {
    return this.#raw;
  }
}
