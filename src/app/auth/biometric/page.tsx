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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import { startAuthentication } from "@simplewebauthn/browser";
import { useForm } from "@tanstack/react-form";
import { AlertCircle, CheckCircle2, Fingerprint, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Mode = "login" | "register";

export default function BiometricAuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setSuccess(null);

      if (mode === "login") {
        try {
          const { data: options } = await api.post(
            "/auth/webauthn/login/options",
            {
              email: value.email,
            },
            { withCredentials: true },
          );
          const credential = await startAuthentication(options);
          const { data: result } = await api.post(
            "/auth/webauthn/login/verify",
            { credential },
            { withCredentials: true },
          );

          if (result) {
            setSuccess("Biometric verified. Redirecting...");
            router.push("/dashboard");
          }
        } catch (err: any) {
          setError(
            err.response?.data?.message || "Biometric assertion failed.",
          );
        }
      } else {
        try {
          await api.post("/auth/webauthn/register/start", {
            email: value.email,
          });
          setSuccess("Registration link dispatched to your inbox.");
        } catch (err: any) {
          setError("Failed to initiate registration.");
        }
      }
    },
  });

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-muted p-1 rounded-lg inline-flex">
            <button
              onClick={() => {
                setMode("login");
                setError(null);
                setSuccess(null);
              }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setMode("register");
                setError(null);
                setSuccess(null);
              }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === "register"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Register
            </button>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {mode === "login" ? "Biometric Access" : "Secure Setup"}
        </CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Hardware-backed identity verification."
            : "Initialize passkey credential pairing."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="email"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Identity ID</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="name@example.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="bg-background/50"
                />
              </div>
            )}
          />

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

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                className="w-full font-semibold"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : mode === "login" ? (
                  <Fingerprint className="w-4 h-4 mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                {isSubmitting
                  ? "Processing..."
                  : mode === "login"
                    ? "Authorize Session"
                    : "Send Secure Link"}
              </Button>
            )}
          />
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-center text-xs text-muted-foreground">
        WebAuthn L3 Compliant Secure Protocol
      </CardFooter>
    </Card>
  );
}
