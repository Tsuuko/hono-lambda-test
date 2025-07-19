import { zValidator } from '@hono/zod-validator';

export const formatValidateErrorResponse: Parameters<typeof zValidator>[2] = (
  result,
  c,
) => {
  if (result.success === false) {
    return c.json({ error: result.error.issues[0].message }, 400);
  }
};
