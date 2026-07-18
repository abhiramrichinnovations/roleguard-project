import jwt from 'jsonwebtoken';
import { TokenPayload, AuthTokens } from '../types/user';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export const generateTokens = (payload: Omit<TokenPayload, 'iat' | 'exp'>): AuthTokens => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'access_secret', {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: 'roleguard',
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh_secret', {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    issuer: 'roleguard',
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'access_secret', {
      issuer: 'roleguard',
    }) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret', {
      issuer: 'roleguard',
    }) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
};