import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../database/client';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no está configurado');
  return secret;
}

export interface AuthRequest extends Request {
  user?: { id: string; role: string; email: string };
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      getJwtSecret(),
      { expiresIn: '8h' },
    );
    
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

export function authenticate(roles: string[] = []) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as {
        id: string;
        role: string;
        email: string;
      };
      req.user = decoded;

      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Acceso denegado para este rol' });
      }

      next();
    } catch (error) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
  };
}
