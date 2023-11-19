import {
  Attribute,
  AutoGenerateAttribute,
  AUTO_GENERATE_ATTRIBUTE_STRATEGY,
  Entity,
} from '@typedorm/common';

@Entity({
  name: 'notification',
  primaryKey: {
    partitionKey: 'NOTIFICATION#{{user_id}}',
    sortKey: '{{date_time}}',
  },
})
export class Notification {
  @Attribute()
  user_id?: string;

  @AutoGenerateAttribute({
    strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.ISO_DATE,
  })
  date_time?: string;

  @Attribute()
  title: string;

  @Attribute()
  description: string;

  @Attribute()
  type: string;

  @Attribute()
  read: boolean;
}
