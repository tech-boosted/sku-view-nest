import {
  Body,
  Controller,
  Get,
  Headers,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { AuthUser, amazon_base_urls, validateToken } from 'src/helpers';
import { LinkAmazonAccountDTO } from './amazon.dto';
import { AmazonService } from './amazon.service';
import { ChannelService } from '../channel';

@Controller('amazon')
export class AmazonController {
  AMAZON_CLIENT_ID = process.env.AMAZON_CLIENT_ID;
  AMAZON_REDIRECT_URL = process.env.AMAZON_REDIRECT_URL;
  AMAZON_CLIENT_SECRECT = process.env.AMAZON_CLIENT_SECRECT;
  CLIENT_AMAZON_SUCCESS_URL = process.env.CLIENT_AMAZON_SUCCESS_URL;
  CLIENT_AMAZON_FAIL_URL = process.env.CLIENT_AMAZON_FAIL_URL;

  constructor(
    private amazonService: AmazonService,
    private channelService: ChannelService,
  ) {}

  @Get('/link')
  async linkAccount(
    @AuthUser() user_id: string,
    @Body()
    linkAmazonAccountDTO: LinkAmazonAccountDTO,
    @Headers() headers,
  ) {
    const token = headers?.authorization?.replace('Bearer ', '');
    console.log(token);
    if (!token) {
      return new InternalServerErrorException({
        message: 'Token invalid',
      });
    }

    const loginWithAmazonUrl =
      amazon_base_urls[linkAmazonAccountDTO.marketplace] +
      '?client_id=' +
      this.AMAZON_CLIENT_ID +
      '&scope=advertising::campaign_management&response_type=code&state=[' +
      token +
      ',' +
      linkAmazonAccountDTO.marketplace +
      ']&redirect_uri=' +
      this.AMAZON_REDIRECT_URL;

    return { url: loginWithAmazonUrl };
  }

  // Callback for Amazon
  @Get('/callback')
  async callbackAmazonAccount(@Query() query) {
    const code: string = query?.code;
    const state: string = query?.state;
    const error: string = query?.error;
    console.log('query: ', query);

    console.log(code);
    console.log(state);
    console.log(error);
    if (error) {
      console.log(error);
      return;
      //   return response.redirect(String(this.CLIENT_AMAZON_FAIL_URL));
    }

    const cleanedString = state.slice(1, -1);
    const elements = cleanedString.split(',');

    const token = elements[0];
    const marketplace = elements[1];

    let user_id;
    if (token) {
      user_id = validateToken(token);
    }
    // if (user_id && marketplace) {
    //   this.channelService.create(
    //     {
    //       channel_name: marketplace,
    //       token: access_token,
    //       token_type: 'access_token',
    //       profile_id: profile_id,
    //       profile_name: profile_name,
    //     },
    //     user_id,
    //   );
    //   this.channelService.create(
    //     {
    //       channel_name: marketplace,
    //       token: refresh_token,
    //       token_type: 'refresh_token',
    //       profile_id: profile_id,
    //       profile_name: profile_name,
    //     },
    //     user_id,
    //   );
    // }

    // try {

    //   let selectedUser = await validateToken(token, this.userRepository);

    //   let data = qs.stringify({
    //     grant_type: 'authorization_code',
    //     code: code,
    //     redirect_uri: AMAZON_REDIRECT_URL,
    //     client_id: AMAZON_CLIENT_ID,
    //     client_secret: AMAZON_CLIENT_SECRECT,
    //   });
    //   let access_token_url = amazon_access_token_base_urls[marketplace];
    //   let headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

    //   await axios
    //     .post(access_token_url, data, { headers: headers })
    //     .then(async (token_response) => {
    //       var access_token = token_response.data.access_token;
    //       var refresh_token = token_response.data.refresh_token;

    //       let customer_id = selectedUser?.customer_id;

    //       // If only one refresh and one access token is required for all the amazon marketplaces
    //       // let tokensInsertedData = updateTokensOfAllAmazons(
    //       //   access_token,
    //       //   refresh_token,
    //       // );
    //       // let updatedChannel = await this.channelsRepository.updateAll(
    //       //   tokensInsertedData,
    //       //   {
    //       //     customer_id: customer_id,
    //       //   },
    //       // );

    //       // If there are different access tokens and refresh tokens for all the amazon marketplaces
    //       let updatedChannel = await this.channelsRepository.updateAll(
    //         {
    //           [marketplace_refresh_token]: refresh_token,
    //           [marketplace_access_token]: access_token,
    //           [marketplace_connected]: true,
    //         },
    //         {
    //           customer_id: customer_id,
    //         },
    //       );

    //       if (updatedChannel.count === 1) {
    //         console.log('Successfully updated access/refresh token');
    //         return response.redirect(
    //           String(CLIENT_AMAZON_SUCCESS_URL + '/' + marketplace),
    //         );
    //       } else {
    //         console.log('Failed to update access/refresh token');
    //         return response.redirect(
    //           String(CLIENT_AMAZON_FAIL_URL + '/' + marketplace),
    //         );
    //       }
    //     })
    //     .catch((err) => {
    //       console.log(err.response);
    //       return response.redirect(
    //         String(CLIENT_AMAZON_FAIL_URL + '/' + marketplace),
    //       );
    //     });
    // } catch (err) {
    //   console.log(err);
    //   return response.redirect(String(CLIENT_AMAZON_FAIL_URL));
    // }
    return null;
  }
}
