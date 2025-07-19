import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { handle } from 'hono/aws-lambda';

const userParamSchema = z.object({
  id: z.string().min(1),
});

export const usersByIdDeleteApp = new Hono()
  // DELETE /users/:id - Delete user
  .delete('/users/:id', zValidator('param', userParamSchema), (c) => {
    const { id } = c.req.valid('param');

    return c.json({ message: `User ${id} deleted successfully` });
  });

// Lambda handler for API Gateway
export const handler = handle(usersByIdDeleteApp);
