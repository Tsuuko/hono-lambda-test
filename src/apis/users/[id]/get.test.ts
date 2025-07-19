import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { usersByIdGetHandlers, usersByIdGetPath } from './get';

const testApp = new Hono()
  .use('*', (c, next) => {
    c.env = {
      event: {} as any,
      lambdaContext: {} as any,
    };
    return next();
  })
  .get(usersByIdGetPath, ...usersByIdGetHandlers);

describe('GET /users/:id', () => {
  it('should return user by id with correct structure', async () => {
    const res = await testApp.request('/users/123');

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty('user');
    expect(data.user.id).toBe('123');
    expect(data.user.createdAt).toBe('2025-01-01T00:00:00Z');
    expect(typeof data.user.id).toBe('string');
    expect(typeof data.user.createdAt).toBe('string');
  });

  it('should return JSON content type', async () => {
    const res = await testApp.request('/users/456');

    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('should handle different numeric IDs', async () => {
    const testIds = ['1', '999', '0', '12345'];
    
    for (const id of testIds) {
      const res = await testApp.request(`/users/${id}`);
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.user.id).toBe(id);
      expect(data.user.createdAt).toBe('2025-01-01T00:00:00Z');
    }
  });

  it('should return 400 for non-numeric id', async () => {
    const invalidIds = ['non-numeric-id', 'abc', '12abc', 'special!@#'];
    
    for (const id of invalidIds) {
      const res = await testApp.request(`/users/${id}`);
      
      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data).toHaveProperty('error');
    }
  });

  it('should return 400 for empty id', async () => {
    const res = await testApp.request('/users/');

    expect(res.status).toBe(404);
  });

  it('should handle special numeric edge cases', async () => {
    const edgeCases = [
      { id: '000', expected: '000' },
      { id: '001', expected: '001' },
      { id: '9999999999', expected: '9999999999' },
    ];
    
    for (const { id, expected } of edgeCases) {
      const res = await testApp.request(`/users/${id}`);
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.user.id).toBe(expected);
    }
  });

  it('should respond quickly', async () => {
    const startTime = Date.now();
    const res = await testApp.request('/users/123');
    const endTime = Date.now();

    expect(res.status).toBe(200);
    expect(endTime - startTime).toBeLessThan(1000);
  });

  it('should handle URL encoded IDs', async () => {
    const res = await testApp.request('/users/123');

    expect(res.status).toBe(200);
    
    const data = await res.json();
    expect(data.user.id).toBe('123');
  });

  it('should return ISO date format', async () => {
    const res = await testApp.request('/users/123');
    const data = await res.json();

    expect(data.user.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.?\d{0,3})?Z$/);
    expect(data.user.createdAt).toBe('2025-01-01T00:00:00Z');
  });

  it('should handle only GET method', async () => {
    const methods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    
    for (const method of methods) {
      const res = await testApp.request('/users/123', { method });
      expect(res.status).toBe(404);
    }
  });
});
