import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createConnection } from '@typedorm/core';
import { acrosTable } from './db/acros.db';
import { User } from 'src/entity';
import 'reflect-metadata';
import { DocumentClientV3 } from '@typedorm/document-client';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const documentClient = new DocumentClientV3(new DynamoDBClient({}));

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  createConnection({
    table: acrosTable,
    entities: [User],
    documentClient: documentClient,
  });
  await app.listen(3000);
}
bootstrap();
