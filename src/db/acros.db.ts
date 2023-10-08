import { INDEX_TYPE, Table } from '@typedorm/common';

export const acrosTable = new Table({
  name: 'acros',
  partitionKey: 'PK',
  sortKey: 'SK',
  indexes: {
    GSI1: {
      partitionKey: 'GSI1PK',
      sortKey: 'GSI1SK',
      type: INDEX_TYPE.GSI,
    },
  },
});
