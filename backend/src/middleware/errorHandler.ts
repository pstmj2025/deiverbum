import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  status?: number;
  code?: string;
}

export function errorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('❌ Erro:', err.stack);
  
  // Erros do Prisma
  if (err.code === 'P2002') {
    return res.status(409).json({ 
      error: 'Registro já existe',
      details: err.message 
    });
  }
  
  if (err.code?.startsWith('P2')) {
    return res.status(400).json({ 
      error: 'Erro de validação',
      details: err.message 
    });
  }
  
  const status = err.status || 500;
  const message = err.status ? err.message : 'Erro interno do servidor';
  
  res.status(status).json({ 
    error: message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

import { env } from '../config/env';
