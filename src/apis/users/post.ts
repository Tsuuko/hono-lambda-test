import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { userSchema } from '../../domains/user';
import { factory } from '../../factory';
import { commonMiddlewares } from '../../middlewares/common';
import { formatValidateErrorResponse } from '../../middlewares/utils/format-validate-error-response';

const createUserSchema = userSchema.pick({ id: true });

export const usersPostHandlers = factory.createHandlers(
  ...commonMiddlewares,
  zValidator('json', createUserSchema, formatValidateErrorResponse),
  (c) => {
    const { id } = c.req.valid('json');

    const newUser = {
      id,
      createdAt: new Date().toISOString(),
    };

    return c.json({ user: newUser }, 201);
  },
);

export const usersPostPath = '/users';

// Lambda handler for API Gateway
export const handler = handle(
  new Hono().post(usersPostPath, ...usersPostHandlers),
);
