import { Attribute, Entity, INDEX_TYPE } from '@typedorm/common';

export interface SkuData {
  impressions: string;
  clicks: string;
  spend: string;
  sales: string;
  orders: string;
}

@Entity({
  name: 'sku',
  primaryKey: {
    partitionKey: 'SKU#{{user_id}}',
    sortKey: '{{channel_name}}#{{sku}}#{{date}}',
  },
  indexes: {
    LSI1: {
      type: INDEX_TYPE.LSI,
      sortKey: '{{date}}',
    },
    GSI1: {
      type: INDEX_TYPE.GSI,
      partitionKey: '{{user_id}}#{{sku}}',
      sortKey: '{{date}}',
    },
    GSI2: {
      type: INDEX_TYPE.GSI,
      partitionKey: '{{user_id}}#{{channel_name}}',
      sortKey: '{{date}}',
    },
  },
})
export class Sku {
  @Attribute()
  user_id: string;

  @Attribute()
  channel_name: string;

  @Attribute()
  date: string;

  @Attribute()
  sku: string;

  @Attribute()
  data: SkuData;
}
