import { Module } from '@nestjs/common';
import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';
import { ChannelService } from '../channel';

@Module({
  controllers: [GoogleController],
  providers: [GoogleService, ChannelService],
})
export class GoogleModule {}
