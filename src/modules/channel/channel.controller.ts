import { Body, Controller, Get, Post } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { AuthUser } from 'src/helpers';
import { CreateChannelDTO } from './channel.dto';

@Controller()
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Post('channel/add')
  async create(
    @AuthUser() user_id,
    @Body()
    createChannelDTO: CreateChannelDTO,
  ) {
    return this.channelService.create(createChannelDTO, user_id);
  }

  @Get('channels')
  async listChannels(@AuthUser() user_id) {
    const results = await this.channelService.getAll(user_id);
    const keysToRemove = ['token_type', 'token'];

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
}
