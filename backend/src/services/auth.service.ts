import bcrypt from 'bcrypt';

import prisma from '../prisma/client';
import AppError from '../utils/appError';
import { comparePassword, hashPassword } from '../utils/password';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/token';
import { LoginInput, RegisterInput } from '../types/auth';

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
};

const persistRefreshToken = async (userId: string, refreshToken: string) => {
  const hashed = await bcrypt.hash(refreshToken, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { hashedRefreshToken: hashed },
  });
};

export const register = async (data: RegisterInput) => {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    throw new AppError('Email already in use', 400);
  }

  const password = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: { ...data, password },
    select: publicUserSelect,
  });

  const payload = { userId: user.id, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  await persistRefreshToken(user.id, refreshToken);

  return { user, accessToken, refreshToken };
};

export const login = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const valid = await comparePassword(data.password, user.password);
  if (!valid) {
    throw new AppError('Invalid credentials', 401);
  }

  const payload = { userId: user.id, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  await persistRefreshToken(user.id, refreshToken);

  const {
    password: _password,
    hashedRefreshToken: _hashedRefreshToken,
    ...safeUser
  } = user;
  void _password;
  void _hashedRefreshToken;
  return { user: safeUser, accessToken, refreshToken };
};

export const refreshSession = async (token: string | undefined) => {
  if (!token) {
    throw new AppError('Unauthorized', 401);
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError('Unauthorized', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || !user.hashedRefreshToken) {
    throw new AppError('Unauthorized', 401);
  }

  const match = await bcrypt.compare(token, user.hashedRefreshToken);
  if (!match) {
    throw new AppError('Unauthorized', 401);
  }

  const newPayload = { userId: user.id, email: user.email };
  const accessToken = signAccessToken(newPayload);
  const refreshToken = signRefreshToken(newPayload);
  await persistRefreshToken(user.id, refreshToken);

  const {
    password: _password,
    hashedRefreshToken: _hashedRefreshToken,
    ...safeUser
  } = user;
  void _password;
  void _hashedRefreshToken;
  return { user: safeUser, accessToken, refreshToken };
};

export const logout = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { hashedRefreshToken: null },
  });
};
