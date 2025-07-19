import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { handle } from 'hono/aws-lambda';

const createUserSchema = z.object({
  id: z.string().min(1),
});

export const usersPostApp = new Hono()
  // POST /users - Create user
  .post('/', zValidator('json', createUserSchema), (c) => {
    const { id } = c.req.valid('json');

    const newUser = {
      id,
      createdAt: new Date().toISOString(),
    };

    return c.json({ user: newUser }, 201);
  });

// Lambda handler for API Gateway
export const handler = handle(usersPostApp);
