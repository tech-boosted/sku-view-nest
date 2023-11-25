import axios from 'axios';
import { amazon_ads_base_urls } from './constants';

interface GenerateReportProps {
  start_date: string;
  end_date: string;
  marketplace: string;
  AMAZON_CLIENT_ID: string;
  profile_id: string;
  access_token: string;
}

export const generateReport = async ({
  start_date,
  end_date,
  marketplace,
  AMAZON_CLIENT_ID,
  profile_id,
  access_token,
}: GenerateReportProps) => {
  const requestData = JSON.stringify({
    name: 'SP Report Exmaple',
    startDate: start_date,
    endDate: end_date,
    configuration: {
      adProduct: 'SPONSORED_PRODUCTS',
      groupBy: ['advertiser'],
      columns: [
        'advertisedSku',
        'impressions',
        'clicks',
        'spend',
        'sales1d',
        'date',
        'unitsSoldSameSku1d',
      ],
      reportTypeId: 'spAdvertisedProduct',
      timeUnit: 'DAILY',
      format: 'GZIP_JSON',
    },
  });

  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: amazon_ads_base_urls[marketplace] + '/reporting/reports',
    headers: {
      'Content-Type': 'application/vnd.createasyncreportrequest.v3+json',
      'Amazon-Advertising-API-ClientId': AMAZON_CLIENT_ID,
      'Amazon-Advertising-API-Scope': profile_id,
      Authorization: 'Bearer ' + access_token,
    },
    data: requestData,
  };

  console.log('creating report');

  return axios
    .request(config)
    .then((response) => {
      const reportId = response?.data.reportId;
      console.log('got report id');
      console.log('reportId: ', reportId);
      return {
        status: true,
        message: reportId,
      };
    })
    .catch(async (error) => {
      console.log('report generate failed');
      if (error?.response?.status == 401) {
        console.log('unauthorized to create report');
        return {
          status: false,
          message: 401,
        };
      } else {
        console.log('Amazon: Failed to create report');
        console.log(error?.response);
        return {
          status: false,
          message: error?.response,
        };
      }
    });
};
