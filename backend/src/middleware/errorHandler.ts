import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(err: AppError, req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || 500;
  logger.error(`${req.method} ${req.path} → ${statusCode}: ${err.message}`);
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
}

export function notFound(req: Request, res: Response) {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
}
