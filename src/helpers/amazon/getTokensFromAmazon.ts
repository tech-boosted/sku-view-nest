import axios from 'axios';

export const getTokensFromAmazon = async (
  url: string,
  data: string,
  headers: any,
): Promise<{
  status: boolean;
  message?: string;
  access_token?: string;
  refresh_token?: string;
}> => {
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
