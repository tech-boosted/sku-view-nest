import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Post('user')
  async create(@Body() createUserDTO: any) {
    return this.userService.create(createUserDTO);
  }

  @Get('user')
  async findOne(@Body() findByEmailDTO: { email: string }) {
    console.log('findByEmailDTO: ', findByEmailDTO);
    return this.userService.findByEmail(findByEmailDTO.email);
  }

  @Get('/userId')
  async find(@Body() findByUserIdDTO: { user_id: string }) {
    console.log('findByUserIdDTO: ', findByUserIdDTO);
    return this.userService.findByUserId(findByUserIdDTO.user_id);
  }
}
