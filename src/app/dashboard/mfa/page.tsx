"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import api from "@/lib/axios";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  QrCode,
  Shield,
  ShieldOff,
} from "lucide-react";
import { useState } from "react";

type SetupPhase = "idle" | "scanning" | "verifying";
type DisablePhase = "idle" | "verifying";

export default function MfaPage() {
  const [setupPhase, setSetupPhase] = useState<SetupPhase>("idle");
  const [disablePhase, setDisablePhase] = useState<DisablePhase>("idle");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [setupCode, setSetupCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [setupError, setSetupError] = useState<string | null>(null);
  const [disableError, setDisableError] = useState<string | null>(null);
  const [setupSuccess, setSetupSuccess] = useState(false);
  const [disableSuccess, setDisableSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchQrCode = async () => {
    setLoading(true);
    setSetupError(null);
    try {
      const response = await api.get("/auth/password/mfa/qrcode");
      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
      setSetupPhase("scanning");
    } catch (err: any) {
      setSetupError(
        err.response?.data?.message || "Failed to generate QR code.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMfa = async () => {
    if (setupCode.length !== 6) return;
    setLoading(true);
    setSetupError(null);
    try {
      await api.post("/auth/password/mfa/enable", {
        totpCode: setupCode,
        secret,
      });
      setSetupSuccess(true);
      setSetupPhase("idle");
      setSetupCode("");
      setQrCode("");
      setSecret("");
    } catch (err: any) {
      setSetupError(
        err.response?.data?.message ||
          "Invalid code. Please try again.",
      );
      setSetupCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    if (disableCode.length !== 6) return;
    setLoading(true);
    setDisableError(null);
    try {
      await api.post("/auth/password/mfa/disable", { totpCode: disableCode });
      setDisableSuccess(true);
      setDisablePhase("idle");
      setDisableCode("");
    } catch (err: any) {
      setDisableError(
        err.response?.data?.message ||
          "Invalid code. Please try again.",
      );
      setDisableCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Two-Factor Authentication
        </h1>
        <p className="text-muted-foreground">
          Protect your account with a time-based one-time password (TOTP).
        </p>
      </div>

      {/* Enable MFA */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Enable Authenticator App</CardTitle>
              <CardDescription>
                Scan the QR code with Google Authenticator, Authy, or any TOTP app
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {setupSuccess && (
            <Alert className="border-green-500/30 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="ml-2 text-sm font-medium text-green-600">
                Two-factor authentication has been enabled successfully.
              </AlertDescription>
            </Alert>
          )}

          {setupPhase === "idle" && !setupSuccess && (
            <Button onClick={fetchQrCode} disabled={loading} className="gap-2">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <QrCode className="w-4 h-4" />
              )}
              {loading ? "Generating..." : "Set up authenticator"}
            </Button>
          )}

          {setupPhase === "scanning" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {qrCode && (
                  <div className="shrink-0 p-3 bg-white rounded-xl border border-border shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCode}
                      alt="TOTP QR Code"
                      width={160}
                      height={160}
                    />
                  </div>
                )}
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    1. Open your authenticator app
                  </p>
                  <p className="text-muted-foreground">
                    2. Scan the QR code or enter the key manually
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Manual key
                    </p>
                    <code className="block font-mono text-xs bg-muted px-3 py-2 rounded-lg border border-border break-all">
                      {secret}
                    </code>
                  </div>
                  <p className="text-muted-foreground">
                    3. Enter the 6-digit code below to confirm
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Verification code</p>
                <InputOTP
                  maxLength={6}
                  value={setupCode}
                  onChange={setSetupCode}
                  onComplete={handleEnableMfa}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {setupError && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2 text-xs font-medium">
                    {setupError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleEnableMfa}
                  disabled={setupCode.length !== 6 || loading}
                  className="gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  {loading ? "Enabling..." : "Enable 2FA"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSetupPhase("idle");
                    setSetupCode("");
                    setSetupError(null);
                    setQrCode("");
                    setSecret("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disable MFA */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-destructive/10 p-2 rounded-lg border border-destructive/20">
              <ShieldOff className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-lg">Disable Authenticator App</CardTitle>
              <CardDescription>
                Remove two-factor authentication from your account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {disableSuccess && (
            <Alert className="border-green-500/30 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="ml-2 text-sm font-medium text-green-600">
                Two-factor authentication has been disabled.
              </AlertDescription>
            </Alert>
          )}

          {disablePhase === "idle" && !disableSuccess && (
            <Button
              variant="destructive"
              onClick={() => setDisablePhase("verifying")}
              className="gap-2"
            >
              <ShieldOff className="w-4 h-4" />
              Disable 2FA
            </Button>
          )}

          {disablePhase === "verifying" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the current code from your authenticator app to confirm.
              </p>

              <div className="space-y-3">
                <p className="text-sm font-medium">Verification code</p>
                <InputOTP
                  maxLength={6}
                  value={disableCode}
                  onChange={setDisableCode}
                  onComplete={handleDisableMfa}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {disableError && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2 text-xs font-medium">
                    {disableError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={handleDisableMfa}
                  disabled={disableCode.length !== 6 || loading}
                  className="gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldOff className="w-4 h-4" />
                  )}
                  {loading ? "Disabling..." : "Confirm Disable"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setDisablePhase("idle");
                    setDisableCode("");
                    setDisableError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
