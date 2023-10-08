import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
// import { UserInterfacer } from 'src/interfaces/user';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async create(@Body() createUserDTO: any) {
    return this.userService.create(createUserDTO);
  }

  // @Get()
  // async findAll(@Body() findByEmailDTO: any) {
  //   console.log('findByEmailDTO: ', findByEmailDTO);
  //   return this.userService.findByEmail(findByEmailDTO);
  // }
}
