import { LambdaContext, LambdaEvent } from 'hono/aws-lambda';
import { createFactory } from 'hono/factory';

type Bindings = {
  event: LambdaEvent;
  lambdaContext: LambdaContext;
};

export const factory = createFactory<{ Bindings: Bindings }>();
