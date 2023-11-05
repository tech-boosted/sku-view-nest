import { Controller, Get } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { AuthUser } from 'src/helpers';

@Controller()
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Get('channels')
  async listChannels(@AuthUser() user_id) {
    const results = await this.channelService.getAll(user_id);
    const keysToRemove = ['token_type', 'token', 'grant_code'];

    if (results?.items?.length > 0) {
      return results.items.map((item) => {
        for (const keyToRemove of keysToRemove) {
          delete item[keyToRemove];
        }
        return item;
      });
    }
    return [];
  }

  @Get('channel/one')
  async getChannelDetails(@AuthUser() user_id) {
    return this.channelService.get(user_id, 'access_token', 'amazon_us');
  }
}
