import { Controller, Get } from '@nestjs/common';
import { AmazonService } from '../amazon';
import { AuthUser, ChannelCodeEnum } from 'src/helpers';
import { ChannelService } from '../channel';

@Controller('dashboard')
export class DashboardController {
  AMAZON_CLIENT_ID = process.env.AMAZON_CLIENT_ID;
  AMAZON_CLIENT_SECRECT = process.env.AMAZON_CLIENT_SECRECT;
  SQS_QUEUE_URL = process.env.SQS_QUEUE_URL;
  S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

  constructor(
    private amazonService: AmazonService,
    private channelService: ChannelService,
  ) {}

  @Get('/fetch')
  async fetchSkuDataFromAllChannels(@AuthUser() user_id: string) {
    await this.amazonService.fetchSKUData({
      user_id,
      channel_name: ChannelCodeEnum.amazon_us,
      AMAZON_CLIENT_ID: this.AMAZON_CLIENT_ID,
      AMAZON_CLIENT_SECRECT: this.AMAZON_CLIENT_SECRECT,
      SQS_QUEUE_URL: this.SQS_QUEUE_URL,
      S3_BUCKET_NAME: this.S3_BUCKET_NAME,
    });
    return true;
  }
}
