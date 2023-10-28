import { Body, Controller, Get, Post } from '@nestjs/common';
import { ChannelService } from './channel.service';

@Controller('channel')
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Post()
  async create(
    @Body()
    createChannelDTO: {
      channel_name: string;
      profile_id: string;
      profile_name: string;
      token: string;
      token_type: string;
      user_id: string;
    },
  ) {
    return this.channelService.create(createChannelDTO);
  }

  @Get()
  async getAllTokensByUserId(@Body() getAllTokensDTO: { user_id: string }) {
    return this.channelService.getAllTokensByUserId(getAllTokensDTO.user_id);
  }
}
