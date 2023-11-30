import axios from 'axios';
import { amazon_ads_base_urls } from './constants';
import { sleep } from '../functions';

export const checkReportStatus = async ({
  marketplace,
  profile_id,
  access_token,
  report_id,
  AMAZON_CLIENT_ID,
}) => {
  let retries = 50;
  const timeInSeconds = (51 - retries) * 10000;
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
    await axios
      .request(config)
      .then(async (res) => {
        if (res?.data?.status === 'COMPLETED' && res?.data?.url) {
          retries = 0;
          return {
            status: true,
            message: res?.data?.url,
          };
        } else if (res?.data?.status === 'FAILED' && res?.data?.failureReason) {
          retries = 0;
          return {
            status: false,
            message: res?.data?.failureReason,
          };
        } else if (res?.data?.status === 'PENDING') {
          console.log('Still pending: ', retries);
          retries -= 1;
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
        }
      });
  }
  console.log('retries: ', retries);
  return {
    status: false,
    message: 'Internal retry timeout',
  };
};
