import { db } from '@/lib/db';
import { securityLogs } from '@/lib/db/schema';
import { desc, eq, gte, and } from 'drizzle-orm';

export type EventType =
  | 'login_attempt'
  | 'login_success'
  | 'logout_success'
  | 'registration_attempted'
  | 'registration_success'
  | 'passwordless_requested'
  | 'passwordless_verified'
  | 'mfa_setup_initiated'
  | 'mfa_verified'
  | 'mfa_failed'
  | 'webauthn_registered'
  | 'webauthn_verified'
  | 'password_changed'
  | 'session_created'
  | 'session_terminated'
  | 'account_locked'
  | 'suspicious_activity';

export interface SecurityEvent {
  userId?: string;
  email?: string;
  eventType: EventType;
  status: 'success' | 'failed';
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * Log a security event
 */
export async function logSecurityEvent(event: SecurityEvent) {
  try {
    await db.insert(securityLogs).values({
      userId: event.userId,
      email: event.email,
      eventType: event.eventType,
      status: event.status,
      reason: event.reason,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      metadata: event.metadata ? JSON.stringify(event.metadata) : null,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('[v0] Failed to log security event:', error);
  }
}

/**
 * Get user's authentication activity
 */
export async function getUserAuthActivity(userId: string, hours: number = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const events = await db
    .select()
    .from(securityLogs)
    .where(
      and(
        eq(securityLogs.userId, userId),
        gte(securityLogs.createdAt, since)
      )
    )
    .orderBy(desc(securityLogs.createdAt))
    .limit(100);

  return events;
}

/**
 * Detect suspicious activity patterns
 */
export async function detectSuspiciousActivity(userId: string) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const recentFailedAttempts = await db
    .select()
    .from(securityLogs)
    .where(
      and(
        eq(securityLogs.userId, userId),
        eq(securityLogs.status, 'failed'),
        gte(securityLogs.createdAt, oneHourAgo)
      )
    );

  const failedLoginCount = recentFailedAttempts.filter(
    (e) => e.eventType === 'login_attempt'
  ).length;

  const multipleIPs = new Set(
    recentFailedAttempts
      .map((e) => e.ipAddress)
      .filter(Boolean)
  ).size;

  const suspiciousPatterns = {
    highFailureRate: failedLoginCount >= 5,
    multipleIPs: multipleIPs > 1,
    shouldReviewAccount: failedLoginCount >= 5 || multipleIPs > 2,
  };

  if (suspiciousPatterns.shouldReviewAccount) {
    await logSecurityEvent({
      userId,
      eventType: 'suspicious_activity',
      status: 'success',
      metadata: suspiciousPatterns,
    });
  }

  return suspiciousPatterns;
}

/**
 * Get security metrics for dashboard
 */
export async function getSecurityMetrics(days: number = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const allEvents = await db
    .select()
    .from(securityLogs)
    .where(gte(securityLogs.createdAt, since));

  const metrics = {
    totalEvents: allEvents.length,
    successfulLogins: allEvents.filter(
      (e) => e.eventType === 'login_success'
    ).length,
    failedLogins: allEvents.filter(
      (e) => e.eventType === 'login_attempt' && e.status === 'failed'
    ).length,
    mfaVerifications: allEvents.filter(
      (e) => e.eventType === 'mfa_verified'
    ).length,
    newRegistrations: allEvents.filter(
      (e) => e.eventType === 'registration_success'
    ).length,
    suspiciousActivities: allEvents.filter(
      (e) => e.eventType === 'suspicious_activity'
    ).length,
    uniqueUsers: new Set(
      allEvents
        .map((e) => e.userId)
        .filter(Boolean)
    ).size,
    uniqueIPs: new Set(
      allEvents
        .map((e) => e.ipAddress)
        .filter(Boolean)
    ).size,
    loginSuccessRate:
      allEvents.filter((e) => e.eventType === 'login_attempt').length > 0
        ? (
            (allEvents.filter(
              (e) => e.eventType === 'login_success'
            ).length /
              allEvents.filter(
                (e) => e.eventType === 'login_attempt'
              ).length) *
            100
          ).toFixed(2)
        : 'N/A',
  };

  return metrics;
}

/**
 * Block user after repeated failed attempts
 */
export async function checkAccountLockout(
  userId: string,
  maxAttempts: number = 5,
  windowMinutes: number = 15
) {
  const since = new Date(Date.now() - windowMinutes * 60 * 1000);

  const failedAttempts = await db
    .select()
    .from(securityLogs)
    .where(
      and(
        eq(securityLogs.userId, userId),
        eq(securityLogs.eventType, 'login_attempt'),
        eq(securityLogs.status, 'failed'),
        gte(securityLogs.createdAt, since)
      )
    );

  return failedAttempts.length >= maxAttempts;
}
