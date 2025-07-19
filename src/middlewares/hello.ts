import { factory } from '../factory';

export const hello = () =>
  factory.createMiddleware(async (c, next) => {
    console.log('Hello from middleware!');
    console.log('path:', c.req.path);
    console.log('event:', c.env.event);
    console.log('lambdaContext:', c.env.lambdaContext);
    await next();
  });
