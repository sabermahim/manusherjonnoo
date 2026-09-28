import crypto from 'crypto';

const JWT_SECRET = process.env.SESSION_SECRET || 'manusher_jonno_secure_secret_key_2026_bd';

export interface TokenPayload {
  id: number;
  uid: string;
  email: string;
  role: 'USER' | 'VOLUNTEER' | 'ADMIN';
  name: string;
  exp: number;
}

export function createToken(payload: Omit<TokenPayload, 'exp'>, expiresInDays = 7): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60;
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
    if (expectedSig !== signature) return null;

    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as TokenPayload;
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return decoded;
  } catch (err) {
    return null;
  }
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}
