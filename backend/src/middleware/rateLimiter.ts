import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
}

export const createRateLimiter = (options: RateLimitOptions) => {
  const { windowMs, maxRequests, keyGenerator } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator ? keyGenerator(req) : req.ip || 'unknown';
    const now = Date.now();

    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    if (now > store[key].resetTime) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    store[key].count++;

    if (store[key].count > maxRequests) {
      res.setHeader('Retry-After', Math.ceil((store[key].resetTime - now) / 1000));
      return res.status(429).json({
        status: 'error',
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
      });
    }

    next();
  };
};

setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60000);