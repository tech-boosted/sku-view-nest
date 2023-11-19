import { IsNotEmpty } from 'class-validator';

export class CreateChannelDTO {
  @IsNotEmpty()
  channel_name: string;

  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  token_type: string;

  @IsNotEmpty()
  profile_id: string;

  @IsNotEmpty()
  profile_name: string;
}
