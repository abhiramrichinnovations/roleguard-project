import { db } from '../config/database';
import { User, AuthTokens, LoginRequest, RegisterRequest } from '../types/user';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateTokens } from '../utils/jwt';

export const userService = {
  async register(data: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [data.email, data.username]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('Email or username already in use');
    }

    const passwordHash = await hashPassword(data.password);

    const result = await db.query(
      `INSERT INTO users (email, username, password_hash, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, email, username, role, is_active, created_at, updated_at`,
      [data.email, data.username, passwordHash, 'user', true]
    );

    const user = result.rows[0] as User;

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, tokens };
  },

  async login(data: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [data.email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = result.rows[0] as User;

    if (!user.is_active) {
      throw new Error('Account is inactive');
    }

    const passwordMatch = await verifyPassword(data.password, user.password_hash);

    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }

    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, tokens };
  },

  async refreshToken(userId: string): Promise<AuthTokens> {
    const result = await db.query(
      'SELECT id, email, role FROM users WHERE id = $1 AND is_active = true',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found or inactive');
    }

    const user = result.rows[0];

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return tokens;
  },

  async logout(userId: string): Promise<void> {
    const result = await db.query(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
  },

  async getUserById(userId: string): Promise<User> {
    const result = await db.query(
      'SELECT id, email, username, role, is_active, last_login, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0] as User;
  },

  async validateEmailExists(email: string): Promise<boolean> {
    const result = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    return result.rows.length > 0;
  },

  async validateUsernameExists(username: string): Promise<boolean> {
    const result = await db.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    return result.rows.length > 0;
  },
};