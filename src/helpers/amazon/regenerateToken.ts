import axios from 'axios';
import { amazon_token_base_urls } from './constants';
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const qs = require('qs');

export const regenerateToken = async ({
  marketplace,
  refreshToken,
  AMAZON_CLIENT_ID,
  AMAZON_CLIENT_SECRECT,
}: {
  marketplace: string;
  refreshToken: string;
  AMAZON_CLIENT_ID: string;
  AMAZON_CLIENT_SECRECT: string;
}): Promise<{
  status: boolean;
  message: string;
}> => {
  const data = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: AMAZON_CLIENT_ID,
    client_secret: AMAZON_CLIENT_SECRECT,
  });

  const url = amazon_token_base_urls[marketplace];
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  return axios
    .post(url, data, { headers: headers })
    .then((response) => {
      console.log('Got access token from refresh token');
      const new_access_token = response?.data?.access_token;
      // console.log('new_access_token: ', new_access_token);
      return {
        status: true,
        message: new_access_token,
      };
    })
    .catch((error) => {
      console.log('failed access token from refresh token');
      console.log(error?.response?.data?.error_description);
      return {
        status: false,
        message: error?.response?.data,
      };
    });
};
