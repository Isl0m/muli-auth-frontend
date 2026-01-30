import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, JWTPayload } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Middleware to verify JWT tokens and attach user to request
 * Can be used in API routes or server components
 */
export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get token from cookie or Authorization header
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Attach user to request
    (request as AuthenticatedRequest).user = payload;

    return handler(request as AuthenticatedRequest);
  } catch (error) {
    console.error('[v0] Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

/**
 * Helper to require specific auth methods
 * E.g., require MFA verification before accessing sensitive endpoints
 */
export function requireMfa(payload: JWTPayload): boolean {
  return payload.mfaVerified === true;
}

export function requireAuthMethod(
  payload: JWTPayload,
  method: 'password' | 'passwordless' | 'webauthn' | 'mfa'
): boolean {
  return payload.authMethod === method;
}
