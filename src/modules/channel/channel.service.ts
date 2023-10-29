import { Injectable } from '@nestjs/common';
import { getEntityManager } from '@typedorm/core';
import { Channel } from 'src/entity';
import { CreateChannelDTO } from './channel.dto';

@Injectable()
export class ChannelService {
  create(channelBody: CreateChannelDTO, user_id: string) {
    const new_channel = new Channel();
    new_channel.channel_name = channelBody.channel_name;
    new_channel.profile_id = channelBody.profile_id;
    new_channel.profile_name = channelBody.profile_name;
    new_channel.token = channelBody.token;
    new_channel.token_type = channelBody.token_type;
    new_channel.user_id = user_id;
    const entityManger = getEntityManager();

    return entityManger.create(new_channel);
  }

  getAll(user_id: string) {
    const entityManger = getEntityManager();

    return entityManger.find(Channel, {
      user_id: user_id,
    });
  }

  getTokenByChannel(channel_name: string) {
    const entityManger = getEntityManager();

    return entityManger.findOne(Channel, {
      channel_name,
    });
  }
}
