import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ChannelController } from './channel/channel.controller';
import { ChannelService } from './channel/channel.service';
import { ChannelModule } from './channel/channel.module';
import { SkuController } from './sku/sku.controller';
import { SkuService } from './sku/sku.service';
import { SkuModule } from './sku/sku.module';

@Module({
  imports: [UserModule, ChannelModule, SkuModule],
  controllers: [AppController, ChannelController, SkuController],
  providers: [AppService, ChannelService, SkuService],
})
export class AppModule {}
