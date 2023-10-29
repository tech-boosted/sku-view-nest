import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export const AuthUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const secretKey: jwt.Secret = process.env.SECRETKEY;
    const request = ctx.switchToHttp().getRequest();
    let authToken = request.headers['authorization'];

    if (!authToken) {
      throw new UnauthorizedException('Authentication token is missing');
    }

    authToken = authToken.replace('Bearer ', '');
    try {
      const userInfo = jwt.verify(authToken, secretKey);
      return userInfo.user.id;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  },
);
