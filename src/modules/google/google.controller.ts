import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Query,
  Res,
} from '@nestjs/common';
import { GoogleService } from './google.service';
import { ChannelService } from '../channel';
import {
  AuthUser,
  google_auth_url,
  google_scope_url,
  validateToken,
} from 'src/helpers';
import { google } from 'googleapis';

@Controller('google')
export class GoogleController {
  GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  GOOGLE_REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL;
  CLIENT_GOOGLE_SUCCESS_URL = process.env.CLIENT_GOOGLE_SUCCESS_URL;
  CLIENT_GOOGLE_FAIL_URL = process.env.CLIENT_GOOGLE_FAIL_URL;

  oauth2Client = new google.auth.OAuth2(
    this.GOOGLE_CLIENT_ID,
    this.GOOGLE_CLIENT_SECRET,
    this.GOOGLE_REDIRECT_URL,
  );

  constructor(
    private googleService: GoogleService,
    private channelService: ChannelService,
  ) {}

  //Generate Login with Amazon URL
  @Get('/link')
  async linkGoogleAccount(
    @AuthUser() user_id: string,
    @Headers()
    headers,
  ) {
    const token = headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      return new BadRequestException({
        message: 'Token missing',
      });
    }

    // Check if access and refresh token already fetched
    const accessToken = await this.channelService.getOne({
      user_id,
      token_type: 'access_token',
      channel_name: 'google',
    });

    const refreshToken = await this.channelService.getOne({
      user_id,
      token_type: 'refresh_token',
      channel_name: 'google',
    });
    if (accessToken && refreshToken) {
      return { message: 'Already linked' };
    }

    const loginWithGoogleUrl =
      google_auth_url +
      '?scope=' +
      google_scope_url +
      '&access_type=offline&include_granted_scopes=true&response_type=code&state=' +
      token +
      '&redirect_uri=' +
      this.GOOGLE_REDIRECT_URL +
      '&client_id=' +
      this.GOOGLE_CLIENT_ID;

    //https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/adwords&
    //access_type=offline&include_granted_scopes=true&response_type=code&state={}&redirect_uri={{REDIRECT_URI}}&client_id={{CLIENT_ID}}
    return { url: loginWithGoogleUrl };
  }

  @Get('/callback')
  async callbackGoogleAccount(@Query() query, @Res() response) {
    const code: string = query?.code;
    const state: string = query?.state;
    const error: string = query?.error;

    console.log('code: ', code);
    console.log('state: ', state);
    console.log('error: ', error);

    if (error) {
      console.log('error: ', error);
      return response.redirect(String(this.CLIENT_GOOGLE_FAIL_URL));
    }

    const token = state;

    let user_id: string;
    if (token) {
      user_id = validateToken(token);
      console.log('user_id: ', user_id);
      if (!user_id) {
        return response.redirect(String(this.CLIENT_GOOGLE_FAIL_URL));
      }
    } else {
      return response.redirect(String(this.CLIENT_GOOGLE_FAIL_URL));
    }

    await this.channelService.create({
      user_id: user_id,
      channel_name: 'google',
      token: code,
      token_type: 'grant_code',
      profile_id: '',
      profile_name: '',
    });

    const credTokens = {
      access_token: '',
      refresh_token: '',
    };
    try {
      const result = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(result.tokens);

      credTokens.access_token = result.tokens.access_token;
      credTokens.refresh_token = result.tokens.refresh_token;
    } catch (err) {
      return new BadRequestException({
        message: err,
      });
    }

    const access_token = credTokens.access_token;
    const refresh_token = credTokens.refresh_token;

    if (access_token && refresh_token) {
      await this.channelService.create({
        user_id: user_id,
        channel_name: 'google',
        token: access_token,
        token_type: 'access_token',
        profile_id: '',
        profile_name: '',
      });
      await this.channelService.create({
        user_id: user_id,
        channel_name: 'google',
        token: refresh_token,
        token_type: 'refresh_token',
        profile_id: '',
        profile_name: '',
      });

      console.log('account linked and tokens saved');
      return response.redirect(String(this.CLIENT_GOOGLE_SUCCESS_URL));
    }
    return response.redirect(String(this.CLIENT_GOOGLE_FAIL_URL));
  }
}
