import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { factory } from '../../factory';
import { commonMiddlewares } from '../../middlewares/common';

export const usersGetHandlers = factory.createHandlers(
  ...commonMiddlewares,
  (c) => {
    const users = [{ id: 'user1' }, { id: 'user2' }, { id: 'user3' }];
    return c.json({ users });
  },
);

export const usersGetPath = '/users';

// Lambda handler for API Gateway
export const handler = handle(
  new Hono().get(usersGetPath, ...usersGetHandlers),
);
