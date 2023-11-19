import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  AmazonController,
  AmazonModule,
  AmazonService,
  ChannelController,
  ChannelModule,
  ChannelService,
  SkuController,
  SkuModule,
  SkuService,
  UserModule,
  GoogleModule,
  GoogleController,
  GoogleService,
  NotificationModule,
  NotificationService,
  NotificationController,
} from './modules';

@Module({
  imports: [
    UserModule,
    ChannelModule,
    SkuModule,
    AmazonModule,
    GoogleModule,
    NotificationModule,
  ],
  controllers: [
    AppController,
    ChannelController,
    SkuController,
    AmazonController,
    GoogleController,
    NotificationController,
  ],
  providers: [
    AppService,
    ChannelService,
    SkuService,
    AmazonService,
    GoogleService,
    NotificationService,
  ],
})
export class AppModule {}
