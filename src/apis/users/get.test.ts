import { describe, it, expect } from 'vitest';
import { usersGetApp } from './get';

describe('GET /users', () => {
  it('should return users list', async () => {
    const res = await usersGetApp.request('/');

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toEqual({
      users: [{ id: 'user1' }, { id: 'user2' }, { id: 'user3' }],
    });
  });

  it('should return JSON content type', async () => {
    const res = await usersGetApp.request('/');

    expect(res.headers.get('content-type')).toContain('application/json');
  });
});
