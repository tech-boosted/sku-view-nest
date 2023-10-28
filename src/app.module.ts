import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  ChannelController,
  ChannelModule,
  ChannelService,
  SkuController,
  SkuModule,
  SkuService,
  UserModule,
} from './modules';

@Module({
  imports: [UserModule, ChannelModule, SkuModule],
  controllers: [AppController, ChannelController, SkuController],
  providers: [AppService, ChannelService, SkuService],
})
export class AppModule {}
