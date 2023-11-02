import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export const validateToken = (token) => {
  const secretKey: jwt.Secret = process.env.SECRETKEY;

  if (!token) {
    throw new UnauthorizedException('Authentication token is missing');
  }

  try {
    const userInfo = jwt.verify(token, secretKey);
    return userInfo.user.id;
  } catch (err) {
    throw new UnauthorizedException('Invalid token');
  }
};
