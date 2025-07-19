import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { usersGetApp } from './apis/users/get';
import { usersPostApp } from './apis/users/post';
import { usersByIdGetApp } from './apis/users/[id]/get';
import { usersByIdPutApp } from './apis/users/[id]/put';
import { usersByIdDeleteApp } from './apis/users/[id]/delete';

// Create test app similar to the main app
const testApp = new Hono()
  .route('/users', usersGetApp)
  .route('/users', usersPostApp)
  .route('/users', usersByIdGetApp)
  .route('/users', usersByIdPutApp)
  .route('/users', usersByIdDeleteApp);

describe('App Integration Tests', () => {
  it('should handle GET /users', async () => {
    const res = await testApp.request('/users');
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.users).toHaveLength(3);
  });

  it('should handle POST /users', async () => {
    const res = await testApp.request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'integration-test-user' }),
    });

    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.user.id).toBe('integration-test-user');
  });

  it('should handle GET /users/:id', async () => {
    const res = await testApp.request('/users/test-id-123');
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.user.id).toBe('test-id-123');
  });

  it('should handle PUT /users/:id', async () => {
    const res = await testApp.request('/users/test-id-123', {
      method: 'PUT',
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.user.id).toBe('test-id-123');
    expect(data.user.updatedAt).toBeDefined();
  });

  it('should handle DELETE /users/:id', async () => {
    const res = await testApp.request('/users/test-id-123', {
      method: 'DELETE',
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.message).toBe('User test-id-123 deleted successfully');
  });
});
