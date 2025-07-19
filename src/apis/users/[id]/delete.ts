import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { userSchema } from '../../../domains/user';
import { factory } from '../../../factory';
import { commonMiddlewares } from '../../../middlewares/common';
import { formatValidateErrorResponse } from '../../../middlewares/utils/format-validate-error-response';

const userParamSchema = userSchema.pick({ id: true });

export const usersByIdDeleteHandlers = factory.createHandlers(
  ...commonMiddlewares,
  zValidator('param', userParamSchema, formatValidateErrorResponse),
  (c) => {
    const { id } = c.req.valid('param');

    return c.json({ message: `User ${id} deleted successfully` });
  },
);

export const usersByIdDeletePath = '/users/:id';

// Lambda handler for API Gateway
export const handler = handle(
  new Hono().delete(usersByIdDeletePath, ...usersByIdDeleteHandlers),
);
