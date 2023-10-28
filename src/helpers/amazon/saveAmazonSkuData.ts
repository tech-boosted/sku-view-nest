import { WriteBatch, getBatchManager } from '@typedorm/core';
import { Sku } from 'src/entity';
import { AmazonFile } from 'src/modules/sku/sku.service';

const batchSize = 25;
const concurrentRequests = 40;

const saveToDynamoDB = async (items: Sku[]) => {
  const batchToWrite = new WriteBatch();
  items.forEach((item) => {
    batchToWrite.addCreateItem(item);
  });

  await getBatchManager().write(batchToWrite, {
    requestsConcurrencyLimit: 10,
  });
};

export const saveAmazonSkuData = async (
  downloaded_data: AmazonFile[],
  user_id: string,
  channel_name: string,
) => {
  const mergedData = downloaded_data.reduce((result: AmazonFile[], current) => {
    const existingItem = result.find(
      (item) =>
        item.advertisedSku === current.advertisedSku &&
        item.date === current.date,
    );

    if (existingItem) {
      existingItem.spend += current.spend;
      existingItem.unitsSoldSameSku1d += current.unitsSoldSameSku1d;
      existingItem.clicks += current.clicks;
      existingItem.sales1d += current.sales1d;
      existingItem.impressions += current.impressions;
    } else {
      result.push({ ...current });
    }

    return result;
  }, []);

  console.log('mergedData length: ', mergedData?.length);

  let items: Sku[] = [];
  let batchNo = 0;
  let promises = [];

  for (let i = 0; i < mergedData.length; i++) {
    const x: AmazonFile = mergedData[i];
    const obj = new Sku();

    obj.user_id = user_id;
    obj.channel_name = channel_name;
    obj.date = x.date;
    obj.sku = x.advertisedSku;
    obj.data = {
      impressions: x.impressions.toString(),
      clicks: x.clicks.toString(),
      spend: x.spend.toString(),
      sales: x.sales1d.toString(),
      orders: x.unitsSoldSameSku1d.toString(),
    };
    items.push(obj);
    if (items.length % batchSize === 0) {
      console.log(` batch ${batchNo}`);

      promises.push(saveToDynamoDB(items));
      if (promises.length % concurrentRequests === 0) {
        console.log('\nawaiting write requests to DynamoDB\n');
        await Promise.all(promises);
        promises = [];
      }

      items = [];
      batchNo++;
    }
  }

  if (items.length > 0) {
    console.log(` batch ${batchNo}`);
    promises.push(saveToDynamoDB(items));
  }

  if (promises.length > 0) {
    console.log('\nawaiting write to DynamoDB\n');
    await Promise.all(promises).then((res) => {
      // console.log('res: ', res);
      return res;
    });
  }

  return true;
};
