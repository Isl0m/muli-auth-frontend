"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/lib/axios";
import { startRegistration } from "@simplewebauthn/browser";
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing registration token.");
      setVerifying(false);
    } else {
      setVerifying(false);
    }
  }, [token]);

  const handleRegister = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const { data: options } = await api.post(
        "/auth/webauthn/register/options",
        { token },
        { withCredentials: true },
      );

      const credential = await startRegistration(options);

      await api.post(
        "/auth/webauthn/register/verify",
        {
          token,
          credential,
        },
        { withCredentials: true },
      );

      setSuccess(
        "Device registered successfully! You can now use it to sign in.",
      );
      router.push("/auth/biometric");
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Registration failed. The link might be expired or already used.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border border-border/50">
            <ShieldCheck
              className="w-6 h-6 text-foreground"
              strokeWidth={1.5}
            />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Complete Registration
        </CardTitle>
        <CardDescription>
          Secure your account by registering this device as a biometric passkey.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {verifying ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">
              Verifying link...
            </p>
          </div>
        ) : (
          <>
            {!success && (
              <Button
                onClick={handleRegister}
                disabled={loading || !!error}
                className="w-full font-semibold"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <ShieldCheck className="w-4 h-4 mr-2" />
                )}
                {loading ? "Processing..." : "Register Device"}
              </Button>
            )}

            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2 text-xs font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="py-2 border-emerald-500/50 text-emerald-500 bg-emerald-500/10">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription className="ml-2 text-xs font-medium">
                  {success}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>

      {!success && !error && !verifying && (
        <CardFooter className="flex flex-col gap-2 text-center text-xs text-muted-foreground tracking-wider font-semibold">
          Hardware-Backed Security Protocol
        </CardFooter>
      )}
    </Card>
  );
}

export default function WebAuthnRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">
            Loading...
          </p>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
