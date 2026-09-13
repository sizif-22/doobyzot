/**
 * Base domain error. All business-rule violations throw a subclass of this.
 * Never import framework or infrastructure types here.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with id '${id}' not found`);
    this.name = 'NotFoundError';
  }
}

export class InsufficientFundsError extends DomainError {
  constructor() {
    super('Insufficient funds for this transaction');
    this.name = 'InsufficientFundsError';
  }
}

export class WalletInactiveError extends DomainError {
  constructor(walletId: string) {
    super(`Wallet '${walletId}' is inactive and cannot process transactions`);
    this.name = 'WalletInactiveError';
  }
}
