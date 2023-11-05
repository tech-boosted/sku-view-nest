import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Query,
  Res,
} from '@nestjs/common';
import {
  AuthUser,
  amazon_access_token_base_urls,
  amazon_ads_base_urls,
  amazon_auth_base_urls,
  amazon_country_code,
  getProfilesFromAmazon,
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
      return new BadRequestException({
        message: 'Token missing',
      });
    }

    if (!query.marketplace) {
      return new BadRequestException({
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
      amazon_auth_base_urls[query.marketplace] +
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
    const url = amazon_access_token_base_urls[marketplace];
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

    const result = await getTokensFromAmazon(url, data, headers);

    console.log('result: ', result);

    if (result?.status) {
      // If only one refresh and one access token is required for all the amazon marketplaces (handle later)
      // If there are different access tokens and refresh tokens for all the amazon marketplaces (handle later)

      await this.channelService.create({
        user_id: user_id,
        channel_name: marketplace,
        token: result?.access_token,
        token_type: 'access_token',
        profile_id: '',
        profile_name: '',
      });
      await this.channelService.create({
        user_id: user_id,
        channel_name: marketplace,
        token: result?.refresh_token,
        token_type: 'refresh_token',
        profile_id: '',
        profile_name: '',
      });

      console.log('account linked and tokens saved');
      return response.redirect(
        String(this.CLIENT_AMAZON_SUCCESS_URL + '/' + marketplace),
      );
    }
    return response.redirect(
      String(this.CLIENT_AMAZON_FAIL_URL + '/' + marketplace),
    );
  }

  @Get('profiles')
  async listProfiles(@AuthUser() user_id: string, @Query() query) {
    if (!query.marketplace) {
      return new BadRequestException({
        message: 'Marketplace missing',
      });
    }

    const channel_access_token = await this.channelService
      .get(user_id, 'access_token', query.marketplace)
      .then((res) => res.items[0].token);

    if (!channel_access_token) {
      throw new BadRequestException({
        message: 'Account not linked',
      });
    }
    const base_url = amazon_ads_base_urls[query.marketplace];
    const country_code = amazon_country_code[query.marketplace];
    const headers = {
      'Amazon-Advertising-API-ClientId': this.AMAZON_CLIENT_ID,
      Authorization: 'Bearer ' + channel_access_token,
    };

    const result = await getProfilesFromAmazon(base_url, headers, country_code);

    if (!result.status) {
      throw new BadRequestException({
        message: result?.message,
      });
    }

    return result?.message;
  }
}
