import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { createWalletRoutes } from './src/presentation/routes/walletRoutes';
import { createTransactionRoutes } from './src/presentation/routes/transactionRoutes';
import { createAccountRoutes } from './src/presentation/routes/accountRoutes';
import { createAnalyticsRoutes } from './src/presentation/routes/analyticsRoutes';

const app = new Elysia()
  .use(swagger())
  .use(createAccountRoutes({} as any))
  .use(createWalletRoutes({} as any))
  .use(createTransactionRoutes({} as any))
  .use(createAnalyticsRoutes({} as any));

app.handle(new Request('http://localhost/swagger/json'))
  .then(async (res) => {
    if (!res.ok) {
      console.error(await res.text());
    } else {
      console.log('Swagger OK');
    }
  })
  .catch(e => console.error(e));
