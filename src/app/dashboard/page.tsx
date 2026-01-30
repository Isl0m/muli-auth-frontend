"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SecurityEvent {
  success: boolean;
  id: string;
  createdAt: Date | null;
  userId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  eventType:
    | "login_success"
    | "login_failure"
    | "registration"
    | "password_reset"
    | "logout"
    | "mfa_enabled"
    | "mfa_disabled"
    | "account_locked"
    | "account_unlocked"
    | "webauthn_registered"
    | "webauthn_authenticated"
    | "magic_link_sent"
    | "magic_link_used";
  authMethod: "password" | "passwordless" | "webauthn" | null;
  errorMessage: string | null;
  metadata: unknown;
}

export default function SecurityDashboard() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityData();
  }, []);
  const router = useRouter();
  const fetchSecurityData = async () => {
    setLoading(true);

    try {
      const response = await api.get("security/events/me");
      setEvents(response.data);
    } catch (err) {
      // router.push("/");
      localStorage.removeItem("access_token");
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    router.push("/");
    localStorage.removeItem("access_token");
  };

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Security Dashboard
          </h1>
          <Button onClick={logOut}>LogOut</Button>
        </div>

        {/* Recent Events */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Recent Authentication Events
          </h2>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No events recorded
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-foreground">
                      Event Type
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">
                      IP Address
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">
                      User Agent
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="py-3 px-4 text-foreground">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {event.eventType.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            event.success
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {event.success ? "Success" : "Failed"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-foreground text-xs font-mono">
                        {event.ipAddress || "-"}
                      </td>
                      <td className="py-3 px-4 text-foreground text-xs font-mono">
                        {event.userAgent || "-"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(event.createdAt!).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
