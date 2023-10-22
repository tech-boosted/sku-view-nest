import { INDEX_TYPE, Table } from '@typedorm/common';

export const acrosTable = new Table({
  name: 'acros',
  partitionKey: 'PK',
  sortKey: 'SK',
  indexes: {
    LSI1: {
      type: INDEX_TYPE.LSI,
      sortKey: 'LSI1SK',
    },
    GSI1: {
      partitionKey: 'GSI1PK',
      sortKey: 'GSI1SK',
      type: INDEX_TYPE.GSI,
    },
    GSI2: {
      partitionKey: 'GSI2PK',
      sortKey: 'GSI2SK',
      type: INDEX_TYPE.GSI,
    },
  },
});
