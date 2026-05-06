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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import { useForm } from "@tanstack/react-form";
import { AlertCircle, Loader2, LogIn, Shield, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PasswordAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);
      const endpoint = isLogin
        ? "/auth/password/login"
        : "/auth/password/register";
      try {
        const response = await api.post(endpoint, value);
        if (response.data?.requiresMfa) {
          setPendingCredentials(value);
          setMfaRequired(true);
        } else if (response.data) {
          router.push("/dashboard");
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            "Authentication process failed. Please try again.",
        );
      }
    },
  });

  const handleMfaSubmit = async () => {
    if (!pendingCredentials || totpCode.length !== 6) return;
    setMfaLoading(true);
    setError(null);
    try {
      await api.post("/auth/password/login", {
        ...pendingCredentials,
        totpCode,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Invalid authentication code. Please try again.",
      );
      setTotpCode("");
    } finally {
      setMfaLoading(false);
    }
  };

  if (mfaRequired) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
              <Shield className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={totpCode}
              onChange={setTotpCode}
              onComplete={handleMfaSubmit}
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

          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2 text-xs font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full font-semibold"
            onClick={handleMfaSubmit}
            disabled={totpCode.length !== 6 || mfaLoading}
          >
            {mfaLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Shield className="w-4 h-4 mr-2" />
            )}
            {mfaLoading ? "Verifying..." : "Verify Code"}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-muted-foreground text-sm"
            onClick={() => {
              setMfaRequired(false);
              setPendingCredentials(null);
              setTotpCode("");
              setError(null);
            }}
          >
            Back to login
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center text-xs text-muted-foreground">
          Open your authenticator app to get the code
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-muted p-1 rounded-lg inline-flex">
            <button
              onClick={() => {
                setIsLogin(true);
                setError(null);
              }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                isLogin
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError(null);
              }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                !isLogin
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Register
            </button>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {isLogin ? "Welcome back" : "Create an account"}
        </CardTitle>
        <CardDescription>
          {isLogin
            ? "Enter your credentials to access your account"
            : "Enter your email below to create your account"}
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
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="m@example.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="bg-background/50"
                />
              </div>
            )}
          />

          <form.Field
            name="password"
            children={(field) => (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor={field.name}>Password</Label>
                  {isLogin && (
                    <Link
                      href="#"
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  placeholder="••••••••"
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
                ) : isLogin ? (
                  <LogIn className="w-4 h-4 mr-2" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                {isSubmitting
                  ? "Processing..."
                  : isLogin
                    ? "Sign In"
                    : "Create Account"}
              </Button>
            )}
          />
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-center text-xs text-muted-foreground">
        Secure Password-Based Authentication
      </CardFooter>
    </Card>
  );
}
