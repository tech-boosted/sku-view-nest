import { Injectable } from '@nestjs/common';
import { ChannelEnum } from 'src/helpers';
import { DatesMetaDataService } from '../dates-meta-data';

interface fetchSKUDataProps {
  user_id: string;
  channel_name: ChannelEnum;
}
@Injectable()
export class AmazonService {
  constructor(private datesMetaDataService: DatesMetaDataService) {}

  async fetchSKUData({ user_id, channel_name }: fetchSKUDataProps) {
    console.log(user_id);
    console.log(channel_name);
    const res = await this.datesMetaDataService.exists({
      user_id,
      channel_name,
    });
    console.log('res: ', res);
    if (!res) {
      await this.datesMetaDataService.create({
        user_id: user_id,
        channel_name: channel_name,
        start_date: '',
        end_date: '',
      });
    }
    return true;
  }
}
