import {
  Attribute,
  AutoGenerateAttribute,
  AUTO_GENERATE_ATTRIBUTE_STRATEGY,
  Entity,
} from '@typedorm/common';

@Entity({
  name: 'reports',
  primaryKey: {
    partitionKey: 'REPORTS#{{user_id}}',
    sortKey: '{{channel_name}}#{{report_id}}',
  },
})
export class Reports {
  @Attribute()
  user_id: string;

  @AutoGenerateAttribute({
    strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.ISO_DATE,
  })
  date_time?: string;

  @Attribute()
  start_date: string;

  @Attribute()
  end_date: string;

  @Attribute()
  report_id: string;

  @Attribute()
  channel_name: string;

  @Attribute()
  status: string;

  @Attribute()
  extras: string;
}
