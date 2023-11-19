import { Module } from '@nestjs/common';
import { AmazonController } from './amazon.controller';
import { AmazonService } from './amazon.service';
import { ChannelService } from '../channel';
import { NotificationService } from '../notification';

@Module({
  controllers: [AmazonController],
  providers: [AmazonService, ChannelService, NotificationService],
})
export class AmazonModule {}
