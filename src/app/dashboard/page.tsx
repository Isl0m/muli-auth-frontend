"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import api from "@/lib/axios";
import {
  Activity,
  AlertCircle,
  Clock,
  Fingerprint,
  Globe,
  Info,
  Key,
  Loader2,
  Lock,
  LogOut,
  Mail,
  RefreshCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Unlock,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type SecurityEvent = {
  id: string;
  createdAt: string | null;
  userId: string | null;
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
  ipAddress: string | null;
  userAgent: string | null;
  success: boolean;
  errorMessage: string | null;
  metadata: unknown;
};

export default function SecurityDashboard() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const response = await api.get("security/events/me");
      setEvents(response.data);
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const getEventConfig = (type: SecurityEvent["eventType"]) => {
    const configs: Record<
      SecurityEvent["eventType"],
      { label: string; icon: any; color: string }
    > = {
      login_success: {
        label: "Login Success",
        icon: ShieldCheck,
        color: "text-green-500",
      },
      login_failure: {
        label: "Login Failed",
        icon: ShieldAlert,
        color: "text-red-500",
      },
      registration: {
        label: "New Registration",
        icon: UserPlus,
        color: "text-blue-500",
      },
      password_reset: {
        label: "Password Reset",
        icon: RefreshCcw,
        color: "text-orange-500",
      },
      logout: { label: "Logout", icon: LogOut, color: "text-slate-500" },
      mfa_enabled: {
        label: "MFA Enabled",
        icon: Shield,
        color: "text-green-500",
      },
      mfa_disabled: {
        label: "MFA Disabled",
        icon: ShieldAlert,
        color: "text-red-500",
      },
      account_locked: {
        label: "Account Locked",
        icon: Lock,
        color: "text-red-600",
      },
      account_unlocked: {
        label: "Account Unlocked",
        icon: Unlock,
        color: "text-green-600",
      },
      webauthn_registered: {
        label: "Passkey Registered",
        icon: Fingerprint,
        color: "text-purple-500",
      },
      webauthn_authenticated: {
        label: "Passkey Auth",
        icon: Fingerprint,
        color: "text-purple-500",
      },
      magic_link_sent: {
        label: "Magic Link Sent",
        icon: Mail,
        color: "text-blue-400",
      },
      magic_link_used: {
        label: "Magic Link Used",
        icon: Mail,
        color: "text-blue-600",
      },
    };
    return (
      configs[type] || { label: type, icon: Activity, color: "text-slate-500" }
    );
  };

  const getAuthMethodIcon = (method: SecurityEvent["authMethod"]) => {
    switch (method) {
      case "password":
        return <Key className="w-3 h-3" />;
      case "passwordless":
        return <Mail className="w-3 h-3" />;
      case "webauthn":
        return <Fingerprint className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Security Overview
          </h1>
          <p className="text-muted-foreground">
            Detailed audit of all identity and access events.
          </p>
        </div>
        <Button
          onClick={fetchSecurityData}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Events"
          value={events.length}
          subtext="Audit log entries"
          icon={Activity}
        />
        <StatCard
          title="Success Rate"
          value={`${events.length ? Math.round((events.filter((e) => e.success).length / events.length) * 100) : 0}%`}
          subtext="Authorized events"
          icon={ShieldCheck}
          color="text-green-500"
        />
        <StatCard
          title="Failed Attempts"
          value={events.filter((e) => !e.success).length}
          subtext="Blocked actions"
          icon={ShieldAlert}
          color="text-red-500"
        />
        <StatCard
          title="Passkey Usage"
          value={events.filter((e) => e.authMethod === "webauthn").length}
          subtext="Biometric assertions"
          icon={Fingerprint}
          color="text-purple-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Ledger</CardTitle>
          <CardDescription>
            Comprehensive security audit trail with method verification and
            origin data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && events.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted rounded-xl">
              <AlertCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium">No activity recorded</h3>
              <p className="text-muted-foreground max-w-sm">
                Authentication events will appear here once they occur.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr className="border-b border-border text-left">
                    <th className="h-10 px-4 font-semibold text-xs tracking-wider">
                      Event & Method
                    </th>
                    <th className="h-10 px-4 font-semibold text-xs tracking-wider">
                      Status
                    </th>
                    <th className="h-10 px-4 font-semibold text-xs tracking-wider">
                      Origin (IP)
                    </th>
                    <th className="h-10 px-4 font-semibold text-xs tracking-wider">
                      Client Agent
                    </th>
                    <th className="h-10 px-4 font-semibold text-xs tracking-wider text-right">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {events.map((event) => {
                    const config = getEventConfig(event.eventType);
                    const Icon = config.icon;
                    return (
                      <tr
                        key={event.id}
                        className="transition-colors hover:bg-muted/30 group"
                      >
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg bg-muted border border-border/50 ${config.color}`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">
                                {config.label}
                              </span>
                              {event.authMethod && (
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground capitalize font-bold tracking-tighter">
                                  {getAuthMethodIcon(event.authMethod)}
                                  {event.authMethod}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${event.success ? "bg-green-500" : "bg-red-500 animate-pulse"}`}
                            />
                            <span
                              className={`text-xs font-bold uppercase tracking-wide ${event.success ? "text-green-600/80" : "text-red-600/80"}`}
                            >
                              {event.success ? "Verified" : "Failed"}
                            </span>
                            {event.errorMessage && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-destructive text-destructive-foreground text-[10px] font-medium max-w-xs border-none shadow-xl">
                                    {event.errorMessage}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="w-3.5 h-3.5 opacity-40" />
                            <span className="font-mono text-xs">
                              {event.ipAddress || "Internal"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div
                            className="flex items-center gap-2 max-w-45 truncate text-muted-foreground"
                            title={event.userAgent || ""}
                          >
                            <Smartphone className="w-3.5 h-3.5 opacity-40" />
                            <span className="text-xs">
                              {event.userAgent || "System Process"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 align-middle text-right text-muted-foreground">
                          <div className="flex items-center justify-end gap-2 tabular-nums">
                            <Clock className="w-3.5 h-3.5 opacity-40" />
                            <span className="text-xs">
                              {event.createdAt
                                ? new Date(event.createdAt).toLocaleString(
                                    undefined,
                                    {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                    },
                                  )
                                : "---"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  color = "text-muted-foreground",
}: {
  title: string;
  value: string | number;
  subtext: string;
  icon: any;
  color?: string;
}) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardContent className="p-5 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <div className="flex flex-col">
          <h3 className="text-2xl font-bold">{value}</h3>
          <p className="text-[10px] text-muted-foreground font-medium">
            {subtext}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
