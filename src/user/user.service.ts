import { Injectable } from '@nestjs/common';
import { getEntityManager } from '@typedorm/core';
import { User } from 'src/entity';
@Injectable()
export class UserService {
  create(userBody: User) {
    const new_user = new User();
    new_user.firstname = userBody.firstname;
    new_user.lastname = userBody.lastname;
    new_user.email = userBody.email;
    new_user.phone_number = userBody.phone_number;
    new_user.company = userBody.company;
    new_user.password = userBody.password;

    const entityManager = getEntityManager();

    return entityManager.create(new_user);
  }

  findByEmail(email: string) {
    const entityManager = getEntityManager();
    return entityManager.findOne(User, { email: email });
  }

  findByUserId(user_id: string) {
    const entityManager = getEntityManager();
    return entityManager.find(
      User,
      { user_id: user_id },
      {
        queryIndex: 'GSI1',
        // keyCondition: {
        //   EQ: user_id,
        // },
      },
    );
  }
}
