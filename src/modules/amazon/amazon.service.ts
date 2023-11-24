import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ChannelCodeEnum,
  formatDate,
  generatePast90DaysRanges,
  getYesterday,
} from 'src/helpers';
import { DatesMetaDataService } from '../dates-meta-data';

interface fetchSKUDataProps {
  user_id: string;
  channel_name: ChannelCodeEnum;
  profile_id: string;
}

interface fetchSKUDataForDesiredDatesProps {
  user_id: string;
  start_date: string;
  end_date: string;
  marketplace: string;
  profile_id: string;
}
@Injectable()
export class AmazonService {
  AMAZON_FILE_DOWNLOAD_PATH = process.env.AMAZON_FILE_DOWNLOAD_PATH;

  constructor(private datesMetaDataService: DatesMetaDataService) {}

  fetchSKUDataForDesiredDates = async ({
    user_id,
    start_date,
    end_date,
    marketplace,
    profile_id,
  }: fetchSKUDataForDesiredDatesProps) => {
    console.log('fetching data for: ');
    console.log('start_date: ', start_date);
    console.log('end_date: ', end_date);
    console.log('marketplace: ', marketplace);
    console.log('profile_id: ', profile_id);

    const download_path_zip = `${this.AMAZON_FILE_DOWNLOAD_PATH}/${user_id}_${start_date}_${end_date}_${marketplace}_${profile_id}.json.gz`;
    const download_path_json = `${this.AMAZON_FILE_DOWNLOAD_PATH}/${user_id}_${start_date}_${end_date}_${marketplace}_${profile_id}.json`;

    console.log(download_path_zip);
    console.log(download_path_json);

    return null;
  };

  fetchSKUData = async ({
    user_id,
    channel_name,
    profile_id,
  }: fetchSKUDataProps) => {
    console.log('user_id: ', user_id);
    console.log('channel_name: ', channel_name);
    console.log('profile_id: ', profile_id);

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
          profile_id: profile_id,
          start_date: dateObj.start_date,
          end_date: dateObj.end_date,
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
        profile_id: profile_id,
        start_date: updated_latest_date,
        end_date: yesterday,
      });

      await this.datesMetaDataService.update({
        ...result,
        end_date: yesterday,
      });
      return true;
    }
  };
}
