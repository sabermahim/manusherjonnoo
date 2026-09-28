import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { verifyToken, TokenPayload } from '../lib/auth-token.ts';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AppUser {
  id: number;
  uid: string;
  email: string;
  name: string;
  role: 'USER' | 'VOLUNTEER' | 'ADMIN';
  phone?: string;
  area?: string;
  avatar?: string;
  isSuspended?: boolean;
}

export interface AuthRequest extends Request {
  user?: AppUser;
}

export const authenticateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) return next();

  // 1. Try internal JWT verification first
  const payload = verifyToken(token);
  if (payload) {
    try {
      const [foundUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.id))
        .limit(1);

      if (foundUser) {
        if (foundUser.isSuspended) {
          return res.status(403).json({ error: 'আপনার অ্যাকাউন্টটি স্থগিত করা হয়েছে।' });
        }
        req.user = {
          id: foundUser.id,
          uid: foundUser.uid,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role as 'USER' | 'VOLUNTEER' | 'ADMIN',
          phone: foundUser.phone || '',
          area: foundUser.area || '',
          avatar: foundUser.avatar || '',
          isSuspended: foundUser.isSuspended,
        };
        return next();
      }
    } catch (e) {
      console.error('Database query error in auth middleware:', e);
    }
  }

  // 2. Try Firebase ID Token verification
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    if (decodedToken && decodedToken.uid) {
      // Find or create in DB
      let [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.uid, decodedToken.uid))
        .limit(1);

      if (!existingUser) {
        const [newUser] = await db
          .insert(users)
          .values({
            uid: decodedToken.uid,
            email: decodedToken.email || `${decodedToken.uid}@gmail.com`,
            name: decodedToken.name || 'গুগল ব্যবহারকারী',
            role: 'USER',
            avatar: decodedToken.picture || '',
          })
          .returning();
        existingUser = newUser;
      }

      if (existingUser.isSuspended) {
        return res.status(403).json({ error: 'আপনার অ্যাকাউন্টটি স্থগিত করা হয়েছে।' });
      }

      req.user = {
        id: existingUser.id,
        uid: existingUser.uid,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role as 'USER' | 'VOLUNTEER' | 'ADMIN',
        phone: existingUser.phone || '',
        area: existingUser.area || '',
        avatar: existingUser.avatar || '',
        isSuspended: existingUser.isSuspended,
      };
      return next();
    }
  } catch (err) {
    // Neither valid JWT nor valid Firebase token
  }

  next();
};

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'অনুগ্রহ করে প্রথমে লগইন করুন।' });
  }
  next();
};

export const requireRole = (roles: Array<'USER' | 'VOLUNTEER' | 'ADMIN'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'অনুগ্রহ করে প্রথমে লগইন করুন।' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'এই পেজ বা অ্যাকশনটিতে আপনার প্রবেশের অনুমতি নেই।' });
    }
    next();
  };
};
