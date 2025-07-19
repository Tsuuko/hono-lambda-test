import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import * as path from 'path';

export class HonoApiTestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 各ルート用のLambda関数を作成
    const usersGetLambda = new lambdaNodejs.NodejsFunction(
      this,
      'UsersGetFunction',
      {
        entry: path.join(__dirname, '../../src/apis/users/get.ts'),
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        timeout: cdk.Duration.seconds(30),
        memorySize: 256,
        environment: {
          NODE_ENV: 'production',
        },
      },
    );

    const usersPostLambda = new lambdaNodejs.NodejsFunction(
      this,
      'UsersPostFunction',
      {
        entry: path.join(__dirname, '../../src/apis/users/post.ts'),
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        timeout: cdk.Duration.seconds(30),
        memorySize: 256,
        environment: {
          NODE_ENV: 'production',
        },
      },
    );

    const usersByIdGetLambda = new lambdaNodejs.NodejsFunction(
      this,
      'UsersByIdGetFunction',
      {
        entry: path.join(__dirname, '../../src/apis/users/[id]/get.ts'),
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        timeout: cdk.Duration.seconds(30),
        memorySize: 256,
        environment: {
          NODE_ENV: 'production',
        },
      },
    );

    const usersByIdPutLambda = new lambdaNodejs.NodejsFunction(
      this,
      'UsersByIdPutFunction',
      {
        entry: path.join(__dirname, '../../src/apis/users/[id]/put.ts'),
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        timeout: cdk.Duration.seconds(30),
        memorySize: 256,
        environment: {
          NODE_ENV: 'production',
        },
      },
    );

    const usersByIdDeleteLambda = new lambdaNodejs.NodejsFunction(
      this,
      'UsersByIdDeleteFunction',
      {
        entry: path.join(__dirname, '../../src/apis/users/[id]/delete.ts'),
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        timeout: cdk.Duration.seconds(30),
        memorySize: 256,
        environment: {
          NODE_ENV: 'production',
        },
      },
    );

    // API Gatewayを作成
    const api = new apigateway.RestApi(this, 'HonoApi', {
      restApiName: 'Hono Microservices API',
      description: 'Hono Lambda Microservices API',
      deployOptions: {
        stageName: 'v1',
      },
    });

    // /users リソースを作成
    const usersResource = api.root.addResource('users');

    // GET /users
    usersResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(usersGetLambda),
    );

    // POST /users
    usersResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(usersPostLambda),
    );

    // /users/{id} リソースを作成
    const userByIdResource = usersResource.addResource('{id}');

    // GET /users/{id}
    userByIdResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(usersByIdGetLambda),
    );

    // PUT /users/{id}
    userByIdResource.addMethod(
      'PUT',
      new apigateway.LambdaIntegration(usersByIdPutLambda),
    );

    // DELETE /users/{id}
    userByIdResource.addMethod(
      'DELETE',
      new apigateway.LambdaIntegration(usersByIdDeleteLambda),
    );

    // 出力
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'UsersGetFunctionName', {
      value: usersGetLambda.functionName,
      description: 'Users Get Lambda Function Name',
    });

    new cdk.CfnOutput(this, 'UsersPostFunctionName', {
      value: usersPostLambda.functionName,
      description: 'Users Post Lambda Function Name',
    });
  }
}
