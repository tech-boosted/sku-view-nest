import { Module } from '@nestjs/common';
import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';
import { ChannelService } from '../channel';
import { NotificationService } from '../notification';

@Module({
  controllers: [GoogleController],
  providers: [GoogleService, ChannelService, NotificationService],
})
export class GoogleModule {}
