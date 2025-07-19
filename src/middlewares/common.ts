import { logger } from 'hono/logger';
import { hello } from './hello';

export const commonMiddlewares = [logger(), hello()] as const;
