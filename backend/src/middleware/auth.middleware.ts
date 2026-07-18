import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { TokenPayload } from '../types/user';

export interface AuthRequest extends Request {
  user?: TokenPayload;
  token?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'No authentication token provided',
      });
      return;
    }

    const payload = verifyAccessToken(token);
    req.user = payload;
    req.token = token;

    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token',
    });
    return;
  }
};

export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = extractToken(req);

    if (token) {
      const payload = verifyAccessToken(token);
      req.user = payload;
      req.token = token;
    }

    next();
  } catch (error) {
    next();
  }
};

const extractToken = (req: AuthRequest): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  if (req.headers['x-access-token']) {
    return req.headers['x-access-token'] as string;
  }

  return null;
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};