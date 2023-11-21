import { Injectable } from '@nestjs/common';
import { getEntityManager } from '@typedorm/core';
import { DatesMetaData } from 'src/entity';

@Injectable()
export class DatesMetaDataService {
  async create(body: DatesMetaData) {
    const new_record = new DatesMetaData();
    new_record.user_id = body.user_id;
    new_record.channel_name = body.channel_name;
    new_record.start_date = body.start_date;
    new_record.end_date = body.end_date;

    const entityManger = getEntityManager();
    return entityManger.create(new_record);
  }

  async update(updateBody: DatesMetaData) {
    const updated_record = new DatesMetaData();
    updated_record.user_id = updateBody.user_id;
    updated_record.channel_name = updateBody.channel_name;
    updated_record.start_date = updateBody.start_date;
    updated_record.end_date = updateBody.end_date;

    const entityManger = getEntityManager();
    return entityManger.update(
      DatesMetaData,
      {
        user_id: updateBody.user_id,
        channel_name: updateBody.channel_name,
      },
      updated_record,
    );
  }

  async exists({
    user_id,
    channel_name,
  }: {
    user_id: string;
    channel_name: string;
  }) {
    const entityManger = getEntityManager();
    return entityManger.exists(DatesMetaData, {
      user_id: user_id,
      channel_name: channel_name,
    });
  }
}
