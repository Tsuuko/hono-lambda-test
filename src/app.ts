import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { usersGetApp } from './apis/users/get';
import { usersPostApp } from './apis/users/post';
import { usersByIdGetApp } from './apis/users/[id]/get';
import { usersByIdPutApp } from './apis/users/[id]/put';
import { usersByIdDeleteApp } from './apis/users/[id]/delete';

const app = new Hono();

// Mount API routes
const routes = app
  .route('/users', usersGetApp)
  .route('/users', usersPostApp)
  .route('/users', usersByIdGetApp)
  .route('/users', usersByIdPutApp)
  .route('/users', usersByIdDeleteApp);

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
