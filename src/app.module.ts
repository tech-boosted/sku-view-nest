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
} from './modules';

@Module({
  imports: [UserModule, ChannelModule, SkuModule, AmazonModule, GoogleModule],
  controllers: [
    AppController,
    ChannelController,
    SkuController,
    AmazonController,
    GoogleController,
  ],
  providers: [
    AppService,
    ChannelService,
    SkuService,
    AmazonService,
    GoogleService,
  ],
})
export class AppModule {}
