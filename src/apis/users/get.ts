import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';

export const usersGetApp = new Hono()
  // GET /users - Get all users
  .get('/users', (c) => {
    const users = [{ id: 'user1' }, { id: 'user2' }, { id: 'user3' }];
    return c.json({ users });
  });

// Lambda handler for API Gateway
export const handler = handle(usersGetApp);
