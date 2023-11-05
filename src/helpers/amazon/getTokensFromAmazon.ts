import axios from 'axios';
import { ChannelService } from 'src/modules';

interface getTokensFromAmazonReturn {
  status: boolean;
  message: string;
}

export const getTokensFromAmazon = async (
  data: string,
  access_token_url: string,
  headers: any,
  channelService: ChannelService,
  user_id: string,
  marketplace: string,
): Promise<getTokensFromAmazonReturn> => {
  return axios
    .post(access_token_url, data, { headers: headers })
    .then(async (token_response) => {
      const access_token = token_response.data.access_token;
      const refresh_token = token_response.data.refresh_token;

      // If only one refresh and one access token is required for all the amazon marketplaces (handle later)
      // If there are different access tokens and refresh tokens for all the amazon marketplaces (handle later)

      await channelService.create({
        user_id: user_id,
        channel_name: marketplace,
        token: access_token,
        token_type: 'access_token',
        profile_id: '',
        profile_name: '',
      });
      await channelService.create({
        user_id: user_id,
        channel_name: marketplace,
        token: refresh_token,
        token_type: 'refresh_token',
        profile_id: '',
        profile_name: '',
      });

      console.log('account linked and tokens saved');
      return {
        status: true,
        message: 'Success',
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
