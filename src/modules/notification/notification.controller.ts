import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthUser } from 'src/helpers';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('/all')
  async GetAllNotifications(@AuthUser() user_id: string) {
    return (await this.notificationService.getAll(user_id)).items;
  }
}
