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
  DatesMetaDataModule,
  DatesMetaDataService,
  DashboardModule,
  DashboardController,
  ReportsModule,
  ReportsService,
} from './modules';

@Module({
  imports: [
    UserModule,
    ChannelModule,
    SkuModule,
    AmazonModule,
    GoogleModule,
    NotificationModule,
    DatesMetaDataModule,
    DashboardModule,
    ReportsModule,
  ],
  controllers: [
    AppController,
    ChannelController,
    SkuController,
    AmazonController,
    GoogleController,
    NotificationController,
    DashboardController,
  ],
  providers: [
    AppService,
    ChannelService,
    SkuService,
    AmazonService,
    GoogleService,
    NotificationService,
    DatesMetaDataService,
    ReportsService,
  ],
})
export class AppModule {}
