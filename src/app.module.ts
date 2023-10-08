import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ChannelController } from './channel/channel.controller';
import { ChannelService } from './channel/channel.service';
import { ChannelModule } from './channel/channel.module';

@Module({
  imports: [UserModule, ChannelModule],
  controllers: [AppController, ChannelController],
  providers: [AppService, ChannelService],
})
export class AppModule {}
