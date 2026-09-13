import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';

// Controllers (wired in the composition root)
import {
  accountController,
  walletController,
  transactionController,
  analyticsController,
} from './container';

// Route factories
import { createAccountRoutes } from './presentation/routes/accountRoutes';
import { createWalletRoutes } from './presentation/routes/walletRoutes';
import { createTransactionRoutes } from './presentation/routes/transactionRoutes';
import { createAnalyticsRoutes } from './presentation/routes/analyticsRoutes';

// Domain errors for the global error handler
import {
  NotFoundError,
  ValidationError,
  InsufficientFundsError,
  WalletInactiveError,
  DomainError,
} from './domain/errors/DomainError';

const PORT = parseInt(process.env['PORT'] ?? '3000', 10);

const app = new Elysia()
  // ─── Middleware ───────────────────────────────────────────────────────────
  .use(cors())
  .use(
    swagger({
      path: '/swagger',
      documentation: {
        info: {
          title: 'Doobyzot API',
          version: '1.0.0',
          description: 'Clean Architecture Personal Finance API',
        },
      },
    }),
  )

  // ─── Global error handler ─────────────────────────────────────────────────
  .onError(({ error, set }) => {
    if (error instanceof NotFoundError) {
      set.status = 404;
      return { error: error.message, code: 'NOT_FOUND' };
    }
    if (error instanceof InsufficientFundsError) {
      set.status = 422;
      return { error: error.message, code: 'INSUFFICIENT_FUNDS' };
    }
    if (error instanceof WalletInactiveError) {
      set.status = 422;
      return { error: error.message, code: 'WALLET_INACTIVE' };
    }
    if (error instanceof ValidationError) {
      set.status = 400;
      return { error: error.message, code: 'VALIDATION_ERROR' };
    }
    if (error instanceof DomainError) {
      set.status = 400;
      return { error: error.message, code: 'DOMAIN_ERROR' };
    }

    // Elysia validation errors (error may not be a standard Error instance)
    if (error instanceof Error && error.message === 'Validation Error') {
      set.status = 400;
      return { error: 'Invalid request parameters', code: 'INVALID_INPUT' };
    }

    console.error('[Unhandled Error]', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    set.status = 500;
    return { error: 'Internal server error', code: 'INTERNAL_ERROR', details: error, message: error instanceof Error ? error.message : undefined };
  })

  // ─── Health check ─────────────────────────────────────────────────────────
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  // ─── API v1 routes ────────────────────────────────────────────────────────
  .group('/api/v1', (app) =>
    app
      .use(createAccountRoutes(accountController))
      .use(createWalletRoutes(walletController))
      .use(createTransactionRoutes(transactionController))
      .use(createAnalyticsRoutes(analyticsController)),
  )

  .listen(PORT);

console.log(`🚀 Doobyzot API running at http://localhost:${PORT}`);
console.log(`   Health:  http://localhost:${PORT}/health`);
console.log(`   API:     http://localhost:${PORT}/api/v1`);
console.log(`   Swagger: http://localhost:${PORT}/swagger`);

export type App = typeof app;
