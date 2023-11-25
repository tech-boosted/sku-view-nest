import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ChannelCodeEnum,
  formatDate,
  generatePast90DaysRanges,
  getYesterday,
  regenerateToken,
} from 'src/helpers';
import { DatesMetaDataService } from '../dates-meta-data';
import { generateReport } from 'src/helpers/amazon/generateReport';
import { ChannelService } from '../channel';

interface fetchSKUDataProps {
  user_id: string;
  channel_name: ChannelCodeEnum;
  AMAZON_CLIENT_ID: string;
  AMAZON_CLIENT_SECRECT: string;
}

interface fetchSKUDataForDesiredDatesProps {
  user_id: string;
  start_date: string;
  end_date: string;
  marketplace: string;
  AMAZON_CLIENT_ID: string;
  AMAZON_CLIENT_SECRECT: string;
}

@Injectable()
export class AmazonService {
  AMAZON_FILE_DOWNLOAD_PATH = process.env.AMAZON_FILE_DOWNLOAD_PATH;

  constructor(
    private channelService: ChannelService,
    private datesMetaDataService: DatesMetaDataService,
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
  }: fetchSKUDataForDesiredDatesProps) => {
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

    console.log('fetching data for: ');
    console.log('start_date: ', start_date);
    console.log('end_date: ', end_date);
    console.log('marketplace: ', marketplace);
    console.log('profile_id: ', channel_access_token?.profile_id);

    const download_path_zip = `${this.AMAZON_FILE_DOWNLOAD_PATH}/${user_id}_${start_date}_${end_date}_${marketplace}_${channel_access_token?.profile_id}.json.gz`;
    const download_path_json = `${this.AMAZON_FILE_DOWNLOAD_PATH}/${user_id}_${start_date}_${end_date}_${marketplace}_${channel_access_token?.profile_id}.json`;

    console.log(download_path_zip);
    console.log(download_path_json);

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
        await this.channelService.update({
          ...channel_access_token,
          token: new_access_token,
        });
      }
      return regenerateTokenResult;
    };

    const result = await this.proxyCallWithRegerateToken({
      proxyCall: generateReportWithAccessToken,
      regenerateToken: regenerateAccessTokenAndUpdate,
    });

    console.log(result);
  };

  fetchSKUData = async ({
    user_id,
    channel_name,
    AMAZON_CLIENT_ID,
    AMAZON_CLIENT_SECRECT,
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
        await this.fetchSKUDataForDesiredDates({
          user_id: user_id,
          marketplace: channel_name,
          start_date: dateObj.start_date,
          end_date: dateObj.end_date,
          AMAZON_CLIENT_ID: AMAZON_CLIENT_ID,
          AMAZON_CLIENT_SECRECT: AMAZON_CLIENT_SECRECT,
        });
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

      await this.fetchSKUDataForDesiredDates({
        user_id: user_id,
        marketplace: channel_name,
        start_date: updated_latest_date,
        end_date: yesterday,
        AMAZON_CLIENT_ID: AMAZON_CLIENT_ID,
        AMAZON_CLIENT_SECRECT: AMAZON_CLIENT_SECRECT,
      });

      await this.datesMetaDataService.update({
        ...result,
        end_date: yesterday,
      });
      return true;
    }
  };
}
