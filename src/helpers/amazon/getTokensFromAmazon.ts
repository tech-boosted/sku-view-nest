import axios from 'axios';
import { amazon_token_base_urls } from './constants';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const qs = require('qs');

export const getTokensFromAmazon = async (
  AMAZON_REDIRECT_URL: string,
  AMAZON_CLIENT_ID: string,
  AMAZON_CLIENT_SECRECT: string,
  code: string,
  marketplace: string,
): Promise<{
  status: boolean;
  message?: string;
  access_token?: string;
  refresh_token?: string;
}> => {
  const data = qs.stringify({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: AMAZON_REDIRECT_URL,
    client_id: AMAZON_CLIENT_ID,
    client_secret: AMAZON_CLIENT_SECRECT,
  });
  const url = amazon_token_base_urls[marketplace];
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

  return axios
    .post(url, data, { headers: headers })
    .then(async (token_response) => {
      const access_token = token_response.data.access_token;
      const refresh_token = token_response.data.refresh_token;
      return {
        status: true,
        access_token: access_token,
        refresh_token: refresh_token,
      };
    })
    .catch((err) => {
      console.log(err.response);
      return {
        status: false,
        message: err.response,
      };
    });
};
