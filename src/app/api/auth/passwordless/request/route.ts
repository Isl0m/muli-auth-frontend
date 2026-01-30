import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { magicLinks, securityLogs } from '@/lib/db/schema';

// In production, use a proper email service like SendGrid, AWS SES, etc.
async function sendMagicLinkEmail(email: string, token: string) {
  // This is a placeholder - in production, integrate with email service
  console.log('[v0] Magic link email sent to:', email);
  console.log('[v0] Token:', token);
  // Example email content:
  // Subject: Your login link
  // Click here to sign in: https://yourapp.com/auth/passwordless/verify?token={token}
  // This link expires in 15 minutes
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { email, method = 'magic-link' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store magic link in database
    await db.insert(magicLinks).values({
      email,
      token,
      expiresAt,
      isUsed: false,
    });

    // Send email
    const emailSent = await sendMagicLinkEmail(email, token);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Log the passwordless request
    await db.insert(securityLogs).values({
      email,
      eventType: 'passwordless_requested',
      status: 'success',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      metadata: { method, tokenExpiry: '15 minutes' },
    });

    return NextResponse.json(
      {
        message: `${method === 'magic-link' ? 'Magic link' : 'Verification code'} sent to ${email}`,
        expiresIn: 900, // 15 minutes in seconds
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Passwordless request error:', error);

    await db.insert(securityLogs).values({
      eventType: 'passwordless_requested',
      status: 'failed',
      reason: error instanceof Error ? error.message : 'Unknown error',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      metadata: { method: 'passwordless' },
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
