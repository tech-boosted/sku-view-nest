import { Injectable } from '@nestjs/common';
import { getEntityManager } from '@typedorm/core';
import { Reports } from 'src/entity';

@Injectable()
export class ReportsService {
  async create(body: Reports) {
    const new_record = new Reports();
    new_record.user_id = body.user_id;
    new_record.channel_name = body.channel_name;
    new_record.start_date = body.start_date;
    new_record.end_date = body.end_date;
    new_record.status = body.status;
    new_record.report_id = body.report_id;
    new_record.extras = body.extras;

    const entityManger = getEntityManager();
    return entityManger.create(new_record);
  }

  async update(updateBody: Reports) {
    const updated_record = new Reports();
    updated_record.user_id = updateBody.user_id;
    updated_record.channel_name = updateBody.channel_name;
    updated_record.start_date = updateBody.start_date;
    updated_record.end_date = updateBody.end_date;
    updated_record.status = updateBody.status;
    updated_record.report_id = updateBody.report_id;
    updated_record.extras = updateBody.extras;

    const entityManger = getEntityManager();
    return entityManger.update(
      Reports,
      {
        user_id: updateBody.user_id,
        channel_name: updateBody.channel_name,
        report_id: updateBody.report_id,
      },
      updated_record,
    );
  }
}
