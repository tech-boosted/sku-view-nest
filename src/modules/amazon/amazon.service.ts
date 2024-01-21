import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ChannelCodeEnum,
  ReportStatusEnum,
  checkReportStatus,
  createSQSEvent,
  downloadAndExtractReport,
  formatDate,
  generatePast90DaysRanges,
  getYesterday,
  regenerateToken,
} from 'src/helpers';
import { DatesMetaDataService } from '../dates-meta-data';
import { generateReport } from 'src/helpers/amazon/generateReport';
import { ChannelService } from '../channel';
import { ReportsService } from '../reports';
import { Reports } from 'src/entity';

interface fetchSKUDataProps {
  user_id: string;
  channel_name: ChannelCodeEnum;
  AMAZON_CLIENT_ID: string;
  AMAZON_CLIENT_SECRECT: string;
  SQS_QUEUE_URL: string;
  S3_BUCKET_NAME: string;
}

interface fetchSKUDataForDesiredDatesProps {
  user_id: string;
  start_date: string;
  end_date: string;
  marketplace: ChannelCodeEnum;
  AMAZON_CLIENT_ID: string;
  AMAZON_CLIENT_SECRECT: string;
  SQS_QUEUE_URL: string;
  S3_BUCKET_NAME: string;
}

@Injectable()
export class AmazonService {
  AMAZON_FILE_DOWNLOAD_PATH = process.env.AMAZON_FILE_DOWNLOAD_PATH;

  constructor(
    private channelService: ChannelService,
    private datesMetaDataService: DatesMetaDataService,
    private reportsService: ReportsService,
  ) {}

  proxyCallWithRegerateToken = async ({
    proxyCall,
    regenerateToken,
  }: {
    proxyCall: () => any;
    regenerateToken: () => any;
  }) => {
    const proxyCallResult = await proxyCall();

    if (!proxyCallResult?.status && proxyCallResult?.message === 401) {
      console.log('proxy call failed due to 401');
      const regenerateTokenResult = await regenerateToken();
      if (regenerateTokenResult?.status) {
        const proxyCallResult2 = await proxyCall();
        return proxyCallResult2;
      }
    }
    return proxyCallResult;
  };

  fetchSKUDataForDesiredDates = async ({
    user_id,
    start_date,
    end_date,
    marketplace,
    AMAZON_CLIENT_ID,
    AMAZON_CLIENT_SECRECT,
    SQS_QUEUE_URL,
    S3_BUCKET_NAME,
  }: fetchSKUDataForDesiredDatesProps) => {
    start_date = '2024-01-03';
    end_date = '2024-01-03';

    const channel_access_token = await this.channelService.getOne({
      user_id,
      channel_name: ChannelCodeEnum.amazon_us,
      token_type: 'access_token',
    });
    const channel_refresh_token = await this.channelService.getOne({
      user_id,
      channel_name: ChannelCodeEnum.amazon_us,
      token_type: 'refresh_token',
    });

    console.log('fetching data for: ', start_date, ' - ', end_date);

    const generateReportWithAccessToken = async () => {
      const latest_channel_access_token = await this.channelService.getOne({
        user_id,
        channel_name: ChannelCodeEnum.amazon_us,
        token_type: 'access_token',
      });
      return generateReport({
        start_date: start_date,
        end_date: end_date,
        marketplace: marketplace,
        profile_id: latest_channel_access_token?.profile_id,
        access_token: latest_channel_access_token?.token,
        AMAZON_CLIENT_ID: AMAZON_CLIENT_ID,
      });
    };

    const regenerateAccessTokenAndUpdate = async () => {
      const regenerateTokenResult = await regenerateToken({
        AMAZON_CLIENT_ID: AMAZON_CLIENT_ID,
        AMAZON_CLIENT_SECRECT: AMAZON_CLIENT_SECRECT,
        marketplace: marketplace,
        refreshToken: channel_refresh_token.token,
      });

      if (regenerateTokenResult?.status) {
        const new_access_token = regenerateTokenResult?.message;
        console.log('Updating access token in db');
        await this.channelService.update({
          ...channel_access_token,
          token: new_access_token,
        });
      }
      return regenerateTokenResult;
    };

    const generateReportResult = await this.proxyCallWithRegerateToken({
      proxyCall: generateReportWithAccessToken,
      regenerateToken: regenerateAccessTokenAndUpdate,
    });

    if (!generateReportResult?.status) {
      console.log('Create report failed');
      await this.reportsService.create({
        user_id,
        start_date,
        end_date,
        report_id: '',
        channel_name: marketplace,
        status: ReportStatusEnum.FALIED,
        extras: generateReportResult?.message,
      });
      return false;
    }

    const created_report_info = await this.reportsService.create({
      user_id,
      start_date,
      end_date,
      report_id: generateReportResult?.message,
      channel_name: marketplace,
      status: ReportStatusEnum.PENDING,
      extras: '',
    });

    console.log('created_report_info: ', created_report_info);

    const latest_channel_access_token = await this.channelService.getOne({
      user_id,
      channel_name: ChannelCodeEnum.amazon_us,
      token_type: 'access_token',
    });

    const sqs_body = {
      marketplace: marketplace,
      profile_id: channel_refresh_token?.profile_id,
      access_token: latest_channel_access_token?.token,
      refresh_token: channel_refresh_token?.token,
      report_id: generateReportResult?.message,
      AMAZON_CLIENT_ID: AMAZON_CLIENT_ID,
      AMAZON_CLIENT_SECRECT: AMAZON_CLIENT_SECRECT,
      s3_bucket: S3_BUCKET_NAME,
      start_date: start_date,
      end_date: end_date,
      client_base_url: 'http://localhost:3001',
      channel_info: latest_channel_access_token,
      report_info: created_report_info,
    };

    console.log('sqs_body: ', sqs_body);
    console.log('SQS_QUEUE_URL: ', SQS_QUEUE_URL);

    // await createSQSEvent({
    //   sqs_queue_url: SQS_QUEUE_URL,
    //   sqs_body: sqs_body,
    // });

    // return true;
    return false;
  };

  fetchSKUData = async ({
    user_id,
    channel_name,
    AMAZON_CLIENT_ID,
    AMAZON_CLIENT_SECRECT,
    SQS_QUEUE_URL,
    S3_BUCKET_NAME,
  }: fetchSKUDataProps) => {
    console.log('user_id: ', user_id);
    console.log('channel_name: ', channel_name);

    const recordExists = await this.datesMetaDataService.exists({
      user_id,
      channel_name,
    });
    console.log('recordExists: ', recordExists);
    if (!recordExists) {
      // First time fetch after connecting channel
      const datesArray = generatePast90DaysRanges();

      datesArray.forEach(async (dateObj) => {
        const fetchSKUDataResult = await this.fetchSKUDataForDesiredDates({
          user_id: user_id,
          marketplace: channel_name,
          start_date: dateObj.start_date,
          end_date: dateObj.end_date,
          AMAZON_CLIENT_ID: AMAZON_CLIENT_ID,
          AMAZON_CLIENT_SECRECT: AMAZON_CLIENT_SECRECT,
          SQS_QUEUE_URL,
          S3_BUCKET_NAME,
        });
        if (!fetchSKUDataResult) {
          return false;
        }
      });

      await this.datesMetaDataService.create({
        user_id: user_id,
        channel_name: channel_name,
        start_date: datesArray[0].start_date,
        end_date: datesArray[2].end_date,
      });

      return true;
    } else {
      // Not the first time
      const result = await this.datesMetaDataService.findOne({
        user_id: user_id,
        channel_name: channel_name,
      });

      if (!result.end_date) {
        throw new BadRequestException({
          message: 'Something went wrong',
        });
      }

      const yesterday = formatDate(getYesterday());

      if (formatDate(new Date(result.end_date)) === yesterday) {
        console.log('already latest data');
        return true;
      }

      console.log('db latest date: ', result.end_date);
      const latestDateObj = new Date(result?.end_date);
      const currentTimestamp = latestDateObj.getTime();
      const nextTimestamp = currentTimestamp + 24 * 60 * 60 * 1000;
      const nextDate = new Date(nextTimestamp);
      const nextDateString = nextDate.toISOString().slice(0, 10);
      const updated_latest_date = nextDateString;

      console.log('updated start date: ', updated_latest_date);

      const fetchSkuDataResult = await this.fetchSKUDataForDesiredDates({
        user_id: user_id,
        marketplace: channel_name,
        start_date: updated_latest_date,
        end_date: yesterday,
        AMAZON_CLIENT_ID: AMAZON_CLIENT_ID,
        AMAZON_CLIENT_SECRECT: AMAZON_CLIENT_SECRECT,
        SQS_QUEUE_URL,
        S3_BUCKET_NAME,
      });

      if (!fetchSkuDataResult) {
        return false;
      }

      await this.datesMetaDataService.update({
        ...result,
        end_date: yesterday,
      });
      return true;
    }
  };
}
