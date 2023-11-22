import { Controller, Get } from '@nestjs/common';
import { AmazonService } from '../amazon';
import { AuthUser, ChannelCodeEnum } from 'src/helpers';

@Controller('dashboard')
export class DashboardController {
  constructor(private amazonService: AmazonService) {}

  @Get('/fetch')
  async fetchSkuDataFromAllChannels(@AuthUser() user_id: string) {
    return this.amazonService.fetchSKUData({
      user_id,
      channel_name: ChannelCodeEnum.amazon_us,
      profile_id: '',
    });
  }
}
