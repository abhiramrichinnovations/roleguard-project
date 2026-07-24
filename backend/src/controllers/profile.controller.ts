import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { profileService } from '../services/profile.service';

export class ProfileController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const profile = await profileService.getProfile(userId);
      res.status(200).json({ status: 'success', message: 'Profile retrieved', data: profile });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const updated = await profileService.updateProfile(userId, req.body);
      res.status(200).json({ status: 'success', message: 'Profile updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await profileService.changePassword(userId, req.body);
      res.status(200).json({ status: 'success', message: result.message });
    } catch (err) {
      next(err);
    }
  }

  async deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { password } = req.body;
      const result = await profileService.deleteAccount(userId, password);
      res.status(200).json({ status: 'success', message: result.message });
    } catch (err) {
      next(err);
    }
  }
}

export const profileController = new ProfileController();