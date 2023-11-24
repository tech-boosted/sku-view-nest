import { Controller, Get } from '@nestjs/common';
import { AmazonService } from '../amazon';
import { AuthUser, ChannelCodeEnum } from 'src/helpers';
import { ChannelService } from '../channel';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private amazonService: AmazonService,
    private channelService: ChannelService,
  ) {}

  @Get('/fetch')
  async fetchSkuDataFromAllChannels(@AuthUser() user_id: string) {
    const profile = await this.channelService.getOne({
      user_id,
      channel_name: ChannelCodeEnum.amazon_us,
      token_type: 'access_token',
    });
    return this.amazonService.fetchSKUData({
      user_id,
      channel_name: ChannelCodeEnum.amazon_us,
      profile_id: profile?.profile_id,
    });
  }
}
