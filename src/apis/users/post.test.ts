import { describe, it, expect } from 'vitest';
import { usersPostApp } from './post';

describe('POST /users', () => {
  it('should create a new user', async () => {
    const res = await usersPostApp.request('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: 'test-user' }),
    });

    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.user.id).toBe('test-user');
    expect(data.user.createdAt).toBeDefined();
    expect(typeof data.user.createdAt).toBe('string');
  });

  it('should return 400 for invalid data', async () => {
    const res = await usersPostApp.request('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: '' }), // Invalid: empty string
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 for missing id', async () => {
    const res = await usersPostApp.request('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Missing id
    });

    expect(res.status).toBe(400);
  });
});
