import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { usersPostHandlers, usersPostPath } from './post';

const testApp = new Hono()
  .use('*', (c, next) => {
    c.env = {
      event: {} as any,
      lambdaContext: {} as any,
    };
    return next();
  })
  .post(usersPostPath, ...usersPostHandlers);

describe('POST /users', () => {
  it('should create a new user with valid data', async () => {
    const res = await testApp.request('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: '123' }),
    });

    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data).toHaveProperty('user');
    expect(data.user.id).toBe('123');
    expect(data.user.createdAt).toBeDefined();
    expect(typeof data.user.createdAt).toBe('string');
    expect(new Date(data.user.createdAt).toISOString()).toBe(data.user.createdAt);
  });

  it('should return JSON content type for successful creation', async () => {
    const res = await testApp.request('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: '456' }),
    });

    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('should return 400 for empty id', async () => {
    const res = await testApp.request('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: '' }),
    });

    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data).toHaveProperty('error');
  });

  it('should return 400 for missing id', async () => {
    const res = await testApp.request('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data).toHaveProperty('error');
  });

  it('should return 400 for non-numeric id', async () => {
    const res = await testApp.request('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: 'non-numeric' }),
    });

    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data).toHaveProperty('error');
  });

  it('should return 400 for invalid JSON', async () => {
    const res = await testApp.request('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'invalid json',
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 for missing Content-Type header', async () => {
    const res = await testApp.request('/users', {
      method: 'POST',
      body: JSON.stringify({ id: '123' }),
    });

    expect(res.status).toBe(400);
  });

  it('should handle numeric string ids correctly', async () => {
    const testIds = ['1', '999', '0'];
    
    for (const id of testIds) {
      const res = await testApp.request('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      expect(res.status).toBe(201);
      
      const data = await res.json();
      expect(data.user.id).toBe(id);
    }
  });

  it('should create users with unique timestamps', async () => {
    const res1 = await testApp.request('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: '101' }),
    });

    await new Promise(resolve => setTimeout(resolve, 1));

    const res2 = await testApp.request('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: '102' }),
    });

    const data1 = await res1.json();
    const data2 = await res2.json();

    expect(data1.user.createdAt).not.toBe(data2.user.createdAt);
  });
});
