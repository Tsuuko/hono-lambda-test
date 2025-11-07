import { zValidator } from '@hono/zod-validator';
import { handle } from 'hono/aws-lambda';
import { userSchema } from '../../../domains/user';
import { createApp, factory } from '../../../factory';
import { commonMiddlewares } from '../../../middlewares/common';
import { formatValidateErrorResponse } from '../../../middlewares/utils/format-validate-error-response';

const userParamSchema = userSchema.pick({ id: true });

export const usersByIdGetHandlers = factory.createHandlers(
  ...commonMiddlewares,
  zValidator('param', userParamSchema, formatValidateErrorResponse),
  (c) => {
    const { id } = c.req.valid('param');

    const user = {
      id,
      createdAt: '2025-01-01T00:00:00Z',
    };

    return c.json({ user });
  },
);

export const usersByIdGetPath = '/users/:id';

// Lambda handler for API Gateway
export const handler = handle(
  createApp().get(usersByIdGetPath, ...usersByIdGetHandlers),
);
