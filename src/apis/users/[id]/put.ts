import { zValidator } from '@hono/zod-validator';
import { handle } from 'hono/aws-lambda';
import { userSchema } from '../../../domains/user';
import { createApp, factory } from '../../../factory';
import { commonMiddlewares } from '../../../middlewares/common';
import { formatValidateErrorResponse } from '../../../middlewares/utils/format-validate-error-response';

const userParamSchema = userSchema.pick({ id: true });

export const usersByIdPutHandlers = factory.createHandlers(
  ...commonMiddlewares,
  zValidator('param', userParamSchema, formatValidateErrorResponse),
  (c) => {
    const { id } = c.req.valid('param');

    const updatedUser = {
      id,
      updatedAt: new Date().toISOString(),
    };

    return c.json({ user: updatedUser });
  },
);

export const usersByIdPutPath = '/users/:id';

// Lambda handler for API Gateway
export const handler = handle(
  createApp().put(usersByIdPutPath, ...usersByIdPutHandlers),
);
