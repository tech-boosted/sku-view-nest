import { Injectable } from '@nestjs/common';
import { getEntityManager } from '@typedorm/core';
import { Channel } from 'src/entity';

interface ChannelGetAllProps {
  user_id: string;
}
interface ChannelGetAllByChannelProps {
  user_id: string;
  channel_name: string;
}
interface ChannelGetOneProps {
  user_id: string;
  token_type: string;
  channel_name: string;
}

@Injectable()
export class ChannelService {
  create(channelBody: Channel) {
    const new_channel = new Channel();
    new_channel.channel_name = channelBody.channel_name;
    new_channel.profile_id = channelBody.profile_id;
    new_channel.profile_name = channelBody.profile_name;
    new_channel.token = channelBody.token;
    new_channel.token_type = channelBody.token_type;
    new_channel.user_id = channelBody.user_id;
    const entityManger = getEntityManager();

    return entityManger.create(new_channel);
  }

  update(channelBody: Channel) {
    const entityManger = getEntityManager();

    return entityManger.update(
      Channel,
      {
        user_id: channelBody.user_id,
        channel_name: channelBody.channel_name,
        token_type: channelBody.token_type,
      },
      channelBody,
    );
  }

  getAll({ user_id }: ChannelGetAllProps) {
    const entityManger = getEntityManager();

    return entityManger.find(Channel, {
      user_id,
    });
  }

  getAllByChannel({ user_id, channel_name }: ChannelGetAllByChannelProps) {
    const entityManger = getEntityManager();

    return entityManger.find(
      Channel,
      {
        user_id,
      },
      {
        keyCondition: {
          BEGINS_WITH: channel_name,
        },
      },
    );
  }

  getOne({ user_id, token_type, channel_name }: ChannelGetOneProps) {
    const entityManger = getEntityManager();

    return entityManger.findOne(Channel, {
      user_id,
      token_type,
      channel_name,
    });
  }
}
