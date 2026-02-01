import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';
import { verifyToken } from '../utils/jwt';

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    verifyToken(token);
    next();
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
};
