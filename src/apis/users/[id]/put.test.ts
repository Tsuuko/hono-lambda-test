import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { usersByIdPutHandlers, usersByIdPutPath } from './put';

const testApp = new Hono()
  .use('*', (c, next) => {
    c.env = {
      event: {} as any,
      lambdaContext: {} as any,
    };
    return next();
  })
  .put(usersByIdPutPath, ...usersByIdPutHandlers);

describe('PUT /users/:id', () => {
  it('should update user by id with correct structure', async () => {
    const res = await testApp.request('/users/123', { method: 'PUT' });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty('user');
    expect(data.user.id).toBe('123');
    expect(data.user.updatedAt).toBeDefined();
    expect(typeof data.user.id).toBe('string');
    expect(typeof data.user.updatedAt).toBe('string');
  });

  it('should return JSON content type', async () => {
    const res = await testApp.request('/users/456', { method: 'PUT' });

    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('should handle different numeric IDs', async () => {
    const testIds = ['1', '999', '0', '12345'];

    for (const id of testIds) {
      const res = await testApp.request(`/users/${id}`, { method: 'PUT' });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.user.id).toBe(id);
      expect(data.user.updatedAt).toBeDefined();
    }
  });

  it('should return 400 for non-numeric id', async () => {
    const invalidIds = ['non-numeric-id', 'abc', '12abc', 'special!@#'];

    for (const id of invalidIds) {
      const res = await testApp.request(`/users/${id}`, { method: 'PUT' });

      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data).toHaveProperty('error');
    }
  });

  it('should return 404 for empty id path', async () => {
    const res = await testApp.request('/users/', { method: 'PUT' });

    expect(res.status).toBe(404);
  });

  it('should handle special numeric edge cases', async () => {
    const edgeCases = [
      { id: '000', expected: '000' },
      { id: '001', expected: '001' },
      { id: '9999999999', expected: '9999999999' },
    ];

    for (const { id, expected } of edgeCases) {
      const res = await testApp.request(`/users/${id}`, { method: 'PUT' });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.user.id).toBe(expected);
    }
  });

  it('should respond quickly', async () => {
    const startTime = Date.now();
    const res = await testApp.request('/users/123', { method: 'PUT' });
    const endTime = Date.now();

    expect(res.status).toBe(200);
    expect(endTime - startTime).toBeLessThan(1000);
  });

  it('should return ISO date format for updatedAt', async () => {
    const res = await testApp.request('/users/123', { method: 'PUT' });
    const data = await res.json();

    expect(data.user.updatedAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
    expect(new Date(data.user.updatedAt).toISOString()).toBe(
      data.user.updatedAt,
    );
  });

  it('should handle only PUT method', async () => {
    const methods = ['GET', 'POST', 'DELETE', 'PATCH'];

    for (const method of methods) {
      const res = await testApp.request('/users/123', { method });
      expect(res.status).toBe(404);
    }
  });

  it('should generate unique timestamps for concurrent updates', async () => {
    const res1 = await testApp.request('/users/101', { method: 'PUT' });

    await new Promise((resolve) => setTimeout(resolve, 1));

    const res2 = await testApp.request('/users/102', { method: 'PUT' });

    const data1 = await res1.json();
    const data2 = await res2.json();

    expect(data1.user.updatedAt).not.toBe(data2.user.updatedAt);
  });

  it('should preserve ID in response', async () => {
    const testId = '789';
    const res = await testApp.request(`/users/${testId}`, { method: 'PUT' });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.user.id).toBe(testId);
    expect(data.user).toHaveProperty('updatedAt');
    expect(Object.keys(data.user)).toEqual(['id', 'updatedAt']);
  });
});
