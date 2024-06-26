import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createConnection } from '@typedorm/core';
import { acrosTable } from './config';
import 'reflect-metadata';
import { DocumentClientV3 } from '@typedorm/document-client';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { Agent } from 'http';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import {
  Channel,
  DatesMetaData,
  Notification,
  Reports,
  Sku,
  User,
  Catalog,
} from 'src/entity';

dotenv.config();

const documentClient = new DocumentClientV3(
  new DynamoDBClient({
    requestHandler: new NodeHttpHandler({
      httpAgent: new Agent({ keepAlive: true }),
    }),
  }),
);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe());

  createConnection({
    table: acrosTable,
    entities: [
      User,
      Channel,
      Sku,
      Notification,
      DatesMetaData,
      Reports,
      Catalog,
    ],
    documentClient: documentClient,
  });
  await app.listen(3001);
}
bootstrap();
