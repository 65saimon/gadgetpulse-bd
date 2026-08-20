import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    fullName: string;
    type: 'ADMIN' | 'CUSTOMER';
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'gadgetpulse_bd_secret_jwt_key_2026';

export const generateToken = (payload: any) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// Protect admin routes
export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.type !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin privileges required.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      type: 'ADMIN',
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// Role authorization middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Requires one of roles: ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
};

// Protect customer routes
export const requireCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Please log in to continue.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const customer = await prisma.customer.findUnique({
      where: { id: decoded.id },
    });

    if (!customer) {
      return res.status(401).json({ success: false, message: 'Customer account not found.' });
    }

    req.user = {
      id: customer.id,
      email: customer.email,
      role: 'CUSTOMER',
      fullName: customer.fullName,
      type: 'CUSTOMER',
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
  }
};

// Optional customer auth (guest or logged in)
export const optionalCustomer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const customer = await prisma.customer.findUnique({
        where: { id: decoded.id },
      });
      if (customer) {
        req.user = {
          id: customer.id,
          email: customer.email,
          role: 'CUSTOMER',
          fullName: customer.fullName,
          type: 'CUSTOMER',
        };
      }
    }
  } catch (err) {
    // Ignore invalid token on optional check
  }
  next();
};
