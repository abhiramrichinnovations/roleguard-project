import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      res.status(401).json({ status: 'error', message: 'No token provided' });
      return;
    }

    const decoded = verifyAccessToken(token);

    req.user = decoded as unknown as { userId: string; email: string; role: string };
    next();
  } catch (err) {
    res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }
};

export const authenticate = authMiddleware;