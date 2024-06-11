import {
  Attribute,
  AutoGenerateAttribute,
  AUTO_GENERATE_ATTRIBUTE_STRATEGY,
  Entity,
} from '@typedorm/common';

@Entity({
  name: 'catalog',
  primaryKey: {
    partitionKey: 'CATALOG#{{user_id}}',
    sortKey: '{{title}}#{{date_time}}',
  },
})
export class Catalog {
  @Attribute()
  user_id?: string;

  @AutoGenerateAttribute({
    strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.ISO_DATE,
  })
  date_time?: string;

  @Attribute()
  id?: number;

  @Attribute()
  customer_id?: number;

  @Attribute()
  sku?: string;

  @Attribute()
  title?: string;

  @Attribute()
  cogs?: number;

  @Attribute()
  delivery_cost?: number;

  @Attribute()
  referral_marketing_fees?: number;

  @Attribute()
  storage_fees?: number;

  @Attribute()
  selling_price?: number;
}
