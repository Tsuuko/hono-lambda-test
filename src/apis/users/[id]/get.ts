import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { handle } from 'hono/aws-lambda';

const userParamSchema = z.object({
  id: z.string().min(1),
});

export const usersByIdGetApp = new Hono()
  // GET /users/:id - Get specific user
  .get('/:id', zValidator('param', userParamSchema), (c) => {
    const { id } = c.req.valid('param');

    const user = {
      id,
      createdAt: '2025-01-01T00:00:00Z',
    };

    return c.json({ user });
  });

// Lambda handler for API Gateway
export const handler = handle(usersByIdGetApp);
