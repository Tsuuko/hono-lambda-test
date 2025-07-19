import { describe, it, expect } from 'vitest';
import { usersByIdGetApp } from './get';

describe('GET /users/:id', () => {
  it('should return user by id', async () => {
    const res = await usersByIdGetApp.request('/test-user-123');

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.user.id).toBe('test-user-123');
    expect(data.user.createdAt).toBe('2025-01-01T00:00:00Z');
  });

  it('should return 400 for empty id', async () => {
    const res = await usersByIdGetApp.request('/');

    expect(res.status).toBe(404);
  });
});
