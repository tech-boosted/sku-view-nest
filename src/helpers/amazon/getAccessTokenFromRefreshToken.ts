import axios from 'axios';

export const getAccessTokenFromRefreshToken = async (
  url: string,
  headers: any,
  data: any,
): Promise<{
  status: boolean;
  message: string;
}> => {
  return axios
    .post(url, data, {
      headers: headers,
    })
    .then((response) => {
      console.log('Got access token from refresh token');
      const new_access_token = response.data.access_token;
      console.log('new_access_token: ', new_access_token);
      return {
        status: true,
        message: new_access_token,
      };
    })
    .catch((error) => {
      console.log('failed access token from refresh token');
      console.log(error.response.data.error_description);
      return {
        status: false,
        message: error.response.data,
      };
    });
};
