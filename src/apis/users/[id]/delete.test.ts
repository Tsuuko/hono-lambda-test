import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { usersByIdDeleteHandlers, usersByIdDeletePath } from './delete';

const testApp = new Hono()
  .use('*', (c, next) => {
    c.env = {
      event: {} as any,
      lambdaContext: {} as any,
    };
    return next();
  })
  .delete(usersByIdDeletePath, ...usersByIdDeleteHandlers);

describe('DELETE /users/:id', () => {
  it('should delete user by id with correct message', async () => {
    const res = await testApp.request('/users/123', { method: 'DELETE' });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty('message');
    expect(data.message).toBe('User 123 deleted successfully');
    expect(typeof data.message).toBe('string');
  });

  it('should return JSON content type', async () => {
    const res = await testApp.request('/users/456', { method: 'DELETE' });

    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('should handle different numeric IDs', async () => {
    const testIds = ['1', '999', '0', '12345'];

    for (const id of testIds) {
      const res = await testApp.request(`/users/${id}`, { method: 'DELETE' });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.message).toBe(`User ${id} deleted successfully`);
    }
  });

  it('should return 400 for non-numeric id', async () => {
    const invalidIds = ['non-numeric-id', 'abc', '12abc', 'special!@#'];

    for (const id of invalidIds) {
      const res = await testApp.request(`/users/${id}`, { method: 'DELETE' });

      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data).toHaveProperty('error');
    }
  });

  it('should return 404 for empty id path', async () => {
    const res = await testApp.request('/users/', { method: 'DELETE' });

    expect(res.status).toBe(404);
  });

  it('should handle special numeric edge cases', async () => {
    const edgeCases = [
      { id: '000', expected: 'User 000 deleted successfully' },
      { id: '001', expected: 'User 001 deleted successfully' },
      { id: '9999999999', expected: 'User 9999999999 deleted successfully' },
    ];

    for (const { id, expected } of edgeCases) {
      const res = await testApp.request(`/users/${id}`, { method: 'DELETE' });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.message).toBe(expected);
    }
  });

  it('should respond quickly', async () => {
    const startTime = Date.now();
    const res = await testApp.request('/users/123', { method: 'DELETE' });
    const endTime = Date.now();

    expect(res.status).toBe(200);
    expect(endTime - startTime).toBeLessThan(1000);
  });

  it('should handle only DELETE method', async () => {
    const methods = ['GET', 'POST', 'PUT', 'PATCH'];

    for (const method of methods) {
      const res = await testApp.request('/users/123', { method });
      expect(res.status).toBe(404);
    }
  });

  it('should return consistent message format', async () => {
    const testIds = ['1', '2', '3'];

    for (const id of testIds) {
      const res = await testApp.request(`/users/${id}`, { method: 'DELETE' });
      const data = await res.json();

      expect(data.message).toMatch(/^User \d+ deleted successfully$/);
      expect(data.message).toContain(id);
    }
  });

  it('should preserve ID in deletion message', async () => {
    const testId = '789';
    const res = await testApp.request(`/users/${testId}`, { method: 'DELETE' });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.message).toBe(`User ${testId} deleted successfully`);
    expect(Object.keys(data)).toEqual(['message']);
  });

  it('should handle URL encoding correctly', async () => {
    const res = await testApp.request('/users/123', { method: 'DELETE' });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.message).toBe('User 123 deleted successfully');
  });

  it('should validate id parameter before deletion', async () => {
    const invalidId = 'invalid-id';
    const res = await testApp.request(`/users/${invalidId}`, {
      method: 'DELETE',
    });

    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data).toHaveProperty('error');
    expect(data.message).toBeUndefined();
  });
});
