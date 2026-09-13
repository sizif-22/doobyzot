import { pgTable, uuid, varchar, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const walletTypeEnum = pgEnum('wallet_type', ['visa', 'mastercard', 'other']);
export const transactionTypeEnum = pgEnum('transaction_type', ['income', 'outcome']);

// ─── Tables ──────────────────────────────────────────────────────────────────

/**
 * Persistence schema. Intentionally separate from domain entities.
 * Amounts are stored as integer minor-units (cents) to match the Money VO.
 * Card numbers are stored as plain varchar — masked only at the domain boundary.
 */
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerName: varchar('owner_name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const cardWallets = pgTable('card_wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 255 }).notNull(),
  /** Raw 16-digit card number — never returned by API responses. */
  cardNumber: varchar('card_number', { length: 16 }).notNull(),
  /** Balance in minor units (cents). */
  balanceMinor: integer('balance_minor').notNull().default(0),
  /** Monthly spending limit in minor units. 0 = no limit. */
  monthlyLimitMinor: integer('monthly_limit_minor').notNull().default(0),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  isActive: boolean('is_active').notNull().default(true),
  type: walletTypeEnum('type').notNull().default('other'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletId: uuid('wallet_id')
    .notNull()
    .references(() => cardWallets.id, { onDelete: 'cascade' }),
  /** Denormalised accountId for efficient account-level queries. */
  accountId: uuid('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  /** Amount in minor units (cents). Always positive; type field signals direction. */
  amountMinor: integer('amount_minor').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  date: timestamp('date', { withTimezone: true }).notNull(),
  type: transactionTypeEnum('type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Relations (for Drizzle query builder) ────────────────────────────────────

export const accountRelations = relations(accounts, ({ many }) => ({
  wallets: many(cardWallets),
  transactions: many(transactions),
}));

export const cardWalletRelations = relations(cardWallets, ({ one, many }) => ({
  account: one(accounts, { fields: [cardWallets.accountId], references: [accounts.id] }),
  transactions: many(transactions),
}));

export const transactionRelations = relations(transactions, ({ one }) => ({
  wallet: one(cardWallets, { fields: [transactions.walletId], references: [cardWallets.id] }),
  account: one(accounts, { fields: [transactions.accountId], references: [accounts.id] }),
}));

// ─── Row types (inferred from schema) ────────────────────────────────────────

export type AccountRow = typeof accounts.$inferSelect;
export type CardWalletRow = typeof cardWallets.$inferSelect;
export type TransactionRow = typeof transactions.$inferSelect;
