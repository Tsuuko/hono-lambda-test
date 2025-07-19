import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { usersGetHandlers, usersGetPath } from './get';

const testApp = new Hono()
  .use('*', (c, next) => {
    c.env = {
      event: {} as any,
      lambdaContext: {} as any,
    };
    return next();
  })
  .get(usersGetPath, ...usersGetHandlers);

describe('GET /users', () => {
  it('should return users list with correct structure', async () => {
    const res = await testApp.request('/users');

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toEqual({
      users: [{ id: 'user1' }, { id: 'user2' }, { id: 'user3' }],
    });
    
    expect(Array.isArray(data.users)).toBe(true);
    expect(data.users).toHaveLength(3);
    
    data.users.forEach((user: any) => {
      expect(user).toHaveProperty('id');
      expect(typeof user.id).toBe('string');
    });
  });

  it('should return JSON content type', async () => {
    const res = await testApp.request('/users');

    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('should handle HTTP GET method only', async () => {
    const postRes = await testApp.request('/users', { method: 'POST' });
    expect(postRes.status).toBe(404);

    const putRes = await testApp.request('/users', { method: 'PUT' });
    expect(putRes.status).toBe(404);

    const deleteRes = await testApp.request('/users', { method: 'DELETE' });
    expect(deleteRes.status).toBe(404);
  });

  it('should respond quickly', async () => {
    const startTime = Date.now();
    const res = await testApp.request('/users');
    const endTime = Date.now();

    expect(res.status).toBe(200);
    expect(endTime - startTime).toBeLessThan(1000);
  });

  it('should return users with expected IDs', async () => {
    const res = await testApp.request('/users');
    const data = await res.json();

    const userIds = data.users.map((user: any) => user.id);
    expect(userIds).toContain('user1');
    expect(userIds).toContain('user2');
    expect(userIds).toContain('user3');
  });

  it('should handle incorrect path', async () => {
    const res = await testApp.request('/user');
    expect(res.status).toBe(404);

    const res2 = await testApp.request('/users/');
    expect(res2.status).toBe(404);
  });
});
