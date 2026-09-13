import { Account } from '@domain/entities/Account';
import type { CardWallet } from '@domain/entities/CardWallet';
import type { AccountRow } from '../db/schema';

/**
 * Maps between DB rows and Account domain entities.
 * Wallets are passed in separately (from a join or sub-query) and
 * assembled here to form the aggregate.
 */
export class AccountPersistenceMapper {
  static toDomain(row: AccountRow, wallets: CardWallet[]): Account {
    return new Account({
      id: row.id,
      ownerName: row.ownerName,
      wallets,
      // Transactions are NOT pre-loaded by default — use cases load them separately
    });
  }

  static toPersistence(entity: Account): Omit<AccountRow, 'createdAt' | 'updatedAt'> {
    return {
      id: entity.id,
      ownerName: entity.ownerName,
    };
  }
}
