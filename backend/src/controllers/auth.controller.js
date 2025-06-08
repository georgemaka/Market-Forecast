import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';
import { cache } from '../config/redis.js';

const prisma = new PrismaClient();

const generateTokens = (userId) => {
  const payload = { userId };
  
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
  
  return { accessToken, refreshToken };
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Email and password are required.',
        },
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
        role: true,
        marketSegments: true,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: {
          code: 'ACCOUNT_INACTIVE',
          message: 'Your account has been deactivated. Please contact an administrator.',
        },
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Store refresh token in cache
    await cache.set(`refresh_token:${user.id}`, refreshToken, 30 * 24 * 60 * 60); // 30 days

    // Log successful login
    logger.info(`User ${user.email} logged in successfully`, {
      userId: user.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    // Remove password hash from response
    const { passwordHash, ...userResponse } = user;

    res.json({
      token: accessToken,
      refreshToken,
      user: userResponse,
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during login.',
      },
    });
  }
};

export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'CONTRIBUTOR', marketSegments = [] } = req.body;

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: {
          code: 'MISSING_FIELDS',
          message: 'Email, password, first name, and last name are required.',
        },
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists.',
        },
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role,
        marketSegments,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        marketSegments: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token in cache
    await cache.set(`refresh_token:${user.id}`, refreshToken, 30 * 24 * 60 * 60); // 30 days

    logger.info(`New user registered: ${user.email}`, {
      userId: user.id,
      role: user.role,
    });

    res.status(201).json({
      token: accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during registration.',
      },
    });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: {
          code: 'MISSING_REFRESH_TOKEN',
          message: 'Refresh token is required.',
        },
      });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      // Check if refresh token exists in cache
      const cachedToken = await cache.get(`refresh_token:${decoded.userId}`);
      
      if (!cachedToken || cachedToken !== refreshToken) {
        return res.status(401).json({
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid or expired refresh token.',
          },
        });
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

      // Update refresh token in cache
      await cache.set(`refresh_token:${decoded.userId}`, newRefreshToken, 30 * 24 * 60 * 60);

      res.json({
        token: accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (jwtError) {
      return res.status(401).json({
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid or expired refresh token.',
        },
      });
    }
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during token refresh.',
      },
    });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    // Remove refresh token from cache
    await cache.del(`refresh_token:${userId}`);

    logger.info(`User ${req.user.email} logged out`, {
      userId,
      ip: req.ip,
    });

    res.json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred during logout.',
      },
    });
  }
};

export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        marketSegments: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found.',
        },
      });
    }

    res.json({ user });
  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching user profile.',
      },
    });
  }
};

export default {
  login,
  register,
  refresh,
  logout,
  me,
};