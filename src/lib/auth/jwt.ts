import { jwtVerify, SignJWT } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface JWTPayload {
  userId: string;
  email: string;
  authMethod: 'password' | 'passwordless' | 'webauthn' | 'mfa';
  mfaVerified?: boolean;
  iat?: number;
  exp?: number;
}

export async function createJWT(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);

  return token;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as JWTPayload;
  } catch (error) {
    console.error('[v0] JWT verification failed:', error);
    return null;
  }
}

export async function createShortLivedToken(
  payload: JWTPayload,
  expirationTime: string = '5m'
): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(secret);

  return token;
}
