import { Injectable } from '@nestjs/common';
import { getEntityManager } from '@typedorm/core';
import { Notification } from 'src/entity';

@Injectable()
export class NotificationService {
  create(body: Notification) {
    const new_notification = new Notification();
    new_notification.user_id = body.user_id;
    new_notification.title = body.title;
    new_notification.description = body.description;
    new_notification.type = body.type;
    new_notification.read = body.read;
    new_notification.date_time = new Date().toISOString();
    const entityManger = getEntityManager();

    return entityManger.create(new_notification);
  }

  getAll(user_id: string) {
    const entityManger = getEntityManager();

    return entityManger.find(Notification, {
      user_id,
    });
  }
}
