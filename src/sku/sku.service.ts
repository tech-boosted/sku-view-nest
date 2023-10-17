import { Injectable } from '@nestjs/common';
import { WriteBatch, getBatchManager } from '@typedorm/core';
import { Sku } from 'src/entity/sku.entity';
// import { writeFileSync } from 'fs';
// import * as AWS from 'aws-sdk';

const batchSize = 25;
const concurrentRequests = 40;

export interface AmazonFile {
  date: string;
  spend: number;
  unitsSoldSameSku1d: number;
  clicks: number;
  advertisedSku: string;
  sales1d: number;
  impressions: number;
}

// AWS.config.update({
//   region: 'us-east-2',
// });
// const dynamodb = new AWS.DynamoDB.DocumentClient();

@Injectable()
export class SkuService {
  private AMAZON_FILE_DOWNLOAD_PATH = process.env.AMAZON_FILE_DOWNLOAD_PATH;
  // private DynamoDBTableName = process.env.DYNAMODB_TABLE_NAME;

  async saveToDynamoDB(items: Sku[]) {
    const batchToWrite = new WriteBatch();
    items.forEach((item) => {
      batchToWrite.addCreateItem(item);
    });
    // const putReqs = items.map((item) => ({
    //   PutRequest: {
    //     Item: item,
    //   },
    // }));
    // const req = {
    //   RequestItems: {
    //     [this.DynamoDBTableName]: putReqs,
    //   },
    // };

    // console.log('req: ', req.RequestItems[this.DynamoDBTableName]);

    // await dynamodb.batchWrite(req).promise();

    await getBatchManager().write(batchToWrite, {
      requestsConcurrencyLimit: 10,
    });
  }

  async create(skuDataDTO: any, user_id: string, channel_name: string) {
    console.log('skuDataDTO: ', skuDataDTO);
    // const skuData = new Sku();
    // const skuData1 = new Sku();
    // skuData.user_id = user_id;
    // skuData.channel_name = channel_name;
    // skuData.date = skuDataDTO.date;
    // skuData.sku = skuDataDTO.sku;
    // skuData.data = {
    //   sku: skuDataDTO.sku,
    //   impressions: skuDataDTO.impressions,
    //   clicks: skuDataDTO.clicks,
    //   spend: skuDataDTO.spend,
    //   sales: skuDataDTO.sales,
    //   orders: skuDataDTO.orders,
    // };
    // skuData1.user_id = user_id;
    // skuData1.channel_name = channel_name;
    // skuData1.date = '2023-10-22';
    // skuData1.sku = 'myskubatch2';

    // const batchToWrite = new WriteBatch()
    //   .addCreateItem(skuData)
    //   .addCreateItem(skuData1);

    const download_path_json = `${this.AMAZON_FILE_DOWNLOAD_PATH}/file1.json`;
    console.log('download_path_json: ', download_path_json);
    const downloaded_data: AmazonFile[] = await import(download_path_json);
    console.log('downloaded_data length: ', downloaded_data?.length);

    const mergedData = downloaded_data.reduce(
      (result: AmazonFile[], current) => {
        const existingItem = result.find(
          (item) => item.advertisedSku === current.advertisedSku,
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
      },
      [],
    );

    console.log('mergedData length: ', mergedData?.length);

    // writeFileSync('output.json', JSON.stringify(mergedData));

    let items: Sku[] = [];
    let batchNo = 0;
    let promises = [];

    for (let i = 0; i < mergedData.length; i++) {
      const x: AmazonFile = mergedData[i];
      const obj = new Sku();

      obj.user_id = user_id;
      obj.sku = x.advertisedSku;
      obj.date = x.date;
      obj.channel_name = channel_name;
      obj.data = {
        sku: x.advertisedSku,
        impressions: x.impressions.toString(),
        clicks: x.clicks.toString(),
        spend: x.spend.toString(),
        sales: x.sales1d.toString(),
        orders: x.unitsSoldSameSku1d.toString(),
      };
      items.push(obj);
      if (items.length % batchSize === 0) {
        console.log(` batch ${batchNo}`);

        promises.push(this.saveToDynamoDB(items));
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
      promises.push(this.saveToDynamoDB(items));
    }

    if (promises.length > 0) {
      console.log('\nawaiting write to DynamoDB\n');
      return Promise.all(promises);
    }

    // return getEntityManager().create(skuData);
    // return getBatchManager().write(batchToWrite);
    return true;
  }

  findByDate(date: any) {
    return date;
  }
}
