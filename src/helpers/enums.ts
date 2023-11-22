export enum ChannelCodeEnum {
  amazon_us = 'amazon_us',
  google = 'google',
}

export enum CodeToChannelMapEnum {
  amazon_us = 'AMAZON US',
  google = 'Google',
}

export enum NotificationTitleEnum {
  CHANNEL_CONNECTION_STARTED = 'Initiated channel connection',
  CHANNEL_CONNECTION_FAILED = 'Connection Failed',
  CHANNEL_CONNECTION_SUCCESSFUL = 'Successfully Connected',
}

export enum NotificationDescriptionEnum {
  CHANNEL_CONNECTION_STARTED = `You've initiated the connection process with your X Account.`,
  CHANNEL_CONNECTION_FAILED = `Oops! It seems we encountered an issue while connecting to your X Account. Please check your network connection or try again later. We're here to help!`,
  CHANNEL_CONNECTION_SUCCESSFUL = 'Success! The app is now linked to your X Account.',
}

export enum NotificationTypeEnum {
  CHANNEL_CONNECTION_START = 'CHANNEL_CONNECTION_START',
  CHANNEL_CONNECTION_FAILED = 'CHANNEL_CONNECTION_FAILED',
  CHANNEL_CONNECTION_SUCCESSFUL = 'CHANNEL_CONNECTION_SUCCESSFUL',
}
