import jwt, { Secret, SignOptions } from 'jsonwebtoken';

import env from '../config/env';

export interface JwtPayload extends jwt.JwtPayload {
  userId: string;
  email: string;
}

const accessSecret: Secret = env.JWT_ACCESS_SECRET;
const refreshSecret: Secret = env.JWT_REFRESH_SECRET;
const accessOptions: SignOptions = {
  expiresIn: (env.JWT_ACCESS_EXPIRES || '15m') as SignOptions['expiresIn'],
};
const refreshOptions: SignOptions = {
  expiresIn: (env.JWT_REFRESH_EXPIRES || '7d') as SignOptions['expiresIn'],
};

export const signAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, accessSecret, accessOptions);
};

export const signRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, refreshSecret, refreshOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, accessSecret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, refreshSecret) as JwtPayload;
};
