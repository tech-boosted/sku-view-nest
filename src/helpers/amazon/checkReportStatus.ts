import axios from 'axios';
import { amazon_ads_base_urls } from './constants';
import { sleep } from '../functions';

interface checkReportStatusProps {
  marketplace: string;
  profile_id: string;
  access_token: string;
  report_id: string;
  AMAZON_CLIENT_ID: string;
}

export const checkReportStatus = async ({
  marketplace,
  profile_id,
  access_token,
  report_id,
  AMAZON_CLIENT_ID,
}: checkReportStatusProps) => {
  let retries = 50;
  let timeInSeconds = 0;
  let result: { status?: boolean; message?: any } = {};
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: amazon_ads_base_urls[marketplace] + '/reporting/reports/' + report_id,
    headers: {
      'Content-Type': 'application/vnd.createasyncreportrequest.v3+json',
      'Amazon-Advertising-API-ClientId': AMAZON_CLIENT_ID,
      'Amazon-Advertising-API-Scope': profile_id,
      Authorization: 'Bearer ' + access_token,
    },
  };

  while (retries > 0) {
    result = await axios
      .request(config)
      .then(async (res) => {
        console.log('report status: ', res?.data?.status);
        if (res?.data?.status === 'COMPLETED' && res?.data?.url) {
          console.log('completed: ', res?.data?.status);
          retries = 0;
          return {
            status: true,
            message: res?.data?.url,
          };
        } else if (res?.data?.status === 'FAILED' && res?.data?.failureReason) {
          retries = 0;
          console.log('failed: ', res?.data?.status);
          return {
            status: false,
            message: res?.data?.failureReason,
          };
        } else if (
          res?.data?.status === 'PENDING' ||
          res?.data?.status === 'PROCESSING'
        ) {
          console.log('Still pending: ', res?.data?.status, ' - ', retries);
          retries -= 1;
          timeInSeconds = (50 - retries) * 10000;
          await sleep(timeInSeconds);
        } else {
          return {
            status: false,
            message: res?.data,
          };
        }
      })
      .catch((err) => {
        console.error('report_id -', config.url);
        console.error('report status failed');
        retries = 0;

        if (err.response && err.response.status === 401) {
          console.log('unauthorized to create report');
          return {
            status: false,
            message: 401,
          };
        } else {
          return {
            status: false,
            message: err?.data,
          };
        }
      });
  }
  if (result?.status !== undefined) {
    return result;
  }
  console.log('retries: ', retries);
  return {
    status: false,
    message: 'Internal retry timeout',
  };
};
