import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { users, securityLogs } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const { email, password, enableMfa } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (existingUser) {
      // Log failed registration attempt
      await db.insert(securityLogs).values({
        email,
        eventType: 'registration_attempted',
        status: 'failed',
        reason: 'Email already exists',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: { method: 'password' },
      });

      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        isActive: true,
      })
      .returning();

    // Log successful registration
    await db.insert(securityLogs).values({
      userId: newUser[0].id,
      email,
      eventType: 'registration_success',
      status: 'success',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      metadata: { method: 'password', mfaEnabled: enableMfa },
    });

    return NextResponse.json(
      {
        message: 'User registered successfully',
        userId: newUser[0].id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
