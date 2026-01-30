import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sessions, securityLogs } from '@/lib/db/schema';
import { verifyJWT } from '@/lib/auth/jwt';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      );
    }

    // Verify token
    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Find and invalidate session
    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, token),
    });

    if (session) {
      // Delete session
      await db.delete(sessions).where(eq(sessions.id, session.id));

      // Log logout
      await db.insert(securityLogs).values({
        userId: payload.userId,
        eventType: 'logout_success',
        status: 'success',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: { sessionId: session.id },
      });
    }

    // Create response
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear auth cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[v0] Logout error:', error);

    await db.insert(securityLogs).values({
      eventType: 'logout_attempt',
      status: 'failed',
      reason: error instanceof Error ? error.message : 'Unknown error',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
