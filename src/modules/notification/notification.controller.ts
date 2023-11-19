import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('/all')
  async GetAllNotifications(user_id: string) {
    return this.notificationService.getAll(user_id);
  }
}
