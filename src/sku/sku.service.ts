import { Injectable } from '@nestjs/common';
import { getEntityManager } from '@typedorm/core';
import { Sku } from 'src/entity';
import { saveAmazonSkuData } from 'src/helpers';

export interface AmazonFile {
  date: string;
  spend: number;
  unitsSoldSameSku1d: number;
  clicks: number;
  advertisedSku: string;
  sales1d: number;
  impressions: number;
}

@Injectable()
export class SkuService {
  private AMAZON_FILE_DOWNLOAD_PATH = process.env.AMAZON_FILE_DOWNLOAD_PATH;
  // private DynamoDBTableName = process.env.DYNAMODB_TABLE_NAME;

  async create(user_id: string, channel_name: string) {
    const download_path_json = `${this.AMAZON_FILE_DOWNLOAD_PATH}/file3.json`;
    console.log('download_path_json: ', download_path_json);
    const downloaded_data: AmazonFile[] = await import(download_path_json);
    console.log('downloaded_data length: ', downloaded_data?.length);

    return saveAmazonSkuData(downloaded_data, user_id, channel_name);
  }

  async findByDate(start_date: string, end_date: string) {
    return getEntityManager().find(
      Sku,
      { user_id: '54c739e2-a276-4aec-a92e-75e05a8995ab' },
      {
        queryIndex: 'LSI1',
        keyCondition: {
          BETWEEN: [start_date, end_date],
        },
      },
    );
  }
}
