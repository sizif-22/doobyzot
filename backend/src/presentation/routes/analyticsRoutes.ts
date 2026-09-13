import { Elysia, t } from 'elysia';
import type { AnalyticsController } from '../controllers/AnalyticsController';

/**
 * Analytics route module.
 */
export function createAnalyticsRoutes(controller: AnalyticsController) {
  return new Elysia({ prefix: '/accounts' })
    .get(
      '/:id/analytics',
      ({ params, query }) => controller.getAnalytics(params.id, query.range ?? 'month'),
      {
        params: t.Object({ id: t.String({ minLength: 1 }) }),
        query: t.Object({
          range: t.Optional(
            t.Union([
              t.Literal('week'),
              t.Literal('month'),
              t.Literal('year'),
              t.Literal('all'),
            ]),
          ),
        }),
        detail: {
          summary: 'Get spending analytics for an account',
          tags: ['Analytics'],
        },
      },
    );
}
