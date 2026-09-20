/**
 * Seed script — populates the DB with one account, wallets, and transactions
 * so the Flutter app has real data to display.
 *
 * Run: bun run seed
 */
import process from 'node:process';
import { db } from './src/infrastructure/db/drizzle';
import { accounts, cardWallets, transactions } from './src/infrastructure/db/schema';

async function main() {
  console.log('🌱  Seeding database…');

  // ─── Account ──────────────────────────────────────────────────────────────
  const [account] = await db
    .insert(accounts)
    .values({ ownerName: 'Sherif Lotfy' })
    .onConflictDoNothing()
    .returning();

  if (!account) {
    const existing = await db.select().from(accounts).limit(1);
    if (existing.length === 0) throw new Error('Could not insert account');
    console.log('ℹ️   Account already exists — skipping insert.');
    console.log(`\n✅  Account ID: ${existing[0]!.id}`);
    console.log('\nPaste this into frontend/lib/app.dart as kDefaultAccountId');
    return;
  }

  console.log(`✅  Created account: ${account.id}`);

  // ─── Wallets ──────────────────────────────────────────────────────────────
  const [main, savings] = await db
    .insert(cardWallets)
    .values([
      {
        accountId: account.id,
        label: 'Main Card',
        cardNumber: '4111111111114290',
        balanceMinor: 1245080,   // $12,450.80
        monthlyLimitMinor: 5000000, // $50,000
        currency: 'USD',
        isActive: true,
        type: 'visa',
      },
      {
        accountId: account.id,
        label: 'Savings Card',
        cardNumber: '5500005555555559',
        balanceMinor: 3040320,   // $30,403.20
        monthlyLimitMinor: 2000000, // $20,000
        currency: 'USD',
        isActive: true,
        type: 'mastercard',
      },
    ])
    .returning();

  console.log(`✅  Created wallets: ${main!.id}, ${savings!.id}`);

  // ─── Transactions ─────────────────────────────────────────────────────────
  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);

  await db.insert(transactions).values([
    // Outcomes
    {
      walletId: main!.id, accountId: account.id,
      title: 'Coffee', category: 'Food & Drink',
      amountMinor: 1250, currency: 'USD', date: daysAgo(0), type: 'outcome',
    },
    {
      walletId: main!.id, accountId: account.id,
      title: 'Uber', category: 'Transport',
      amountMinor: 2400, currency: 'USD', date: daysAgo(0), type: 'outcome',
    },
    {
      walletId: main!.id, accountId: account.id,
      title: 'Apple Store', category: 'Shopping',
      amountMinor: 12900, currency: 'USD', date: daysAgo(1), type: 'outcome',
    },
    {
      walletId: main!.id, accountId: account.id,
      title: 'Grocery Store', category: 'Food & Drink',
      amountMinor: 8750, currency: 'USD', date: daysAgo(2), type: 'outcome',
    },
    {
      walletId: main!.id, accountId: account.id,
      title: 'Netflix', category: 'Entertainment',
      amountMinor: 1599, currency: 'USD', date: daysAgo(3), type: 'outcome',
    },
    {
      walletId: main!.id, accountId: account.id,
      title: 'Electricity Bill', category: 'Housing',
      amountMinor: 9500, currency: 'USD', date: daysAgo(5), type: 'outcome',
    },
    {
      walletId: main!.id, accountId: account.id,
      title: 'Gym Membership', category: 'Health & Fitness',
      amountMinor: 4999, currency: 'USD', date: daysAgo(7), type: 'outcome',
    },
    // Income
    {
      walletId: main!.id, accountId: account.id,
      title: 'Payroll Deposit', category: 'Salary',
      amountMinor: 425000, currency: 'USD', date: daysAgo(1), type: 'income',
    },
    {
      walletId: savings!.id, accountId: account.id,
      title: 'Freelance Payment', category: 'Income',
      amountMinor: 75000, currency: 'USD', date: daysAgo(4), type: 'income',
    },
  ]);

  console.log('✅  Inserted 9 transactions');
  console.log('\n══════════════════════════════════════════════');
  console.log(`🔑  Account ID: ${account.id}`);
  console.log('══════════════════════════════════════════════');
  console.log('\nPaste this into frontend/lib/app.dart as kDefaultAccountId\n');
}

main().catch(console.error).finally(() => process.exit());
