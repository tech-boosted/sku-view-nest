import { Injectable } from '@nestjs/common';
import { User } from 'src/interfaces/user';

@Injectable()
export class UserService {
  private readonly users: User[] = [
    {
      name: 'Shahbaz',
    },
  ];

  create(newUser: User) {
    this.users.push(newUser);
  }

  findAll(): User[] {
    return this.users;
  }
}
