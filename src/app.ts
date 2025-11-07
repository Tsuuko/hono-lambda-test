import { serve } from '@hono/node-server';
import { hc } from 'hono/client';
import {
  usersByIdDeleteHandlers,
  usersByIdDeletePath,
} from './apis/users/[id]/delete';
import { usersByIdGetHandlers, usersByIdGetPath } from './apis/users/[id]/get';
import { usersByIdPutHandlers, usersByIdPutPath } from './apis/users/[id]/put';
import { usersGetHandlers, usersGetPath } from './apis/users/get';
import { usersPostHandlers, usersPostPath } from './apis/users/post';
import { createApp } from './factory';

const app = createApp();

// ローカル実行時のモックBindings設定
app.use('*', async (c, next) => {
  c.env.event = {} as any;
  c.env.lambdaContext = {} as any;
  await next();
});

// Mount API routes
const routes = app
  .get(usersGetPath, ...usersGetHandlers)
  .post(usersPostPath, ...usersPostHandlers)
  .get(usersByIdGetPath, ...usersByIdGetHandlers)
  .put(usersByIdPutPath, ...usersByIdPutHandlers)
  .delete(usersByIdDeletePath, ...usersByIdDeleteHandlers);

// Base route
app.get('/', (c) => {
  return c.json({
    message: 'Hono API Server',
    endpoints: {
      'GET /users': 'Get users list',
      'POST /users': 'Create user',
      'GET /users/:id': 'Get specific user',
      'PUT /users/:id': 'Update user',
      'DELETE /users/:id': 'Delete user',
    },
  });
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

// Export the app type for RPC client
export type AppType = typeof routes;

const client = hc<AppType>('http://localhost:3000');
client.users.$get;
