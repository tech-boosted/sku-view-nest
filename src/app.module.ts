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
} from './modules';

@Module({
  imports: [UserModule, ChannelModule, SkuModule, AmazonModule],
  controllers: [
    AppController,
    ChannelController,
    SkuController,
    AmazonController,
  ],
  providers: [AppService, ChannelService, SkuService, AmazonService],
})
export class AppModule {}
