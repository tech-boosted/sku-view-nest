import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  AuthUser,
  amazon_auth_base_urls,
  getProfilesFromAmazon,
  getTokensFromAmazon,
  regenerateToken,
  validateToken,
} from 'src/helpers';
import { AmazonService } from './amazon.service';
import { ChannelService } from '../channel';

interface AmazonSetProfileRequestBody {
  profile_id: string;
  profile_name: string;
}
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

    const grantCodeSaved = await this.channelService.getOne({
      user_id,
      token_type: 'grant_code',
      channel_name: query.marketplace,
    });

    // Check if auth grant saved
    if (grantCodeSaved?.channel_name) {
      // Check if access and refresh token already fetched
      const accessToken = await this.channelService.getOne({
        user_id,
        token_type: 'access_token',
        channel_name: query.marketplace,
      });
      const refreshToken = await this.channelService.getOne({
        user_id,
        token_type: 'refresh_token',
        channel_name: query.marketplace,
      });
      if (accessToken && refreshToken) {
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

    const result = await getTokensFromAmazon(
      this.AMAZON_REDIRECT_URL,
      this.AMAZON_CLIENT_ID,
      this.AMAZON_CLIENT_SECRECT,
      code,
      marketplace,
    );

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

  @Get('/profiles')
  async listProfiles(@AuthUser() user_id: string, @Query() query) {
    if (!query.marketplace) {
      return new BadRequestException({
        message: 'Marketplace missing',
      });
    }

    const channel_access_token = await this.channelService
      .getOne({
        user_id,
        token_type: 'access_token',
        channel_name: query.marketplace,
      })
      .then((res) => res?.token);

    if (!channel_access_token) {
      throw new BadRequestException({
        message: 'Account not linked',
      });
    }

    const result = await getProfilesFromAmazon(
      query?.marketplace,
      channel_access_token,
      this.AMAZON_CLIENT_ID,
    );

    if (!result.status) {
      if (result.message === 401) {
        const channel_info = await this.channelService.getOne({
          user_id,
          token_type: 'refresh_token',
          channel_name: query.marketplace,
        });

        const channel_refresh_token = channel_info?.token;

        const regenerateTokenResult = await regenerateToken({
          AMAZON_CLIENT_ID: this.AMAZON_CLIENT_ID,
          AMAZON_CLIENT_SECRECT: this.AMAZON_CLIENT_SECRECT,
          marketplace: query.marketplace,
          refreshToken: channel_refresh_token,
        });

        if (regenerateTokenResult?.status) {
          const new_access_token = regenerateTokenResult?.message;
          await this.channelService.update({
            user_id,
            token: new_access_token,
            token_type: 'access_token',
            channel_name: query.marketplace,
            profile_id: channel_info?.profile_id,
            profile_name: channel_info?.profile_name,
          });

          const profiles_result = await getProfilesFromAmazon(
            query?.marketplace,
            new_access_token,
            this.AMAZON_CLIENT_ID,
          );

          if (profiles_result?.status) {
            return profiles_result?.message;
          }

          throw new BadRequestException({
            message: profiles_result?.message,
          });
        }
      }

      throw new BadRequestException({
        message: result?.message,
      });
    }

    return result?.message;
  }

  @Post('/setProfile')
  async setProfile(
    @AuthUser() user_id: string,
    @Query() query: { marketplace: string },
    @Body() requestBody: AmazonSetProfileRequestBody,
  ) {
    if (
      !requestBody?.profile_id?.length ||
      !requestBody?.profile_name?.length ||
      !query?.marketplace?.length
    ) {
      throw new BadRequestException({
        status: false,
        message: 'Missing parameters',
      });
    }

    const prevRecords = await this.channelService.getAllByChannel({
      user_id,
      channel_name: query?.marketplace,
    });

    if (!prevRecords?.items?.length) {
      throw new BadRequestException({
        status: false,
        message: 'Channel not linked',
      });
    }

    try {
      prevRecords?.items?.forEach(async (item) => {
        await this.channelService.update({
          user_id: item?.user_id,
          channel_name: item?.channel_name,
          token: item?.token,
          token_type: item?.token_type,
          profile_id: requestBody?.profile_id,
          profile_name: requestBody?.profile_name,
        });
      });
      return {
        status: true,
        message: 'Updated',
      };
    } catch (err) {
      throw new BadRequestException({
        status: false,
        message: err,
      });
    }
  }
}
