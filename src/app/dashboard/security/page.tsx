'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SecurityMetrics {
  totalEvents: number;
  successfulLogins: number;
  failedLogins: number;
  mfaVerifications: number;
  newRegistrations: number;
  suspiciousActivities: number;
  uniqueUsers: number;
  uniqueIPs: number;
  loginSuccessRate: string;
}

interface SecurityEvent {
  id: number;
  userId?: string;
  email?: string;
  eventType: string;
  status: string;
  ipAddress?: string;
  createdAt: string;
}

export default function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchSecurityData();
  }, [timeRange]);

  const fetchSecurityData = async () => {
    setLoading(true);
    setError('');

    try {
      // In production, these would be API calls
      console.log('[v0] Fetching security metrics for:', timeRange, 'days');

      // Simulated data - replace with actual API calls
      const simulatedMetrics: SecurityMetrics = {
        totalEvents: 1250,
        successfulLogins: 523,
        failedLogins: 47,
        mfaVerifications: 312,
        newRegistrations: 156,
        suspiciousActivities: 8,
        uniqueUsers: 428,
        uniqueIPs: 89,
        loginSuccessRate: '91.74',
      };

      const simulatedEvents: SecurityEvent[] = [
        {
          id: 1,
          email: 'user@example.com',
          eventType: 'login_success',
          status: 'success',
          ipAddress: '192.168.1.1',
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          email: 'newuser@example.com',
          eventType: 'registration_success',
          status: 'success',
          ipAddress: '192.168.1.2',
          createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
        },
        {
          id: 3,
          email: 'user2@example.com',
          eventType: 'mfa_verified',
          status: 'success',
          ipAddress: '192.168.1.3',
          createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
        },
      ];

      setMetrics(simulatedMetrics);
      setEvents(simulatedEvents);
    } catch (err) {
      setError('Failed to load security data. Please try again.');
      console.error('[v0] Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor authentication events and security metrics
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/10">
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
        )}

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-6">
          {['7', '30', '90'].map((days) => (
            <Button
              key={days}
              variant={timeRange === days ? 'default' : 'outline'}
              onClick={() => setTimeRange(days)}
              disabled={loading}
            >
              Last {days} days
            </Button>
          ))}
        </div>

        {/* Metrics Grid */}
        {metrics && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Total Events</div>
              <div className="text-3xl font-bold text-foreground">
                {metrics.totalEvents.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                All authentication events
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Successful Logins</div>
              <div className="text-3xl font-bold text-green-600">
                {metrics.successfulLogins.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Success rate: {metrics.loginSuccessRate}%
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Failed Logins</div>
              <div className="text-3xl font-bold text-destructive">
                {metrics.failedLogins.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Review for unusual patterns
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-2">MFA Verifications</div>
              <div className="text-3xl font-bold text-primary">
                {metrics.mfaVerifications.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Additional security layer
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-2">New Registrations</div>
              <div className="text-3xl font-bold text-foreground">
                {metrics.newRegistrations.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                New user accounts created
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Suspicious Activities</div>
              <div className="text-3xl font-bold text-orange-600">
                {metrics.suspiciousActivities.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Requires investigation
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Unique Users</div>
              <div className="text-3xl font-bold text-foreground">
                {metrics.uniqueUsers.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Distinct user accounts
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Unique IP Addresses</div>
              <div className="text-3xl font-bold text-foreground">
                {metrics.uniqueIPs.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Different access locations
              </div>
            </Card>
          </div>
        )}

        {/* Recent Events */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Recent Authentication Events</h2>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No events recorded</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-foreground">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Event Type</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">IP Address</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-foreground">{event.email || '-'}</td>
                      <td className="py-3 px-4 text-foreground">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {event.eventType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            event.status === 'success'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-foreground text-xs font-mono">
                        {event.ipAddress || '-'}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(event.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Recommendations */}
        <Card className="mt-8 p-6 border border-blue-200 bg-blue-50">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Security Recommendations</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ Review failed login attempts regularly for suspicious patterns</li>
            <li>✓ Encourage users to enable MFA for enhanced security</li>
            <li>✓ Monitor unique IP addresses for potential unauthorized access</li>
            <li>✓ Implement rate limiting on authentication endpoints</li>
            <li>✓ Set up alerts for suspicious activity thresholds</li>
            <li>✓ Regularly audit and rotate security credentials</li>
          </ul>
        </Card>
      </div>
    </main>
  );
}
