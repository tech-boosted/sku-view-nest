import {
  Attribute,
  AutoGenerateAttribute,
  AUTO_GENERATE_ATTRIBUTE_STRATEGY,
  Entity,
} from '@typedorm/common';

@Entity({
  name: 'user',
  primaryKey: {
    partitionKey: '{{email}}',
    sortKey: '{{email}}',
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
