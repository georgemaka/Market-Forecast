import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'NO_TOKEN',
          message: 'Access denied. No token provided.',
        },
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          marketSegments: true,
          isActive: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Token is valid but user no longer exists.',
          },
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          error: {
            code: 'USER_INACTIVE',
            message: 'User account is inactive.',
          },
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Token has expired. Please log in again.',
          },
        });
      }

      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid token. Please log in again.',
          },
        });
      }

      throw jwtError;
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error during authentication.',
      },
    });
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access denied. Authentication required.',
        },
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied. Insufficient permissions.',
        },
      });
    }

    next();
  };
};

export const requireMarketSegment = (segment) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access denied. Authentication required.',
        },
      });
    }

    // Admins and executives can access all segments
    if (['ADMIN', 'EXECUTIVE'].includes(req.user.role)) {
      return next();
    }

    if (!req.user.marketSegments.includes(segment)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. User not assigned to ${segment} market segment.`,
        },
      });
    }

    next();
  };
};

export default { authenticate, authorize, requireMarketSegment };