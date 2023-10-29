import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDTO {
  @IsNotEmpty()
  firstname: string;

  @IsNotEmpty()
  lastname: string;

  @IsNotEmpty()
  company: string;

  @IsNotEmpty()
  phone_number: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export class LoginDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
