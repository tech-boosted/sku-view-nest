import axios from 'axios';
import { amazon_ads_base_urls, amazon_country_code } from './constants';

export const getProfilesFromAmazon = async (
  marketplace: string,
  channel_access_token: string,
  AMAZON_CLIENT_ID: string,
): Promise<{
  status: boolean;
  message: string | number | any[];
}> => {
  const base_url = amazon_ads_base_urls[marketplace];
  const country_code = amazon_country_code[marketplace];
  const headers = {
    'Amazon-Advertising-API-ClientId': AMAZON_CLIENT_ID,
    Authorization: 'Bearer ' + channel_access_token,
  };

  return axios
    .get(base_url + '/v2/profiles', { headers: headers })
    .then((res) => {
      console.log('Got profiles');
      const all_profiles_for_selected_country = [];
      for (let i = 0; i < res?.data.length; i++) {
        const element = res?.data[i];
        if (element['countryCode'] === country_code) {
          all_profiles_for_selected_country.push(element);
        }
      }
      return {
        status: true,
        message: all_profiles_for_selected_country,
      };
    })
    .catch((err) => {
      console.log(err?.response?.data);

      if (err.response.status == 401) {
        // access_token expired
        console.log('token expired 401');
        return { status: false, message: err.response.status };
      } else {
        return {
          status: false,
          message: err.response.status,
        };
      }
    });
};
