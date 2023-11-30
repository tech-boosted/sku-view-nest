import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { AmazonService } from '../amazon';
import { ChannelService } from '../channel';
import { DatesMetaDataService } from '../dates-meta-data';
import { GoogleService } from '../google';
import { ReportsService } from '../reports';

@Module({
  controllers: [DashboardController],
  providers: [
    AmazonService,
    ChannelService,
    DatesMetaDataService,
    GoogleService,
    ReportsService,
  ],
})
export class DashboardModule {}
