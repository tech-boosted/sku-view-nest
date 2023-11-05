import {
  Controller,
  Get,
  Headers,
  InternalServerErrorException,
  Query,
  Res,
} from '@nestjs/common';
import {
  AuthUser,
  amazon_access_token_base_urls,
  amazon_base_urls,
  getTokensFromAmazon,
  validateToken,
} from 'src/helpers';
import { AmazonService } from './amazon.service';
import { ChannelService } from '../channel';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const qs = require('qs');

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
    @Headers()
    headers,
    @Query() query,
  ) {
    const token = headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      return new InternalServerErrorException({
        message: 'Token missing',
      });
    }

    if (!query.marketplace) {
      return new InternalServerErrorException({
        message: 'Marketplace missing',
      });
    }

    const grantCodeSaved = await this.channelService.get(
      user_id,
      'grant_code',
      query.marketplace,
    );

    // Check if auth grant saved
    if (grantCodeSaved?.items?.length > 0) {
      // Check if access and refresh token already fetched
      const accessToken = await this.channelService.get(
        user_id,
        'access_token',
        query.marketplace,
      );
      const refreshToken = await this.channelService.get(
        user_id,
        'refresh_token',
        query.marketplace,
      );
      console.log('accessToken: ', accessToken);
      console.log('refreshToken: ', refreshToken);
      if (
        accessToken?.items?.length !== 0 &&
        refreshToken?.items?.length !== 0
      ) {
        return { message: 'Already linked' };
      }
    }

    const loginWithAmazonUrl =
      amazon_base_urls[query.marketplace] +
      '?client_id=' +
      this.AMAZON_CLIENT_ID +
      '&scope=advertising::campaign_management&response_type=code&state=[' +
      token +
      ',' +
      query.marketplace +
      ']&redirect_uri=' +
      this.AMAZON_REDIRECT_URL;

    return { url: loginWithAmazonUrl };
  }

  // Callback for Amazon
  @Get('/callback')
  async callbackAmazonAccount(@Query() query, @Res() response) {
    const code: string = query?.code;
    const state: string = query?.state;
    const error: string = query?.error;

    if (error) {
      console.log('error: ', error);
      return response.redirect(String(this.CLIENT_AMAZON_FAIL_URL));
    }

    const elements = state.slice(1, -1).split(',');
    const token = elements[0];
    const marketplace = elements[1];

    let user_id;
    if (token) {
      user_id = validateToken(token);
      if (!user_id) {
        return response.redirect(
          String(this.CLIENT_AMAZON_FAIL_URL + '/' + marketplace),
        );
      }
    } else {
      return response.redirect(
        String(this.CLIENT_AMAZON_FAIL_URL + '/' + marketplace),
      );
    }

    await this.channelService.create({
      user_id: user_id,
      channel_name: marketplace,
      token: code,
      token_type: 'grant_code',
      profile_id: '',
      profile_name: '',
    });

    const data = qs.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.AMAZON_REDIRECT_URL,
      client_id: this.AMAZON_CLIENT_ID,
      client_secret: this.AMAZON_CLIENT_SECRECT,
    });
    const access_token_url = amazon_access_token_base_urls[marketplace];
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

    const result = await getTokensFromAmazon(
      data,
      access_token_url,
      headers,
      this.channelService,
      user_id,
      marketplace,
    );

    console.log('result: ', result);

    if (result?.status) {
      return response.redirect(
        String(this.CLIENT_AMAZON_SUCCESS_URL + '/' + marketplace),
      );
    }
    return response.redirect(
      String(this.CLIENT_AMAZON_FAIL_URL + '/' + marketplace),
    );
  }
}
