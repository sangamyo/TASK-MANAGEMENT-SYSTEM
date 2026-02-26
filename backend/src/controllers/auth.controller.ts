import express, { Request, Response } from 'express';

import env from '../config/env';
import { asyncHandler } from '../utils/asyncHandler';
import {
  login,
  logout,
  refreshSession,
  register,
} from '../services/auth.service';

const parseDurationMs = (value: string, fallbackMs: number): number => {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d+)(ms|s|m|h|d)?$/i);
  if (!match) return fallbackMs;

  const amount = Number(match[1]);
  const unit = (match[2] || 'ms').toLowerCase();

  const unitMap: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * (unitMap[unit] ?? 1);
};

const refreshCookieMaxAge = parseDurationMs(env.JWT_REFRESH_EXPIRES, 7 * 24 * 60 * 60 * 1000);

const refreshCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  maxAge: refreshCookieMaxAge,
  path: '/',
};

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(env.COOKIE_NAME, token, refreshCookieOptions);
};

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await register(req.body);
    setRefreshCookie(res, refreshToken);
    res.status(201).json({ user, accessToken });
  },
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = await login(req.body);
    setRefreshCookie(res, refreshToken);
    res.json({ user, accessToken });
  },
);

export const refreshController = asyncHandler(
  async (req: Request, res: Response) => {
    const incomingToken = req.cookies?.[env.COOKIE_NAME] as string | undefined;
    const { user, accessToken, refreshToken } =
      await refreshSession(incomingToken);
    setRefreshCookie(res, refreshToken);
    res.json({ user, accessToken });
  },
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    if (req.user?.id) {
      await logout(req.user.id);
    }
    res.clearCookie(env.COOKIE_NAME, { ...refreshCookieOptions, maxAge: 0 });
    res.json({ message: 'Logged out' });
  },
);
