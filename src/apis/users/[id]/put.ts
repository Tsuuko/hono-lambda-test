import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { handle } from 'hono/aws-lambda';

const userParamSchema = z.object({
  id: z.string().min(1),
});

export const usersByIdPutApp = new Hono()
  // PUT /users/:id - Update user
  .put('/users/:id', zValidator('param', userParamSchema), (c) => {
    const { id } = c.req.valid('param');

    const updatedUser = {
      id,
      updatedAt: new Date().toISOString(),
    };

    return c.json({ user: updatedUser });
  });

// Lambda handler for API Gateway
export const handler = handle(usersByIdPutApp);
