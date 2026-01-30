import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mfaSettings, securityLogs } from '@/lib/db/schema';
import { verifyJWT } from '@/lib/auth/jwt';
import { randomBytes } from 'crypto';

/**
 * TOTP Setup Endpoint
 * Generates a secret for TOTP (Time-based One-Time Password) MFA
 * User scans the QR code in their authenticator app
 */
export async function POST(request: NextRequest) {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { mfaType = 'totp' } = await request.json();

    // Generate secret for TOTP
    // In production, use speakeasy or similar library for proper TOTP generation
    const secret = randomBytes(32).toString('base64');

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      randomBytes(4).toString('hex').toUpperCase()
    );

    // Check if user already has this MFA type enabled
    const existingMfa = await db.query.mfaSettings.findFirst({
      where: (mfaSettings, { and, eq }) =>
        and(
          eq(mfaSettings.userId, payload.userId),
          eq(mfaSettings.mfaType, mfaType)
        ),
    });

    let mfaSetting;
    if (existingMfa) {
      // Update existing
      const updated = await db
        .update(mfaSettings)
        .set({
          secret,
          backupCodes: JSON.stringify(backupCodes),
          isEnabled: false, // Not enabled until verified
          updatedAt: new Date(),
        })
        .where(mfaSettings.id === existingMfa.id)
        .returning();
      mfaSetting = updated[0];
    } else {
      // Create new
      const created = await db
        .insert(mfaSettings)
        .values({
          userId: payload.userId,
          mfaType,
          secret,
          backupCodes: JSON.stringify(backupCodes),
          isEnabled: false,
        })
        .returning();
      mfaSetting = created[0];
    }

    // Log MFA setup initiated
    await db.insert(securityLogs).values({
      userId: payload.userId,
      eventType: 'mfa_setup_initiated',
      status: 'success',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      metadata: { mfaType, mfaId: mfaSetting.id },
    });

    return NextResponse.json(
      {
        mfaId: mfaSetting.id,
        secret,
        backupCodes,
        mfaType,
        qrCodeUrl: `otpauth://totp/SecureAuth:${payload.email}?secret=${secret}&issuer=SecureAuth`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] MFA setup error:', error);

    await db.insert(securityLogs).values({
      eventType: 'mfa_setup_failed',
      status: 'failed',
      reason: error instanceof Error ? error.message : 'Unknown error',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      metadata: { error: true },
    });

    return NextResponse.json(
      { error: 'Failed to setup MFA' },
      { status: 500 }
    );
  }
}
