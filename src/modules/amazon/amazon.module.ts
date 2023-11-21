import { Module } from '@nestjs/common';
import { AmazonController } from './amazon.controller';
import { AmazonService } from './amazon.service';
import { ChannelService } from '../channel';
import { NotificationService } from '../notification';
import { DatesMetaDataService } from '../dates-meta-data';

@Module({
  controllers: [AmazonController],
  providers: [
    AmazonService,
    ChannelService,
    NotificationService,
    DatesMetaDataService,
  ],
})
export class AmazonModule {}
