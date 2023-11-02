import { Module } from '@nestjs/common';
import { AmazonController } from './amazon.controller';
import { AmazonService } from './amazon.service';
import { ChannelService } from '../channel';

@Module({
  controllers: [AmazonController],
  providers: [AmazonService, ChannelService],
})
export class AmazonModule {}
