import { Router, Request, Response } from 'express';
import { userService } from '../services/user.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { createRateLimiter } from '../middleware/rateLimiter';
import { loginSchema, registerSchema } from '../validations/auth.validation';
import { ZodError } from 'zod';
import { decodeToken } from '../utils/jwt';

const router = Router();

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  keyGenerator: (req) => `login:${req.ip || 'unknown'}`,
});

const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 3,
  keyGenerator: (req) => `register:${req.ip || 'unknown'}`,
});

const formatValidationError = (error: ZodError) => {
  return error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};

router.post('/register', registerLimiter, async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const { user, tokens } = await userService.register(validatedData);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh',
    });

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: formatValidationError(error),
      });
    }

    const message = error instanceof Error ? error.message : 'Registration failed';

    if (message.includes('already in use')) {
      return res.status(409).json({
        status: 'error',
        message: 'Email or username already in use',
      });
    }

    return res.status(500).json({
      status: 'error',
      message,
    });
  }
});

router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const { user, tokens } = await userService.login(validatedData);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh',
    });

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: formatValidationError(error),
      });
    }

    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password',
    });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const cookieToken = req.cookies?.refreshToken;

    if (!cookieToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token required',
      });
    }

    const decoded = decodeToken(cookieToken);

    if (!decoded) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token',
      });
    }

    const tokens = await userService.refreshToken(decoded.userId);

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Token refreshed',
      data: { tokens },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token refresh failed';
    return res.status(401).json({
      status: 'error',
      message,
    });
  }
});

router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    await userService.logout(req.user.userId);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(200).json({
      status: 'success',
      message: 'Logout successful',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    return res.status(500).json({
      status: 'error',
      message,
    });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const user = await userService.getUserById(req.user.userId);

    return res.status(200).json({
      status: 'success',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.is_active,
        lastLogin: user.last_login,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user';
    return res.status(500).json({
      status: 'error',
      message,
    });
  }
});

export default router;