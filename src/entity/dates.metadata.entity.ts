import { Attribute, Entity } from '@typedorm/common';

@Entity({
  name: 'datesmetadata',
  primaryKey: {
    partitionKey: 'DATESMETADATA#{{user_id}}',
    sortKey: '{{channel_name}}',
  },
})
export class DatesMetaData {
  @Attribute()
  user_id: string;

  @Attribute()
  channel_name: string;

  @Attribute()
  start_date: string;

  @Attribute()
  end_date: string;
}
