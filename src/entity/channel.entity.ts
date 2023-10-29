import { Attribute, Entity, INDEX_TYPE } from '@typedorm/common';

@Entity({
  name: 'channel',
  primaryKey: {
    partitionKey: 'CHANNEL#{{user_id}}',
    sortKey: '{{channel_name}}',
  },
  indexes: {
    GSI1: {
      type: INDEX_TYPE.GSI,
      partitionKey: '{{token_type}}',
      sortKey: '{{token_type}}',
    },
  },
})
export class Channel {
  @Attribute()
  user_id: string;

  @Attribute()
  channel_name: string;

  @Attribute()
  token: string;

  @Attribute()
  token_type: string;

  @Attribute()
  profile_id: string;

  @Attribute()
  profile_name: string;
}
