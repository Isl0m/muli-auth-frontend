import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { db } from '@/lib/db';
import { users, sessions, securityLogs } from '@/lib/db/schema';
import { createJWT } from '@/lib/auth/jwt';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (!user) {
      // Log failed login attempt
      await db.insert(securityLogs).values({
        email,
        eventType: 'login_attempt',
        status: 'failed',
        reason: 'User not found',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: { method: 'password', userExists: false },
      });

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      await db.insert(securityLogs).values({
        userId: user.id,
        email,
        eventType: 'login_attempt',
        status: 'failed',
        reason: 'User has no password (passwordless only)',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: { method: 'password' },
      });

      return NextResponse.json(
        { error: 'This account uses passwordless authentication' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await compare(password, user.passwordHash);

    if (!isPasswordValid) {
      await db.insert(securityLogs).values({
        userId: user.id,
        email,
        eventType: 'login_attempt',
        status: 'failed',
        reason: 'Invalid password',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: { method: 'password' },
      });

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await createJWT({
      userId: user.id,
      email: user.email,
      authMethod: 'password',
    });

    // Store session
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const session = await db
      .insert(sessions)
      .values({
        userId: user.id,
        token,
        expiresAt,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      })
      .returning();

    // Log successful login
    await db.insert(securityLogs).values({
      userId: user.id,
      email,
      eventType: 'login_success',
      status: 'success',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      metadata: { method: 'password', sessionId: session[0].id },
    });

    // Create response with secure cookie
    const response = NextResponse.json(
      {
        message: 'Login successful',
        userId: user.id,
        token,
      },
      { status: 200 }
    );

    // Set secure HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[v0] Login error:', error);

    await db.insert(securityLogs).values({
      eventType: 'login_attempt',
      status: 'failed',
      reason: error instanceof Error ? error.message : 'Unknown error',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      metadata: { method: 'password' },
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
