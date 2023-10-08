import {
  Attribute,
  AutoGenerateAttribute,
  AUTO_GENERATE_ATTRIBUTE_STRATEGY,
  Entity,
  INDEX_TYPE,
} from '@typedorm/common';

@Entity({
  name: 'user',
  primaryKey: {
    partitionKey: 'USER#{{user_id}}',
    sortKey: 'PHONE_NUMBER#{{phone_number}}',
  },
  indexes: {
    GSI1: {
      type: INDEX_TYPE.GSI,
      partitionKey: 'EMAIL#{{email}}',
      sortKey: 'EMAIL#{{email}}',
    },
  },
})
export class User {
  @AutoGenerateAttribute({
    strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.UUID4,
  })
  user_id: string;

  @AutoGenerateAttribute({
    strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.ISO_DATE,
  })
  created_on: string;

  @Attribute()
  firstname: string;

  @Attribute()
  lastname: string;

  @Attribute()
  company: string;

  @Attribute()
  phone_number: string;

  @Attribute({
    unique: true,
  })
  email: string;

  @Attribute()
  password: string;
}
