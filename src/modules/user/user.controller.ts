import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO, LoginDTO } from './user.dto';
import { User } from 'src/entity';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Controller()
export class UserController {
  private secretKey: jwt.Secret = process.env.SECRETKEY;
  private tokenExpiryTime = process.env.TOKENEXPIRYTIME;
  constructor(private userService: UserService) {}

  @Post('user/register')
  async create(@Body() createUserDTO: CreateUserDTO) {
    const existingUser = await this.userService.findByEmail(
      createUserDTO?.email,
    );

    if (existingUser) {
      throw new BadRequestException({
        message: 'Email Already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDTO.password, salt);

    const user: User = {
      firstname: createUserDTO?.firstname,
      lastname: createUserDTO?.lastname,
      company: createUserDTO?.company,
      phone_number: createUserDTO?.phone_number,
      email: createUserDTO?.email,
      password: hashedPassword,
    };

    const newUser: any = await this.userService.create(user);
    if (!newUser) {
      throw new InternalServerErrorException();
    }

    const payload = { user: { id: newUser?.user_id } };
    const token = jwt.sign(payload, this.secretKey, {
      expiresIn: this.tokenExpiryTime,
    });

    const userInfo = {
      firstname: newUser?.firstname,
      lastname: newUser?.lastname,
      company: newUser?.company,
      phone_number: newUser?.phone_number,
      email: newUser?.email,
    };

    return { token, userInfo };
  }

  @Post('user/login')
  async login(@Body() loginDTO: LoginDTO) {
    const result = await this.userService.findByEmail(loginDTO.email);
    if (!result) {
      throw new NotFoundException('Email not registered');
    }
    const isMatch = await bcrypt.compare(loginDTO.password, result.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid Password');
    }

    const userInfo = {
      firstname: result.firstname,
      lastname: result.lastname,
      company: result.company,
      phone_number: result.phone_number,
      email: result.email,
    };

    const payload = { user: { id: result.user_id } };
    const token = jwt.sign(payload, this.secretKey, {
      expiresIn: this.tokenExpiryTime,
    });
    return { token, userInfo };
  }

  @Get('user')
  async findByEmail(@Body() findByEmailDTO: { email: string }) {
    console.log('findByEmailDTO: ', findByEmailDTO);
    return this.userService.findByEmail(findByEmailDTO.email);
  }

  @Get('/userId')
  async findByUserId(@Body() findByUserIdDTO: { user_id: string }) {
    console.log('findByUserIdDTO: ', findByUserIdDTO);
    return this.userService.findByUserId(findByUserIdDTO.user_id);
  }
}
