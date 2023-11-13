import { Controller, Get } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { AuthUser } from 'src/helpers';

@Controller()
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Get('channels')
  async listChannels(@AuthUser() user_id) {
    const results = await this.channelService.getAll({ user_id });
    const keysToRemove = ['token_type', 'token', 'grant_code'];

    if (results?.items?.length > 0) {
      const filteredData = results?.items?.map((item) => {
        for (const keyToRemove of keysToRemove) {
          delete item[keyToRemove];
        }
        return item;
      });
      return filteredData.filter(
        (value, index, self) =>
          index ===
          self.findIndex((obj) => obj.channel_name === value.channel_name),
      );
    }
    return [];
  }

  @Get('channel/one')
  async getChannelDetails(@AuthUser() user_id) {
    return this.channelService.getOne({
      user_id,
      token_type: 'access_token',
      channel_name: 'amazon_us',
    });
  }
}
