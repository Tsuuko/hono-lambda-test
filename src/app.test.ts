import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { usersGetHandlers, usersGetPath } from './apis/users/get';
import { usersPostHandlers, usersPostPath } from './apis/users/post';
import { usersByIdGetHandlers, usersByIdGetPath } from './apis/users/[id]/get';
import { usersByIdPutHandlers, usersByIdPutPath } from './apis/users/[id]/put';
import {
  usersByIdDeleteHandlers,
  usersByIdDeletePath,
} from './apis/users/[id]/delete';

const testApp = new Hono()
  .use('*', (c, next) => {
    c.env = {
      event: {} as any,
      lambdaContext: {} as any,
    };
    return next();
  })
  .get(usersGetPath, ...usersGetHandlers)
  .post(usersPostPath, ...usersPostHandlers)
  .get(usersByIdGetPath, ...usersByIdGetHandlers)
  .put(usersByIdPutPath, ...usersByIdPutHandlers)
  .delete(usersByIdDeletePath, ...usersByIdDeleteHandlers);

describe('App Integration Tests', () => {
  describe('User CRUD Operations', () => {
    it('should handle complete user lifecycle', async () => {
      // Create user
      const createRes = await testApp.request('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: '999' }),
      });

      expect(createRes.status).toBe(201);
      const createData = await createRes.json();
      expect(createData.user.id).toBe('999');
      expect(createData.user.createdAt).toBeDefined();

      // Get specific user
      const getRes = await testApp.request('/users/999');
      expect(getRes.status).toBe(200);
      const getData = await getRes.json();
      expect(getData.user.id).toBe('999');

      // Update user
      const updateRes = await testApp.request('/users/999', { method: 'PUT' });
      expect(updateRes.status).toBe(200);
      const updateData = await updateRes.json();
      expect(updateData.user.id).toBe('999');
      expect(updateData.user.updatedAt).toBeDefined();

      // Delete user
      const deleteRes = await testApp.request('/users/999', {
        method: 'DELETE',
      });
      expect(deleteRes.status).toBe(200);
      const deleteData = await deleteRes.json();
      expect(deleteData.message).toBe('User 999 deleted successfully');
    });

    it('should handle GET /users with correct structure', async () => {
      const res = await testApp.request('/users');
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toHaveProperty('users');
      expect(Array.isArray(data.users)).toBe(true);
      expect(data.users).toHaveLength(3);

      data.users.forEach((user: any) => {
        expect(user).toHaveProperty('id');
        expect(typeof user.id).toBe('string');
      });
    });

    it('should handle POST /users with validation', async () => {
      const res = await testApp.request('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: '888' }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.user.id).toBe('888');
      expect(data.user.createdAt).toBeDefined();
      expect(new Date(data.user.createdAt).toISOString()).toBe(
        data.user.createdAt,
      );
    });

    it('should handle GET /users/:id with validation', async () => {
      const res = await testApp.request('/users/123');
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.user.id).toBe('123');
      expect(data.user.createdAt).toBe('2025-01-01T00:00:00Z');
    });

    it('should handle PUT /users/:id with timestamps', async () => {
      const res = await testApp.request('/users/123', { method: 'PUT' });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.user.id).toBe('123');
      expect(data.user.updatedAt).toBeDefined();
      expect(new Date(data.user.updatedAt).toISOString()).toBe(
        data.user.updatedAt,
      );
    });

    it('should handle DELETE /users/:id with confirmation', async () => {
      const res = await testApp.request('/users/123', { method: 'DELETE' });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.message).toBe('User 123 deleted successfully');
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for invalid POST data', async () => {
      const invalidPayloads = [
        {},
        { id: '' },
        { id: 'non-numeric' },
        { id: '12abc' },
      ];

      for (const payload of invalidPayloads) {
        const res = await testApp.request('/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data).toHaveProperty('error');
      }
    });

    it('should return 400 for invalid path parameters', async () => {
      const invalidIds = ['non-numeric', 'abc123', 'special!@#'];
      const methods = ['GET', 'PUT', 'DELETE'];

      for (const method of methods) {
        for (const id of invalidIds) {
          const res = await testApp.request(`/users/${id}`, { method });
          expect(res.status).toBe(400);

          const data = await res.json();
          expect(data).toHaveProperty('error');
        }
      }
    });

    it('should return 404 for non-existent routes', async () => {
      const invalidRoutes = [
        '/users/',
        '/user',
        '/users/123/extra',
        '/api/users',
      ];

      for (const route of invalidRoutes) {
        const res = await testApp.request(route);
        expect(res.status).toBe(404);
      }
    });

    it('should return 400 for malformed JSON', async () => {
      const res = await testApp.request('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      expect(res.status).toBe(400);
    });

    it('should return 400 for missing Content-Type', async () => {
      const res = await testApp.request('/users', {
        method: 'POST',
        body: JSON.stringify({ id: '123' }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe('HTTP Method Validation', () => {
    it('should only allow specified methods for each endpoint', async () => {
      const routes = [
        {
          path: '/users',
          allowedMethods: ['GET', 'POST'],
          testRequests: {
            GET: { expectedStatus: 200 },
            POST: {
              expectedStatus: 201,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: '123' }),
            },
          },
        },
        {
          path: '/users/123',
          allowedMethods: ['GET', 'PUT', 'DELETE'],
          testRequests: {
            GET: { expectedStatus: 200 },
            PUT: { expectedStatus: 200 },
            DELETE: { expectedStatus: 200 },
          },
        },
      ];

      const disallowedMethods = ['PATCH'];

      for (const { path, allowedMethods, testRequests } of routes) {
        // Test allowed methods
        for (const method of allowedMethods) {
          const testRequest = testRequests[method];
          const res = await testApp.request(path, {
            method,
            headers: testRequest?.headers,
            body: testRequest?.body,
          });

          expect(res.status).toBe(testRequest?.expectedStatus || 200);
        }

        // Test disallowed methods
        for (const method of disallowedMethods) {
          const res = await testApp.request(path, { method });
          expect(res.status).toBe(404);
        }
      }
    });
  });

  describe('Response Format Consistency', () => {
    it('should return consistent JSON content types', async () => {
      const requests = [
        { path: '/users', method: 'GET' },
        { path: '/users', method: 'POST', body: { id: '777' } },
        { path: '/users/123', method: 'GET' },
        { path: '/users/123', method: 'PUT' },
        { path: '/users/123', method: 'DELETE' },
      ];

      for (const req of requests) {
        const res = await testApp.request(req.path, {
          method: req.method,
          headers: req.body
            ? { 'Content-Type': 'application/json' }
            : undefined,
          body: req.body ? JSON.stringify(req.body) : undefined,
        });

        if (res.status < 400) {
          expect(res.headers.get('content-type')).toContain('application/json');
        }
      }
    });

    it('should handle performance requirements', async () => {
      const requests = ['/users', '/users/123'];

      for (const path of requests) {
        const startTime = Date.now();
        const res = await testApp.request(path);
        const endTime = Date.now();

        expect(res.status).toBe(200);
        expect(endTime - startTime).toBeLessThan(1000);
      }
    });
  });
});
