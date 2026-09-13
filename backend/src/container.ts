/**
 * Composition Root — src/container.ts
 *
 * This is the ONLY file that imports both domain interfaces AND infrastructure
 * implementations. Everything else depends on abstractions.
 *
 * Wiring order: DB client → repositories → domain services → use cases → controllers
 *
 * DIP is enforced here: use cases receive repository interfaces;
 * the concrete Drizzle classes are only visible at this root.
 */

// ─── Infrastructure ──────────────────────────────────────────────────────────
import { db } from './infrastructure/db/drizzle';
import { DrizzleAccountRepository } from './infrastructure/repositories/DrizzleAccountRepository';
import { DrizzleWalletRepository } from './infrastructure/repositories/DrizzleWalletRepository';
import { DrizzleTransactionRepository } from './infrastructure/repositories/DrizzleTransactionRepository';

// ─── Domain Services ─────────────────────────────────────────────────────────
import {
  CategoryStrategyRegistry,
  DefaultCategoryStrategy,
} from './domain/services/CategoryStrategy';
import { AnalyticsCalculator } from './domain/services/AnalyticsCalculator';

// ─── Use Cases ───────────────────────────────────────────────────────────────
import { GetAccountOverview } from './application/use-cases/GetAccountOverview';
import { ListAccountWallets } from './application/use-cases/ListAccountWallets';
import { GetWalletById } from './application/use-cases/GetWalletById';
import { ListWalletTransactions } from './application/use-cases/ListWalletTransactions';
import { CreateTransaction } from './application/use-cases/CreateTransaction';
import { TransferBetweenWallets } from './application/use-cases/TransferBetweenWallets';
import { GetMonthlyAnalytics } from './application/use-cases/GetMonthlyAnalytics';

// ─── Controllers ─────────────────────────────────────────────────────────────
import { AccountController } from './presentation/controllers/AccountController';
import { WalletController } from './presentation/controllers/WalletController';
import { TransactionController } from './presentation/controllers/TransactionController';
import { AnalyticsController } from './presentation/controllers/AnalyticsController';

// ═════════════════════════════════════════════════════════════════════════════
// 1. Repositories
// ═════════════════════════════════════════════════════════════════════════════

const accountRepository = new DrizzleAccountRepository(db);
const walletRepository = new DrizzleWalletRepository(db);
const transactionRepository = new DrizzleTransactionRepository(db);

// ═════════════════════════════════════════════════════════════════════════════
// 2. Domain Services
//
// OCP: Register additional category strategies here without modifying
//      AnalyticsCalculator. Example:
//        registry.register(new FoodCategoryStrategy());
//        registry.register(new TransportCategoryStrategy());
// ═════════════════════════════════════════════════════════════════════════════

const categoryRegistry = new CategoryStrategyRegistry(new DefaultCategoryStrategy());
// ↓ Add specialised strategies here as needed (no code changes elsewhere):
// categoryRegistry.register(new FoodCategoryStrategy());
// categoryRegistry.register(new SubscriptionCategoryStrategy());

const analyticsCalculator = new AnalyticsCalculator(categoryRegistry);

// ═════════════════════════════════════════════════════════════════════════════
// 3. Use Cases
// ═════════════════════════════════════════════════════════════════════════════

const getAccountOverview = new GetAccountOverview(accountRepository, transactionRepository);
const listAccountWallets = new ListAccountWallets(
  accountRepository,
  walletRepository,
  transactionRepository,
);
const getWalletById = new GetWalletById(walletRepository, transactionRepository);
const listWalletTransactions = new ListWalletTransactions(walletRepository, transactionRepository);
const createTransaction = new CreateTransaction(walletRepository, transactionRepository);
const transferBetweenWallets = new TransferBetweenWallets(walletRepository, transactionRepository);
const getMonthlyAnalytics = new GetMonthlyAnalytics(
  accountRepository,
  transactionRepository,
  analyticsCalculator,
);

// ═════════════════════════════════════════════════════════════════════════════
// 4. Controllers
// ═════════════════════════════════════════════════════════════════════════════

export const accountController = new AccountController(getAccountOverview, listAccountWallets);
export const walletController = new WalletController(getWalletById, listWalletTransactions);
export const transactionController = new TransactionController(
  createTransaction,
  transferBetweenWallets,
);
export const analyticsController = new AnalyticsController(getMonthlyAnalytics);
