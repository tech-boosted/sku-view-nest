import { Attribute, Entity, INDEX_TYPE } from '@typedorm/common';

export interface SkuData {
  sku: string;
  impressions: string;
  clicks: string;
  spend: string;
  sales: string;
  orders: string;
}

@Entity({
  name: 'sku',
  primaryKey: {
    partitionKey: 'SKU#{{user_id}}#{{channel_name}}',
    sortKey: '{{date}}#{{sku}}',
  },
  indexes: {
    GSI1: {
      type: INDEX_TYPE.GSI,
      partitionKey: '{{sku}}',
      sortKey: '{{date}}',
    },
    LSI1: {
      type: INDEX_TYPE.LSI,
      sortKey: '{{sku}}',
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
